<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Sow;
use App\Models\Cronometro; // <-- Este es tu modelo para la tabla PM
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class ImportController extends Controller
{
    public function importSows(Request $request)
    {
        // Iniciar log para ver si la solicitud llega correctamente
        Log::info('Solicitud de importación recibida', ['data' => $request->all()]);

        $data = $request->all();

        // Validar que los datos no estén vacíos
        if (!is_array($data) || empty($data)) {
            Log::error('No hay datos en la solicitud para importar.');
            return response()->json(['error' => 'No hay datos para insertar'], 400);
        }

        DB::beginTransaction();
        DB::enableQueryLog();

        try {
            foreach ($data as $index => $row) {
                Log::info("Procesando fila $index", $row);

                /* ----------------------------------------------------------------
                   1) Si la fila tiene "ticket_sow", asumimos que es SOW
                ----------------------------------------------------------------- */
                if (!empty($row['ticket_sow'])) {

                    // **Convertir `ticket_date` a formato `Y-m-d` antes de validar**
                    if (!empty($row['ticket_date'])) {
                        try {
                            $row['ticket_date'] = date('Y-m-d', strtotime($row['ticket_date']));
                        } catch (\Exception $e) {
                            Log::error("Error en la conversión de fecha en la fila $index", ['ticket_date' => $row['ticket_date']]);
                            return response()->json([
                                'error' => "Formato de fecha incorrecto en la fila $index",
                                'detalles' => ['ticket_date' => ["La fecha '{$row['ticket_date']}' no es válida. Formato esperado: YYYY-MM-DD"]]
                            ], 422);
                        }
                    }

                    // **Validar los datos para SOW**
                    $validator = Validator::make($row, [
                        'ticket_sow'     => 'required|string',
                        'ticket_date'    => 'required|date_format:Y-m-d',
                        'delivery_team'  => 'required|string',
                        'sow_description'=> 'required|string',
                        'sow_status'     => 'required|in:new,in_progress,closed,blocked,cancelled',
                    ]);

                    if ($validator->fails()) {
                        Log::error("Error de validación en la fila $index", $validator->errors()->toArray());
                        return response()->json([
                            'error' => 'Error en validación de datos',
                            'detalles' => $validator->errors()
                        ], 422);
                    }

                    // **Buscar si el SOW ya existe**
                    $existingSow = Sow::where('ticket_sow', $row['ticket_sow'])->first();

                    if ($existingSow) {
                        Log::info("El SOW con ticket_sow {$row['ticket_sow']} ya existe. Actualizando registro...");

                        $existingSow->update([
                            'cls'                  => $row['cls'] ?? $existingSow->cls,
                            'opportunity_name'     => $row['opportunity_name'] ?? $existingSow->opportunity_name,
                            'opportunity_id'       => $row['opportunity_id'] ?? $existingSow->opportunity_id,
                            'account_name'         => $row['account_name'] ?? $existingSow->account_name,
                            'delivery_team'        => $row['delivery_team'],
                            'ticket_date'          => $row['ticket_date'],
                            'sow_description'      => $row['sow_description'],
                            'priority'             => $row['priority'] ?? $existingSow->priority,
                            'sow_due_date'         => $row['sow_due_date'] ?? $existingSow->sow_due_date,
                            'effort_due_date'      => $row['effort_due_date'] ?? $existingSow->effort_due_date,
                            'project_id'           => $row['project_id'] ?? $existingSow->project_id,
                            'sow_owner'            => $row['sow_owner'] ?? $existingSow->sow_owner,
                            'sow_status'           => $row['sow_status'],
                            'sow_delivery_date'    => $row['sow_delivery_date'] ?? $existingSow->sow_delivery_date,
                            'effort_owner'         => $row['effort_owner'] ?? $existingSow->effort_owner,
                            'effort_status'        => $row['effort_status'] ?? $existingSow->effort_status,
                            'effort_delivery_date' => $row['effort_delivery_date'] ?? $existingSow->effort_delivery_date,
                            'comments'             => $row['comments'] ?? $existingSow->comments,
                            'sow_link'             => $row['sow_link'] ?? $existingSow->sow_link,
                            'effort_link'          => $row['effort_link'] ?? $existingSow->effort_link,
                            'create_at'            => $row['create_at'] ?? $existingSow->create_at,
                        ]);

                        Log::info("SOW con ticket_sow {$row['ticket_sow']} actualizado correctamente.");
                    } else {
                        // **Insertar nuevo SOW**
                        Log::info("Insertando fila $index en la base de datos (SOW)...");

                        Sow::create([
                            'ticket_sow'           => $row['ticket_sow'],
                            'cls'                  => $row['cls'] ?? null,
                            'opportunity_name'     => $row['opportunity_name'] ?? null,
                            'opportunity_id'       => $row['opportunity_id'] ?? null,
                            'account_name'         => $row['account_name'] ?? null,
                            'delivery_team'        => $row['delivery_team'],
                            'ticket_date'          => $row['ticket_date'],
                            'sow_description'      => $row['sow_description'],
                            'priority'             => $row['priority'] ?? null,
                            'sow_due_date'         => $row['sow_due_date'] ?? null,
                            'effort_due_date'      => $row['effort_due_date'] ?? null,
                            'project_id'           => $row['project_id'] ?? null,
                            'sow_owner'            => $row['sow_owner'] ?? null,
                            'sow_status'           => $row['sow_status'],
                            'sow_delivery_date'    => $row['sow_delivery_date'] ?? null,
                            'effort_owner'         => $row['effort_owner'] ?? null,
                            'effort_status'        => $row['effort_status'] ?? null,
                            'effort_delivery_date' => $row['effort_delivery_date'] ?? null,
                            'comments'             => $row['comments'] ?? null,
                            'sow_link'             => $row['sow_link'] ?? null,
                            'effort_link'          => $row['effort_link'] ?? null,
                            'create_at'            => $row['create_at'] ?? now(),
                        ]);

                        Log::info("Fila $index (SOW) insertada correctamente.");
                    }
                }
                /* ----------------------------------------------------------------
                   2) Si no hay ticket_sow, pero viene "PM", interpretamos que es PM
                ----------------------------------------------------------------- */
                elseif (!empty($row['PM'])) {
                    // Validar SOLO PM como obligatorio
                    // El resto (en el orden que pides) son opcionales
                    $validator = Validator::make($row, [
                        'PM'          => 'required|string|max:100',
                        'PM_assigned' => 'nullable|string|max:50',
                        'description' => 'nullable|string|max:250',
                        // "Estimated Completion" => EAC
                        'EAC'         => 'nullable|string|max:100',
                        // "Estimated Time" => ETC
                        'ETC'         => 'nullable|string|max:100',
                        // "Execution Time" => TE
                        'TE'          => 'nullable|numeric',
                        // "Client Break" => TPC
                        'TPC'         => 'nullable|numeric',
                        // "Intraway Break" => TPI
                        'TPI'         => 'nullable|numeric',
                        // "Date" => date
                        'date'        => 'nullable|date',
                        // "Status" => STATUS
                        'STATUS'      => 'nullable|in:CANCELLED,DELIVERED',
                    ]);

                    if ($validator->fails()) {
                        Log::error("Error de validación en la fila $index (PM)", $validator->errors()->toArray());
                        return response()->json([
                            'error'    => "Error de validación (PM) en la fila $index",
                            'detalles' => $validator->errors()
                        ], 422);
                    }

                    // Buscar si existe un registro con el mismo "PM"
                    $existingPm = Cronometro::where('PM', $row['PM'])->first();

                    if ($existingPm) {
                        Log::info("El PM {$row['PM']} ya existe. Actualizando registro...");
                        $existingPm->update([
                            'PM_assigned' => $row['PM_assigned'] ?? $existingPm->PM_assigned,
                            'description' => $row['description']  ?? $existingPm->description,
                            'EAC'         => $row['EAC']          ?? $existingPm->EAC,
                            'ETC'         => $row['ETC']          ?? $existingPm->ETC,
                            'TE'          => $row['TE']           ?? $existingPm->TE,
                            'TPC'         => $row['TPC']          ?? $existingPm->TPC,
                            'TPI'         => $row['TPI']          ?? $existingPm->TPI,
                            'date'        => $row['date']         ?? $existingPm->date,
                            'STATUS'      => $row['STATUS']       ?? $existingPm->STATUS,
                        ]);
                        Log::info("PM {$row['PM']} actualizado correctamente.");
                    } else {
                        // Insertar nuevo PM (en la tabla Cronometro)
                        Log::info("Insertando fila $index en la base de datos (PM)...");
                        Cronometro::create([
                            'PM'          => $row['PM'],
                            'PM_assigned' => $row['PM_assigned'] ?? null,
                            'description' => $row['description'] ?? null,
                            'EAC'         => $row['EAC'] ?? null,
                            'ETC'         => $row['ETC'] ?? null,
                            'TE'          => $row['TE']  ?? null,
                            'TPC'         => $row['TPC'] ?? null,
                            'TPI'         => $row['TPI'] ?? null,
                            'date'        => $row['date'] ?? null,
                            'STATUS'      => $row['STATUS'] ?? null,
                        ]);
                        Log::info("Fila $index (PM) insertada correctamente.");
                    }
                }
                /* ----------------------------------------------------------------
                   3) Si no hay ni ticket_sow ni PM, la fila no se procesa:
                ----------------------------------------------------------------- */
                else {
                    Log::warning("Fila $index sin 'ticket_sow' ni 'PM'. Se omite.");
                    // O podrías retornar un error si deseas:
                    // return response()->json([
                    //   'error' => "Fila $index no contiene ticket_sow ni PM"
                    // ], 422);
                }
            }

            Log::info("Consultas ejecutadas:", ['query' => DB::getQueryLog()]);
            DB::commit();

            return response()->json(['message' => 'Datos importados correctamente'], 201);
        } catch (\Exception $e) {
            Log::error("Error al importar datos: " . $e->getMessage());
            Log::error("Últimas consultas ejecutadas:", DB::getQueryLog());
            DB::rollBack();
            return response()->json([
                'error'    => 'Error al importar datos',
                'detalles' => $e->getMessage()
            ], 500);
        }
    }
}
