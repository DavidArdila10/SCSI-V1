<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('sows', function (Blueprint $table) {
            $table->dropIndex('idx_ticket_date_status_project');
            $table->index(['sow_status', 'ticket_date', 'project_id'], 'idx_status_ticket_date_project');
        });
    }

    public function down()
    {
        Schema::table('sows', function (Blueprint $table) {
            $table->dropIndex('idx_status_ticket_date_project');
            $table->index(['ticket_date', 'sow_status', 'project_id'], 'idx_ticket_date_status_project');
        });
    }
};

