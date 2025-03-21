<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Cronometro;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CronometroController extends Controller
{
    /**
     * Listar todos los cronómetros.
     * Ajustamos el tiempo en ejecución para que no se reinicie.
     */
    public function index()
    {
        $perPage = 20;
        $data = Cronometro::orderBy('id')->paginate($perPage);

        foreach ($data->items() as $cronometro) {
            // TE
            if ($cronometro->is_running_te) {
                $this->ajustarTiempoTranscurrido($cronometro, 'te');
            }
            // TPC
            if ($cronometro->is_running_tpc) {
                $this->ajustarTiempoTranscurrido($cronometro, 'tpc');
            }
            // TPI
            if ($cronometro->is_running_tpi) {
                $this->ajustarTiempoTranscurrido($cronometro, 'tpi');
            }
        }

        return response()->json($data, 200);
    }

    /**
     * Mostrar un cronómetro específico.
     * Igualmente, ajustamos el tiempo si está corriendo.
     */
    public function show($id)
    {
        $cronometro = Cronometro::find($id);

        if (!$cronometro) {
            return response()->json(['message' => 'Cronómetro no encontrado'], 404);
        }

        if ($cronometro->is_running_te) {
            $this->ajustarTiempoTranscurrido($cronometro, 'te');
        }
        if ($cronometro->is_running_tpc) {
            $this->ajustarTiempoTranscurrido($cronometro, 'tpc');
        }
        if ($cronometro->is_running_tpi) {
            $this->ajustarTiempoTranscurrido($cronometro, 'tpi');
        }

        return response()->json($cronometro, 200);
    }

    /**
     * Crear un nuevo cronómetro.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'PM' => 'required|string|max:100',
            'PM_assigned' => 'nullable|string|max:50',
            'description' => 'nullable|string|max:250',
            'EAC' => 'nullable|string|max:100',
            'ETC' => 'nullable|string|max:100',
            'STATUS' => 'nullable|in:CANCELLED,DELIVERED',
            'TE' => 'nullable|numeric',
            'TPC' => 'nullable|numeric',
            'TPI' => 'nullable|numeric',
            'date' => 'nullable|date',
            'start_date' => 'nullable|date',
            'accumulated_hours' => 'nullable|numeric',
            'accumulated_days' => 'nullable|integer',
            'is_active' => 'nullable|boolean',

            'is_running_te' => 'nullable|boolean',
            'is_running_tpc' => 'nullable|boolean',
            'is_running_tpi' => 'nullable|boolean',

            // Cambiamos a 'integer' en lugar de 'numeric'
            'elapsed_te' => 'sometimes|nullable|integer',
            'elapsed_tpc' => 'sometimes|nullable|integer',
            'elapsed_tpi' => 'sometimes|nullable|integer',
        ]);

        $validatedData['elapsed_te'] = $validatedData['elapsed_te'] ?? 0;
        $validatedData['elapsed_tpc'] = $validatedData['elapsed_tpc'] ?? 0;
        $validatedData['elapsed_tpi'] = $validatedData['elapsed_tpi'] ?? 0;

        if (!empty($validatedData['is_running_te'])) {
            $validatedData['last_updated_te'] = now();
        }
        if (!empty($validatedData['is_running_tpc'])) {
            $validatedData['last_updated_tpc'] = now();
        }
        if (!empty($validatedData['is_running_tpi'])) {
            $validatedData['last_updated_tpi'] = now();
        }

        DB::beginTransaction();
        try {
            $cronometro = Cronometro::create($validatedData);
            DB::commit();
            return response()->json($cronometro, 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al crear cronómetro: ' . $e->getMessage(), [
                'exception' => $e,
                'request_data' => $request->all(),
            ]);
            return response()->json(['error' => 'Error al crear el cronómetro'], 500);
        }
    }

    /**
     * Actualizar un cronómetro existente.
     */
    public function update(Request $request, $id)
    {
        $cronometro = Cronometro::find($id);

        if (!$cronometro) {
            return response()->json(['message' => 'Cronómetro no encontrado'], 404);
        }

        $validatedData = $request->validate([
            'PM' => 'sometimes|nullable|string|max:100',
            'PM_assigned' => 'sometimes|nullable|string|max:50',
            'description' => 'sometimes|nullable|string|max:250',
            'EAC' => 'sometimes|nullable|string|max:100',
            'ETC' => 'sometimes|nullable|string|max:100',
            'STATUS' => 'sometimes|nullable|in:CANCELLED,DELIVERED',
            'TE' => 'sometimes|nullable|numeric',
            'TPC' => 'sometimes|nullable|numeric',
            'TPI' => 'sometimes|nullable|numeric',
            'date' => 'sometimes|nullable|date',
            'start_date' => 'sometimes|nullable|date',
            'accumulated_hours' => 'sometimes|nullable|numeric',
            'accumulated_days' => 'sometimes|nullable|integer',
            'is_active' => 'sometimes|nullable|boolean',

            'is_running_te' => 'sometimes|nullable|boolean',
            'is_running_tpc' => 'sometimes|nullable|boolean',
            'is_running_tpi' => 'sometimes|nullable|boolean',

            // OJO: integer
            'elapsed_te' => 'sometimes|nullable|integer',
            'elapsed_tpc' => 'sometimes|nullable|integer',
            'elapsed_tpi' => 'sometimes|nullable|integer',
        ]);

        DB::beginTransaction();
        try {
            // Revisamos si se envía is_running_te
            if (array_key_exists('is_running_te', $validatedData)) {
                $nuevo = $validatedData['is_running_te'];
                $antes = $cronometro->is_running_te;
                if (!$antes && $nuevo) {
                    $validatedData['last_updated_te'] = now();
                }
                if ($antes && !$nuevo) {
                    $validatedData['last_updated_te'] = null;
                }
            }

            // is_running_tpc
            if (array_key_exists('is_running_tpc', $validatedData)) {
                $nuevo = $validatedData['is_running_tpc'];
                $antes = $cronometro->is_running_tpc;
                if (!$antes && $nuevo) {
                    $validatedData['last_updated_tpc'] = now();
                }
                if ($antes && !$nuevo) {
                    $validatedData['last_updated_tpc'] = null;
                }
            }

            // is_running_tpi
            if (array_key_exists('is_running_tpi', $validatedData)) {
                $nuevo = $validatedData['is_running_tpi'];
                $antes = $cronometro->is_running_tpi;
                if (!$antes && $nuevo) {
                    $validatedData['last_updated_tpi'] = now();
                }
                if ($antes && !$nuevo) {
                    $validatedData['last_updated_tpi'] = null;
                }
            }

            $cronometro->update($validatedData);
            DB::commit();
            return response()->json($cronometro, 200);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al actualizar cronómetro: ' . $e->getMessage(), [
                'exception' => $e,
                'request_data' => $request->all(),
            ]);
            return response()->json(['error' => 'Error al actualizar el cronómetro'], 500);
        }
    }

    /**
     * Actualizar solo el tiempo transcurrido de un cronómetro (Opción 2).
     * Acepta también is_running_xxx y last_updated_xxx.
     */
    public function updateElapsedTime(Request $request, $id)
    {
        $cronometro = Cronometro::find($id);

        if (!$cronometro) {
            return response()->json(['message' => 'Cronómetro no encontrado'], 404);
        }

        // Permitimos booleans + last_updated_xxx + elapsed_xxx
        $validatedData = $request->validate([
            'elapsed_te' => 'nullable|integer',
            'elapsed_tpc' => 'nullable|integer',
            'elapsed_tpi' => 'nullable|integer',

            'is_running_te' => 'sometimes|boolean',
            'is_running_tpc' => 'sometimes|boolean',
            'is_running_tpi' => 'sometimes|boolean',

            'last_updated_te' => 'sometimes|nullable|date',
            'last_updated_tpc' => 'sometimes|nullable|date',
            'last_updated_tpi' => 'sometimes|nullable|date',
        ]);

        DB::beginTransaction();
        try {
            // Manejo explícito is_running_te
            if (array_key_exists('is_running_te', $validatedData)) {
                $nuevo = $validatedData['is_running_te'];
                $antes = $cronometro->is_running_te;

                if (!$antes && $nuevo) {
                    // De false -> true
                    $cronometro->last_updated_te = now();
                }
                if ($antes && !$nuevo) {
                    // De true -> false
                    $cronometro->last_updated_te = null;
                }
                $cronometro->is_running_te = $nuevo;
                unset($validatedData['is_running_te']);
            }

            // Manejo explícito is_running_tpc
            if (array_key_exists('is_running_tpc', $validatedData)) {
                $nuevo = $validatedData['is_running_tpc'];
                $antes = $cronometro->is_running_tpc;

                if (!$antes && $nuevo) {
                    $cronometro->last_updated_tpc = now();
                }
                if ($antes && !$nuevo) {
                    $cronometro->last_updated_tpc = null;
                }
                $cronometro->is_running_tpc = $nuevo;
                unset($validatedData['is_running_tpc']);
            }

            // Manejo explícito is_running_tpi
            if (array_key_exists('is_running_tpi', $validatedData)) {
                $nuevo = $validatedData['is_running_tpi'];
                $antes = $cronometro->is_running_tpi;

                if (!$antes && $nuevo) {
                    $cronometro->last_updated_tpi = now();
                }
                if ($antes && !$nuevo) {
                    $cronometro->last_updated_tpi = null;
                }
                $cronometro->is_running_tpi = $nuevo;
                unset($validatedData['is_running_tpi']);
            }

            // Actualizamos los demás campos (elapsed_xxx, last_updated_xxx si vienen)
            $cronometro->update($validatedData);

            DB::commit();
            return response()->json($cronometro, 200);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al actualizar el tiempo transcurrido: ' . $e->getMessage(), [
                'exception' => $e,
                'request_data' => $request->all(),
            ]);
            return response()->json(['error' => 'Error al actualizar el tiempo transcurrido'], 500);
        }
    }

    /**
     * Eliminar un cronómetro.
     */
    public function destroy($id)
    {
        $cronometro = Cronometro::find($id);

        if (!$cronometro) {
            return response()->json(['message' => 'Cronómetro no encontrado'], 404);
        }

        try {
            $cronometro->delete();
            return response()->json(['message' => 'Cronómetro eliminado correctamente'], 200);
        } catch (\Exception $e) {
            Log::error('Error al eliminar cronómetro: ' . $e->getMessage());
            return response()->json(['error' => 'Error al eliminar el cronómetro'], 500);
        }
    }

    /**
     * Buscar cronómetros por rango de fechas.
     */
    /**
 * Buscar cronómetros por rango de fechas.
 */
