<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Http\Controllers\Api\Admin\GoogleSheetsSyncController;
use Illuminate\Support\Facades\Log;

class SyncGoogleSheets extends Command
{
    protected $signature = 'sync:sheets';
    protected $description = 'Sincroniza datos desde Google Sheets 3 veces al día (6 AM, 12 PM, 6 PM)';

    public function handle()
    {
        Log::info("🟢 [INFO] Proceso de sincronización automática iniciado...");

        try {
            $controller = app(GoogleSheetsSyncController::class);
            $hora_actual = now()->format('H:i');

            Log::info("🕒 [INFO] Hora actual: $hora_actual");

            // Horarios permitidos para sincronizar
            $horarios_permitidos = ['06:00', '12:00', '18:00'];

            if (in_array($hora_actual, $horarios_permitidos)) {
                Log::info("🔄 [INFO] Ejecutando sincronización automática...");
                $controller->sync();
                Log::info("✅ [INFO] Sincronización completada a las $hora_actual.");
            } else {
                Log::info("⏳ [INFO] No es hora de sincronizar, proceso finalizado.");
            }
        } catch (\Throwable $e) {
            Log::error("❌ [ERROR] Sincronización fallida: " . $e->getMessage());
        }

        Log::info("🚀 [INFO] Finalizando ejecución del comando.");
    }
}
