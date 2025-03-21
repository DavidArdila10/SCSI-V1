<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\PasswordReset;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class PasswordResetController extends Controller
{
    public function requestReset(Request $request)
    {
      
        $validated = $request->validate([
            'email' => 'required|email|exists:users,email',
            'password' => 'required|confirmed|min:8',
        ]);
    
       $user = User::where('email', $request->input('email'))->first();
    
        $email = $request->input('email');
        $password = $request->input('password');
    
        // Verifica si el correo electrónico existe en la tabla de usuarios
        $user = User::where('email', $email)->first();

        $existingResetRequest = PasswordReset::where('user_id', $user->id)
        ->where('created_at', '>', now()->subMinutes(15)) // Opcional: Valida si la solicitud es reciente
        ->first();

if ($existingResetRequest) {
return response()->json(['message' => 'A password reset request has already been sent.'], 400);
}
    
        if (!$user) {
            return response()->json(['message' => 'The email address is not registered.'], 404);
        }
    
        // Crea una solicitud de restablecimiento de contraseña
        DB::table('password_resets')->insert([
            'email' => $email,
            'token' => Str::random(60),
            'password' => bcrypt($password),
            'user_id' => $user->id,
            'created_at' => now(),
        ]);
    
        return response()->json(['message' => 'Password reset request sent successfully.'], 200);
    
    }

    public function getResetRequests()
    {
        $resetRequests = DB::table('password_resets')->select('id', 'email', 'password', 'created_at')->get();
        return response()->json($resetRequests);
    }

    public function approveRequest(Request $request, $id)
    {
        $reset = DB::table('password_resets')->where('id', $id)->first();
        if (!$reset) {
            return response()->json(['message' => 'Request not found.'], 404);
        }

        $user = User::where('email', $reset->email)->first();
        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        $user->password = $reset->password;
        $user->save();

        // Eliminar la solicitud de restablecimiento
        DB::table('password_resets')->where('id', $id)->delete();

        return response()->json(['message' => 'Password reset approved and updated.']);
    }

    public function cancelRequest(Request $request)
{
    $request->validate([
        'email' => 'required|email',
    ]);

    $email = $request->input('email');

    // Elimina la solicitud de restablecimiento de contraseña
    $deleted = DB::table('password_resets')->where('email', $email)->delete();

    if ($deleted) {
        return response()->json(['message' => 'Password reset request cancelled successfully.']);
    } else {
        return response()->json(['message' => 'No password reset request found for this email.'], 404);
    }
}
}