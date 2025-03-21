<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Insertar el rol "reader" en la tabla roles si no existe
        //    Aquí asumimos que id=3 corresponde a "reader".
        //    OJO: Ajusta si ya existe con otro id.
        DB::table('roles')->insertOrIgnore([
            'id'         => 3,
            'name'       => 'reader',  // El nombre exacto que usas en Spatie
            'guard_name' => 'web',     // Debe coincidir con tu config
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 2. Asignar el rol "reader" al usuario con id=3
        //    Ajusta el model_id=3 al usuario que quieras asignar.
        DB::table('model_has_roles')->insertOrIgnore([
            'role_id'    => 3,
            'model_type' => 'App\Models\User',
            'model_id'   => 3,
        ]);
    }

    public function down(): void
    {
        // Para revertir los cambios (opcional):
        // 1. Eliminar la asignación de rol
        DB::table('model_has_roles')
            ->where('role_id', 3)
            ->where('model_type', 'App\Models\User')
            ->where('model_id', 3)
            ->delete();

        // 2. Eliminar el rol "reader" (id=3)
        DB::table('roles')
            ->where('id', 3)
            ->delete();
    }
};
