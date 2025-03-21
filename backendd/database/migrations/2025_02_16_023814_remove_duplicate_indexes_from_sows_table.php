<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('sows', function (Blueprint $table) {
            // Eliminar índices duplicados si existen
            $table->dropIndex('idx_ticket_date'); // Eliminando índice duplicado de ticket_date
            $table->dropIndex('idx_sow_status'); // Eliminando índice duplicado de sow_status
            $table->dropIndex('idx_project_id'); // Eliminando índice duplicado de project_id
        });
    }

    public function down()
    {
        Schema::table('sows', function (Blueprint $table) {
            // Restaurar índices en caso de rollback
            $table->index('ticket_date', 'idx_ticket_date');
            $table->index('sow_status', 'idx_sow_status');
            $table->index('project_id', 'idx_project_id');
        });
    }
};
