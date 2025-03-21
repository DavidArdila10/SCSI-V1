<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('sows', function (Blueprint $table) {
            // Índices en campos usados en búsquedas y filtros
            $table->index('project_id');
            $table->index('sow_status');
            $table->index('ticket_date');
            $table->index(['ticket_date', 'sow_status']); // Índice compuesto para búsquedas por fecha y estado
        });
    }

    public function down(): void
    {
        Schema::table('sows', function (Blueprint $table) {
            // Eliminamos los índices si se hace un rollback
            $table->dropIndex(['project_id']);
            $table->dropIndex(['sow_status']);
            $table->dropIndex(['ticket_date']);
            $table->dropIndex(['ticket_date', 'sow_status']);
        });
    }
};