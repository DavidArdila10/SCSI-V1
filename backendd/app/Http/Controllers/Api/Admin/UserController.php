<?php 

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    public function index(Request $request) {
        \Log::debug('UserController@index: Ingresando al método index');
        $roleFilter = $request->query('roles');
        \Log::debug('UserController@index: roleFilter = ' . json_encode($roleFilter));

        $query = DB::table('users')
            ->leftJoin('model_has_roles', 'users.id', '=', 'model_has_roles.model_id')
            ->leftJoin('roles', 'model_has_roles.role_id', '=', 'roles.id')
            ->select('users.id', 'users.name', 'users.email',
                DB::raw('GROUP_CONCAT(DISTINCT roles.name) as role_names'))
            ->groupBy('users.id', 'users.name', 'users.email');

        if ($roleFilter) {
            $exploded = explode(',', $roleFilter);
            \Log::debug('UserController@index: Filtrando roles = ' . implode(',', $exploded));
            $query->whereIn('roles.name', $exploded);
        }

        $users = $query->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->role_names ? explode(',', $user->role_names) : [],
            ];
        });
        
        \Log::debug('UserController@index: Cantidad de usuarios encontrados = ' . count($users));

        return response()->json($users, 200);
    }
    
    public function show($id){
        \Log::debug("UserController@show: Buscando usuario por ID = {$id}");
        $data = User::find($id);
        if ($data) {
            \Log::debug("UserController@show: Usuario encontrado: " . $data->name);
        } else {
            \Log::debug("UserController@show: Usuario con ID={$id} no encontrado");
        }
        return response()->json($data, 200);
    }
    
    public function store(Request $request)
    {
        \Log::debug('UserController@store: Datos recibidos', $request->all());
        
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'roles' => 'required|array'
        ]);

        if ($validator->fails()) {
            \Log::debug('UserController@store: Validación fallida', $validator->errors()->toArray());
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            \Log::debug('UserController@store: Creando usuario...');
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);
            \Log::debug("UserController@store: Usuario creado con ID = {$user->id}");

            \Log::debug('UserController@store: Asignando roles = ' . json_encode($request->roles));
            $user->assignRole($request->roles);
            \Log::debug("UserController@store: Roles asignados correctamente");

            return response()->json([
                'success' => true,
                'user' => $user
            ], 201);

        } catch (\Exception $e) {
            \Log::error('UserController@store: Error al crear el usuario: ' . $e->getMessage());
            \Log::error($e->getTraceAsString()); // Para ver la traza completa
            return response()->json([
                'success' => false,
                'message' => 'Error al crear el usuario: ' . $e->getMessage()
            ], 500);
        }
    }
    
    public function update(Request $request, $id)
    {
        \Log::debug("UserController@update: Actualizando usuario con ID={$id}", $request->all());

        $validatedData = $request->validate([
            'name' => 'required|string',
            'email' => 'required|string|email',
            'roles' => 'required|array',
        ]);

        $user = User::findOrFail($id);
        \Log::debug("UserController@update: Usuario encontrado: {$user->name} (ID: {$user->id})");
        
        $user->update([
            'name' => $validatedData['name'],
            'email' => $validatedData['email'],
        ]);
        \Log::debug("UserController@update: Datos básicos actualizados para ID={$id}");

        if (isset($validatedData['roles'])) {
            \Log::debug("UserController@update: Sincronizando roles = " . json_encode($validatedData['roles']));
            $user->syncRoles($validatedData['roles']);
            \Log::debug("UserController@update: Roles sincronizados para ID={$id}");
        }

        return response()->json($user, 200);
    }

    public function destroy($id){
        \Log::debug("UserController@destroy: Eliminando usuario con ID={$id}");
        $data = User::find($id);
        if ($data) {
            $data->delete();
            \Log::debug("UserController@destroy: Usuario con ID={$id} eliminado");
            return response()->json('Usuario eliminado', 200);
        }
        \Log::debug("UserController@destroy: Usuario con ID={$id} no encontrado");
        return response()->json('Usuario no encontrado', 404);
    }

    public function getAllUsersWithRoles() {
        \Log::debug("UserController@getAllUsersWithRoles: Listando todos los usuarios con roles");
        try {
            $users = DB::table('users')
                ->leftJoin('model_has_roles', 'users.id', '=', 'model_has_roles.model_id')
                ->leftJoin('roles', 'model_has_roles.role_id', '=', 'roles.id')
                ->select(
                    'users.id',
                    'users.name',
                    'users.email',
                    DB::raw('GROUP_CONCAT(DISTINCT roles.name) as role_names')
                )
                ->groupBy('users.id', 'users.name', 'users.email')
                ->get()
                ->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'roles' => $user->role_names ? explode(',', $user->role_names) : [],
                    ];
                });

            \Log::debug("UserController@getAllUsersWithRoles: Total usuarios encontrados = " . count($users));
            return response()->json($users, 200);
        } catch (\Exception $e) {
            \Log::error("UserController@getAllUsersWithRoles: Error al obtener usuarios con roles: " . $e->getMessage());
            \Log::error($e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener usuarios con roles',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getUserById($id) {
        \Log::debug("UserController@getUserById: Buscando usuario con ID={$id}");
        $user = DB::table('users')
            ->leftJoin('model_has_roles', 'users.id', '=', 'model_has_roles.model_id')
            ->leftJoin('roles', 'model_has_roles.role_id', '=', 'roles.id')
            ->where('users.id', $id)
            ->select('users.id', 'users.name', 'users.email', DB::raw('GROUP_CONCAT(roles.name) as role_names'))
            ->groupBy('users.id', 'users.name', 'users.email')
            ->first();

        if (!$user) {
            \Log::debug("UserController@getUserById: Usuario no encontrado ID={$id}");
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        \Log::debug("UserController@getUserById: Usuario encontrado, Name={$user->name}");
        return response()->json($user, 200);
    }

    public function getUserRoles() {
        \Log::debug("UserController@getUserRoles: Listando roles disponibles");
        try {
            $roles = Role::all(['id', 'name']);
            \Log::debug("UserController@getUserRoles: Cantidad de roles = " . $roles->count());
            return response()->json($roles, 200);
        } catch (\Exception $e) {
            \Log::error("UserController@getUserRoles: Error al obtener roles: " . $e->getMessage());
            \Log::error($e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener roles',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
