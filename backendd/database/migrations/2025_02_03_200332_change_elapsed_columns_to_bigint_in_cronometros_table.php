<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cronometros', function (Blueprint $table) {
            $table->bigInteger('elapsed_te')->default(0)->change();
            $table->bigInteger('elapsed_tpc')->default(0)->change();
            $table->bigInteger('elapsed_tpi')->default(0)->change();
        });
    }

    public function down(): void
    {
        
        Schema::table('cronometros', function (Blueprint $table) {
            $table->double('elapsed_te')->nullable()->change();
            $table->double('elapsed_tpc')->nullable()->change();
            $table->double('elapsed_tpi')->nullable()->change();
        });
    }
};

