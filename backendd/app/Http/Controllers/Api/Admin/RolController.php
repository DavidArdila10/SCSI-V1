<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Spatie\Permission\Models\Role;

class RolController extends Controller
{
    public function index()
    {
        // Obtiene todos los roles y los devuelve como JSON
        $roles = Role::all();
        return response()->json($roles, 200);
    }
}
