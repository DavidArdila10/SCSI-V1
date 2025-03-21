<?php

namespace App\Services;

use Google\Client;
use Google\Service\Sheets;
use Illuminate\Support\Facades\Log;

class GoogleSheetsService
{
    protected $client;
    protected $service;
    protected $spreadsheetId;

    public function __construct()
    {
        try {
            // 📢 LOG: Iniciando Google Sheets Service
            Log::info("🔄 Iniciando conexión con Google Sheets...");

            // 📌 Cargar Spreadsheet ID desde .env
            $this->spreadsheetId = env('GOOGLE_SHEETS_ID');

            if (!$this->spreadsheetId) {
                throw new \Exception("❌ No se encontró GOOGLE_SHEETS_ID en .env");
            }

            // 🔹 Configurar Google Client
            $this->client = new Client();
            $this->client->setApplicationName("Laravel Google Sheets Integration");
            $this->client->setScopes([Sheets::SPREADSHEETS]);
            $this->client->setAuthConfig(storage_path('app/google-sheets.json'));
            $this->client->setAccessType('offline');

            // 🔹 Inicializar Google Sheets Service
            $this->service = new Sheets($this->client);

            // 📢 LOG: Conexión exitosa
            Log::info("✅ Conexión con Google Sheets establecida correctamente.");

        } catch (\Exception $e) {
            Log::error("❌ ERROR en GoogleSheetsService: " . $e->getMessage());
        }
    }

    // 🔍 Leer datos desde Google Sheets
    public function readSheet($range = 'Sheet1!A1:Z900')
    {
        try {
            // 📢 LOG: Intentando obtener datos desde Google Sheets
            Log::info("📊 Solicitando datos desde Google Sheets en rango: $range");

            // 🔹 Obtener los datos
            $response = $this->service->spreadsheets_values->get($this->spreadsheetId, $range);
            $values = $response->getValues();

            // 📢 LOG: Datos obtenidos
            Log::info("📊 Datos obtenidos desde Google Sheets:", ['data' => $values]);

            // 🔎 Validación: Si no hay datos, devolver array vacío
            if (empty($values)) {
                Log::warning("⚠️ No se recibieron datos desde Google Sheets.");
                return [];
            }

            return $values;

        } catch (\Exception $e) {
            // ❌ Manejo de errores
            Log::error("❌ ERROR al leer Google Sheets: " . $e->getMessage());
            return [];
        }
    }
}