public function search(Request $request)
{
    $date = $request->query('date');
    $startDate = $request->query('startDate');
    $endDate = $request->query('endDate');

    if ($date) {
        // Búsqueda por una fecha específica
        $cronometros = Cronometro::whereDate('date', $date)->get();
    } elseif ($startDate && $endDate) {
        // Búsqueda por rango de fechas
        $cronometros = Cronometro::whereBetween('date', [$startDate, $endDate])->get();
    } else {
        return response()->json(['error' => 'Debe proporcionar una fecha o un rango de fechas'], 400);
    }

    \Log::info('Fecha recibida en la búsqueda:', ['date' => $request->query('date')]);

    if ($cronometros->isEmpty()) {
        return response()->json(['message' => 'Cronómetro no encontrado'], 404);
    }

    return response()->json($cronometros, 200);
}

/**
 * Obtener información del creador de un cronómetro.
 */
public function getCreatorInfo($id)
{
    $cronometro = Cronometro::find($id);

    if (!$cronometro) {
        return response()->json(['error' => 'Cronómetro no encontrado'], 404);
    }

    $creatorInfo = [
        'user_name' => 'Autor Prueba',
        'created_at' => $cronometro->created_at,
    ];

    return response()->json($creatorInfo, 200);
}

/**
 * (Nuevo) Buscar cronómetros por PM_assigned.
 * Si no se proporciona valor, retorna un error 400.
 */
