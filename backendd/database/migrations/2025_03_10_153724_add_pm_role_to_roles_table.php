<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up()
    {
        // Insertar el nuevo rol "pm"
        DB::table('roles')->insert([
            'name' => 'pm',
            'guard_name' => 'sanctum',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down()
    {
        // Eliminar el rol en caso de revertir la migración
        DB::table('roles')->where('name', 'pm')->delete();
    }
};
