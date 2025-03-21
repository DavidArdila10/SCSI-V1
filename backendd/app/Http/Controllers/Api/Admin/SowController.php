<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Sow;
use App\Models\SowByUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SowController extends Controller
{
    public function index(Request $request)
{
    try {
        $query = Sow::query();

        // Aplicar filtros correctamente
        if ($request->filled('searchTerm')) {
            $searchTerm = $request->input('searchTerm');
            $query->where(function ($q) use ($searchTerm) {
                $q->where('ticket_sow', 'like', "{$searchTerm}%")
                  ->orWhere('project_id', 'like', "{$searchTerm}%")
                  ->orWhere('ticket_date', 'like', "{$searchTerm}%");
            });
        }

        if ($request->filled('clientSearch')) {
            $query->where('account_name', 'like', "{$request->input('clientSearch')}%");
        }

        if ($request->filled('teamSearch')) {
            $query->where('delivery_team', 'like', "{$request->input('teamSearch')}%");
        }

        if ($request->filled('statusSearch')) {
            $query->where('sow_status', '=', $request->input('statusSearch'));
        }

        if ($request->filled('startDate') && $request->filled('endDate')) {
            $query->whereBetween('ticket_date', [$request->input('startDate'), $request->input('endDate')]);
        }

        $perPage = 25;
        $data = $query->paginate($perPage);

        return response()->json($data, 200);

    } catch (\Exception $e) {
        Log::error("Error en SowController@index: " . $e->getMessage());
        return response()->json(['error' => 'Internal Server Error'], 500);
    }
}
public function store(Request $request)
{
    $data = $request->all();
    
    if (!is_array($data) || empty($data)) {
        return response()->json(['error' => 'No hay datos para insertar'], 400);
    }

    DB::beginTransaction();
    
    try {
        foreach ($data as $index => $row) {
            if ($index === 0) continue; // Ignorar la primera fila (encabezado)
            Log::info('Insertando fila en la base de datos', ['fila' => $row]);

            Sow::create([
                'ticket_sow' => $row['ticket_sow'] ?? null,
                'cls' => $row['cls'] ?? null,
                'opportunity_name' => $row['opportunity_name'] ?? null,
                'opportunity_id' => $row['opportunity_id'] ?? null,
                'account_name' => $row['account_name'] ?? null,
                'delivery_team' => $row['delivery_team'] ?? null,
                'ticket_date' => $row['ticket_date'] ?? null,
                'sow_description' => $row['sow_description'] ?? null,
                'priority' => $row['priority'] ?? null,
                'sow_due_date' => $row['sow_due_date'] ?? null,
                'effort_due_date' => $row['effort_due_date'] ?? null,
                'project_id' => $row['project_id'] ?? null,
                'sow_owner' => $row['sow_owner'] ?? null,
                'sow_status' => $row['sow_status'] ?? null,
                'sow_delivery_date' => $row['sow_delivery_date'] ?? null,
                'effort_owner' => $row['effort_owner'] ?? null,
                'effort_status' => $row['effort_status'] ?? null,
                'effort_delivery_date' => $row['effort_delivery_date'] ?? null,
                'comments' => $row['comments'] ?? null,
                'sow_link' => $row['sow_link'] ?? null,
                'effort_link' => $row['effort_link'] ?? null,
                'create_at' => $row['create_at'] ?? now(),
            ]);
        }
        
        DB::commit();
        Log::info('Todos los datos han sido insertados correctamente');
        return response()->json(['message' => 'Datos insertados correctamente'], 201);
    } catch (\Exception $e) {
        DB::rollBack();
        Log::error('Error al insertar datos: ' . $e->getMessage());
        return response()->json(['error' => 'Ocurrió un error al insertar los datos'], 500);
    }
}





    public function create(Request $request)
    {
        $validatedData = $request->validate([
            'ticket_sow' => 'required|string|unique:sows,ticket_sow',
            'sow_description' => 'required|string',
            'project_id' => 'nullable|string',
            'account_name' => 'nullable|string|max:200',
            'delivery_team' => 'required|string',
            'create_at' => 'nullable|date',
            'ticket_date' => 'required|date',
            'cls' => 'nullable|string',
            'opportunity_name' => 'nullable|string',
            'opportunity_id' => 'nullable|string|max:255',
            'priority' => 'nullable|in:low,medium,high',
            'sow_due_date' => 'nullable|date',
            'effort_due_date' => 'nullable|date',
            'sow_owner' => 'nullable|string|max:255',
            'sow_status' => 'required|in:new,in_progress,closed,blocked,cancelled',
            'sow_delivery_date' => 'nullable|date',
            'effort_owner' => 'nullable|string|max:100',
            'effort_status' => 'nullable|in:in_progress,not_started,delivered,cancelled',
            'effort_delivery_date' => 'nullable|date',
            'comments' => 'nullable|string',
            'sow_link' => 'nullable|url',
            'effort_link' => 'nullable|url'
        ]);

        DB::beginTransaction();

        try {
            $sow = Sow::create($validatedData);
            $user = auth()->user();

            SowByUser::create([
                'sow_id' => $sow->ticket_sow,
                'created_by' => $user->id,
                'user_name' => $user->name,
                'created_at' => now(),
            ]);

            DB::commit();

            return response()->json($sow, 200);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al crear el registro: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create sow'], 500);
        }
    }

    public function show($id)
    {
        $data = Sow::find($id);
        if (!$data) {
            return response()->json(['error' => 'Sow not found'], 404);
        }
        return response()->json($data, 200);
    }

    public function update(Request $request, $id)
    {
        $data = Sow::find($id);
        if (!$data) {
            return response()->json(['error' => 'Sow not found'], 404);
        }

        $data->fill($request->all());
        $data->save();
        return response()->json($data, 200);
    }

    public function destroy($id)
    {
        $data = Sow::find($id);
        if (!$data) {
            return response()->json(['error' => 'Sow not found'], 404);
        }

        $data->delete();
        return response()->json(['message' => 'Deleted successfully'], 200);
    }

    public function search(Request $request)
    {
        $startDate = $request->query('startDate');
        $endDate = $request->query('endDate');

        if (!$startDate || !$endDate) {
            return response()->json(['error' => 'Missing date parameters'], 400);
        }

        try {
            $query = Sow::whereBetween('ticket_date', [$startDate, $endDate])
                        ->orderBy('ticket_date');

            if ($request->filled('statusSearch')) {
                $query->where('sow_status', $request->input('statusSearch')); // Usa índice compuesto
            }

            $sows = $query->select(['ticket_sow', 'project_id', 'ticket_date', 'sow_description', 'sow_status'])->get();

            return response()->json($sows, 200);
        } catch (\Exception $e) {
            Log::error("Error during search: " . $e->getMessage());
            return response()->json(['error' => 'An error occurred while searching'], 500);
        }
    }

    public function getAll()
    {
        try {
            $sows = Sow::orderBy('sow_status')->get();
            return response()->json($sows, 200);
        } catch (\Exception $e) {
            Log::error("Error en getAll SOWs: " . $e->getMessage());
            return response()->json(['error' => 'Internal Server Error'], 500);
        }
    }
    

    public function getEnumOptions($field)
    {
        $table = 'sows';
        $column = DB::select("SHOW COLUMNS FROM `{$table}` WHERE Field = ?", [$field])[0];
        $type = $column->Type;

        if (strpos($type, 'enum') === false) {
            return response()->json(['error' => 'El campo no es de tipo enum'], 400);
        }

        preg_match('/^enum\((.*)\)$/', $type, $matches);
        $enum = [];
        foreach (explode(',', $matches[1]) as $value) {
            $enum[] = trim($value, "'");
        }

        return response()->json($enum);
    }

    public function getCreatorInfo($ticket_sow)
    {
        $sowByUser = SowByUser::where('sow_id', $ticket_sow)->first();

        if (!$sowByUser) {
            return response()->json(['error' => 'Registro no encontrado'], 404);
        }

        return response()->json([
            'sow_id' => $sowByUser->sow_id,
            'created_by' => $sowByUser->created_by,
            'user_name' => $sowByUser->user_name,
            'created_at' => $sowByUser->created_at,
        ], 200);
    }

    public function countState()
    {
        $count = Sow::select("sow_status", DB::raw("COUNT(*) as total"))
                    ->groupBy("sow_status")
                    ->orderBy("sow_status")
                    ->get();

        return response()->json($count);
    }

    public function countTotalSows()
    {
        $total = Sow::count();
        return response()->json(['total' => $total]);
    }
}