public function searchByPMAssigned(Request $request)
{
    $pmAssigned = $request->query('PM_assigned');

    if (!$pmAssigned) {
        return response()->json(['error' => 'Debe proporcionar PM_assigned'], 400);
    }

    $cronometros = Cronometro::where('PM_assigned', 'like', '%' . $pmAssigned . '%')->get();

    if ($cronometros->isEmpty()) {
        return response()->json(['message' => 'No se encontraron cronómetros con ese PM_assigned'], 404);
    }

    return response()->json($cronometros, 200);
}


    /**
     * Ajustar tiempo transcurrido si el cronómetro está corriendo
     */
    private function ajustarTiempoTranscurrido(Cronometro $cronometro, string $field)
    {
        $elapsedAttr = "elapsed_{$field}";      // e.g. "elapsed_te"
        $lastUpdatedAttr = "last_updated_{$field}"; // e.g. "last_updated_te"

        if (!$cronometro->$lastUpdatedAttr) {
            // Si está corriendo pero no tiene last_updated, lo ponemos a now()
            $cronometro->$lastUpdatedAttr = now();
            $cronometro->save();
            return;
        }

        $lastTimestamp = $cronometro->$lastUpdatedAttr->timestamp;
        $nowTimestamp = now()->timestamp;
        $diff = $nowTimestamp - $lastTimestamp;
        if ($diff < 0) {
            $diff = 0;
        }

        if ($diff > 0) {
            $cronometro->$elapsedAttr += $diff;
            $cronometro->$lastUpdatedAttr = now();
            $cronometro->save();
        }
    }
}