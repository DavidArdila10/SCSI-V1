<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

return new class extends Migration {
    public function up()
    {
        // Obtener el rol "pm"
        $pmRole = Role::where('name', 'pm')->first();

        if ($pmRole) {
            // Crear permisos relacionados con cronómetros si no existen
            $permissions = [
                'cronometro.index',  // Ver la lista de cronómetros
                'cronometro.show',   // Ver un cronómetro específico
                'cronometro.create', // Crear un cronómetro
                'cronometro.update', // Actualizar un cronómetro
                'cronometro.delete'  // Eliminar un cronómetro
            ];

            foreach ($permissions as $perm) {
                Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'sanctum']);
            }

            // Asignar los permisos al rol "pm"
            $pmRole->syncPermissions(Permission::whereIn('name', $permissions)->get());
        }
    }

    public function down()
    {
        // Obtener el rol "pm"
        $pmRole = Role::where('name', 'pm')->first();

        if ($pmRole) {
            // Quitar permisos del rol "pm"
            $pmRole->permissions()->detach();
        }
    }
};
