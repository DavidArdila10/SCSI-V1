<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\GoogleSheetsService;
use App\Models\Sow;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class GoogleSheetsSyncController extends Controller
{
    protected $googleSheetsService;

    public function __construct(GoogleSheetsService $googleSheetsService)
    {
        $this->googleSheetsService = $googleSheetsService;
    }

    public function sync()
    {
        Log::info("🔄 Iniciando sincronización desde Google Sheets...");

        // Obtener datos desde Google Sheets
        $data = $this->googleSheetsService->readSheet();
        Log::info("📊 Datos obtenidos en Controller: " . json_encode(["data" => $data]));

        if (empty($data) || !isset($data[0])) {
            Log::warning("⚠️ No se recibieron datos desde Google Sheets en Controller.");
            return response()->json([
                "error" => "Error al sincronizar",
                "details" => "No se recibieron datos desde Google Sheets."
            ], 500);
        }

        // Extraer encabezados
        $headers = array_map('strtolower', $data[0]); // Convertir encabezados a minúsculas
        unset($data[0]); // Eliminar la primera fila de encabezados

        $registrosProcesados = 0;
        $errores = [];

        DB::beginTransaction();
        try {
            foreach ($data as $row) {
                if (count(array_filter($row)) === 0) {
                    Log::warning("⚠️ Fila con datos vacíos detectada y omitida: " . json_encode(["row" => $row]));
                    continue;
                }

                // ✅ Manejar `priority` para que acepte `NULL`
                $priority = !empty($row[8]) ? strtolower(trim($row[8])) : null;

                // ✅ Validar y formatear fechas correctamente
                $ticketDate = $this->formatDate($row[6] ?? null);
                $sowDueDate = $this->formatDate($row[9] ?? null);
                $effortDueDate = $this->formatDate($row[10] ?? null);
                $sowDeliveryDate = $this->formatDate($row[14] ?? null);
                $effortDeliveryDate = $this->formatDate($row[17] ?? null);

                // Crear el array de inserción
                $sowData = [
                    "ticket_sow" => $row[0] ?? null,
                    "cls" => $row[1] ?? null,
                    "opportunity_name" => $row[2] ?? null,
                    "opportunity_id" => $row[3] ?? null,
                    "account_name" => $row[4] ?? null,
                    "delivery_team" => $row[5] ?? null,
                    "ticket_date" => $ticketDate,
                    "sow_description" => $row[7] ?? null,
                    "priority" => $priority,
                    "sow_due_date" => $sowDueDate,
                    "effort_due_date" => $effortDueDate,
                    "project_id" => $row[11] ?? null,
                    "sow_owner" => $row[12] ?? null,
                    "sow_status" => $row[13] ?? null,
                    "sow_delivery_date" => $sowDeliveryDate,
                    "effort_owner" => $row[15] ?? null,
                    "effort_status" => $row[16] ?? null,
                    "effort_delivery_date" => $effortDeliveryDate,
                    "comments" => $row[18] ?? null,
                    "sow_link" => $row[19] ?? null,
                    "effort_link" => $row[20] ?? null,
                    "create_at" => now(),
                ];

                Log::info("📌 Insertando SOW en BD: " . json_encode($sowData));

                // Intentar insertar en la base de datos
                try {
                    Sow::updateOrCreate(
                        ['ticket_sow' => $sowData['ticket_sow']], // Clave única
                        $sowData
                    );
                    $registrosProcesados++;
                } catch (\Exception $e) {
                    Log::error("❌ Error insertando fila: " . json_encode(["row" => $row, "error" => $e->getMessage()]));
                    $errores[] = $e->getMessage();
                }
            }

            DB::commit();
            Log::info("✅ Sincronización completada exitosamente con {$registrosProcesados} registros procesados.");

            return response()->json([
                "message" => "Sincronización completada",
                "processed" => $registrosProcesados,
                "errors" => $errores
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("❌ ERROR en sincronización: " . $e->getMessage());
            return response()->json([
                "error" => "Error al sincronizar",
                "details" => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Convierte una fecha de formato mm/dd/yyyy a yyyy-mm-dd
     */
    private function formatDate($dateString)
    {
        if (empty($dateString) || $dateString == '') {
            return null;
        }

        try {
            return Carbon::createFromFormat('m/d/Y', $dateString)->format('Y-m-d');
        } catch (\Exception $e) {
            Log::warning("⚠️ Formato de fecha inválido detectado y omitido: " . json_encode($dateString));
            return null;
        }
    }
}
