<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('sows', function (Blueprint $table) {
            // Agregar índices individuales
            $table->index('account_name', 'idx_account_name'); // Para búsquedas por cliente
            $table->index('delivery_team', 'idx_delivery_team'); // Para búsquedas por equipo
            $table->index('ticket_date', 'idx_ticket_date'); // Para búsquedas por fecha
            $table->index('project_id', 'idx_project_id'); // Para búsquedas por proyecto
            $table->index('sow_status', 'idx_sow_status'); // Para búsquedas por estado

            // Índice compuesto para optimizar consultas que filtran por fecha y estado
            $table->index(['ticket_date', 'sow_status'], 'idx_ticket_date_status');
        });
    }

    public function down()
    {
        Schema::table('sows', function (Blueprint $table) {
            // Eliminar los índices en caso de revertir la migración
            $table->dropIndex('idx_account_name');
            $table->dropIndex('idx_delivery_team');
            $table->dropIndex('idx_ticket_date');
            $table->dropIndex('idx_project_id');
            $table->dropIndex('idx_sow_status');
            $table->dropIndex('idx_ticket_date_status');
        });
    }
};