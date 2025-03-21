<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    // Método de login
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                "success" => false,
                "errors" => $validator->errors()
            ], 422); // Código 422: Datos no válidos
        }

        if (Auth::attempt(['email' => $request->email, 'password' => $request->password])) {
            $user = Auth::user();

            // Obtén los roles del usuario
            $roles = method_exists($user, 'roles') ? $user->roles()->select('name')->get() : [];

            return response()->json([
                "success" => true,
                "message" => "Logueado",
                "user" => [
                    "id" => $user->id,
                    "name" => $user->name,
                    "email" => $user->email,
                    "roles" => $roles, // Incluye los roles
                ],
                "token" => $user->createToken("codea.app")->plainTextToken,
            ], 200); // Código 200: OK
        }

        return response()->json([
            "success" => false,
            "message" => "Credenciales inválidas",
        ], 401); // Código 401: No autorizado
    }

    // Método de logout
    public function logout(Request $request)
    {
        if ($request->user()) {
            $request->user()->tokens()->delete(); // Elimina todos los tokens del usuario

            return response()->json([
                "success" => true,
                "message" => "Sesión cerrada correctamente"
            ], 200); // Código 200: OK
        }

        return response()->json([
            "success" => false,
            "message" => "No hay sesión activa"
        ], 401); // Código 401: No autorizado
    }
}
