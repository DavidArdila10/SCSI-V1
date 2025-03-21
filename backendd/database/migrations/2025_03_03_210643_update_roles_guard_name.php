<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;

class UpdateRolesGuardName extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('roles')->whereIn('name', ['admin', 'writer', 'reader'])->update(['guard_name' => 'sanctum']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Si quieres revertir el cambio, podrías volver a 'web' si ese era el valor anterior
        DB::table('roles')->whereIn('name', ['admin', 'writer', 'reader'])->update(['guard_name' => 'web']);
    }
}
