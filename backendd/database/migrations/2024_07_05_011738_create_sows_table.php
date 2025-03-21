<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('sows', function (Blueprint $table) {
            $table->string('ticket_sow')->primary();
            $table->string("cls",200)->nullable();
            $table->text("opportunity_name")->nullable();
            $table->string("opportunity_id",255)->nullable();
            $table->string("account_name",200)->nullable();
            $table->string("delivery_team",200);
            $table->string("ticket_date",20);
            $table->text("sow_description");
            $table->enum('priority',['low','medium','high'])->nullable();
            $table->date("sow_due_date")->nullable();
            $table->date("effort_due_date")->nullable();
            $table->string("project_id")->nullable();
            $table->string("sow_owner")->nullable();
            $table->enum('sow_status',['new','in_progress','closed','blocked','cancelled']);
            $table->date('sow_delivery_date')->nullable();
            $table->string('effort_owner',100)->nullable();
            $table->enum('effort_status',['in_progress','not_started','delivered','cancelled'])->nullable();
            $table->date('effort_delivery_date')->nullable();
            $table->text("comments")->nullable();
            $table->string('sow_link',255)->nullable();
            $table->string('effort_link',255)->nullable();
            $table->date('create_at')->default(DB::raw('CURRENT_DATE'));
        });

    }
  
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sows');
    }
};
