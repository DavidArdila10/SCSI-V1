<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Asumiendo que el rol "reader" tiene id=3 en la tabla 'roles'
        // y que el usuario que quieres hacer "reader" tiene id=3 en 'users'
        DB::table('model_has_roles')->insert([
            'role_id'    => 3,
            'model_type' => 'App\Models\User',
            'model_id'   => 3,
        ]);
    }

    public function down(): void
    {
        // Para revertir este cambio
        DB::table('model_has_roles')
            ->where('role_id', 3)
            ->where('model_type', 'App\Models\User')
            ->where('model_id', 3)
            ->delete();
    }
};
