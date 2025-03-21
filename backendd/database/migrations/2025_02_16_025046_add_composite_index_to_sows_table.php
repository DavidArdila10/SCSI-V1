<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('sows', function (Blueprint $table) {
            // Agregar un índice compuesto para mejorar la consulta
            $table->index(['ticket_date', 'sow_status', 'project_id'], 'idx_ticket_date_status_project');
        });
    }

    public function down()
    {
        Schema::table('sows', function (Blueprint $table) {
            // Eliminar el índice en caso de rollback
            $table->dropIndex('idx_ticket_date_status_project');
        });
    }
};

