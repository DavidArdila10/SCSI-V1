<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Primero eliminamos la tabla (si existe)
        Schema::dropIfExists('cronometros');

        // Luego la creamos de nuevo con todos los campos
        Schema::create('cronometros', function (Blueprint $table) {
            $table->bigIncrements('id');

            $table->string('PM', 100);
            $table->string('description', 250)->nullable();
            $table->string('EAC', 100)->nullable();
            $table->string('ETC', 100)->nullable();
            $table->enum('STATUS', ['CANCELLED', 'DELIVERED'])->nullable();

            // Campos de tiempo originales
            $table->double('TE')->nullable();
            $table->double('TPC')->nullable();
            $table->double('TPI')->nullable();

            $table->date('date')->nullable();
            $table->date('start_date')->nullable();
            $table->double('accumulated_hours')->nullable();
            $table->integer('accumulated_days')->nullable();
            $table->boolean('is_active')->nullable();

            // Timestamps de Laravel
            $table->timestamps();

            // Flags de ejecución
            $table->boolean('is_running_te')->nullable();
            $table->boolean('is_running_tpc')->nullable();
            $table->boolean('is_running_tpi')->nullable();

            // Tiempo transcurrido para cada modo
            $table->double('elapsed_te')->nullable();
            $table->double('elapsed_tpc')->nullable();
            $table->double('elapsed_tpi')->nullable();

            // Campos nuevos para manejar la última actualización de cada timer
            $table->dateTime('last_updated_te')->nullable();
            $table->dateTime('last_updated_tpc')->nullable();
            $table->dateTime('last_updated_tpi')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Si queremos revertir la migración, simplemente borramos la tabla
        Schema::dropIfExists('cronometros');
    }
};
