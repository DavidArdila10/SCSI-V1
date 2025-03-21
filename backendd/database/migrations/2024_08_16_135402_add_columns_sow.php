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
        Schema::create('create_sows_by_user', function (Blueprint $table) {
            $table->id();
            $table->string('sow_id');
            $table->unsignedBigInteger('created_by');
            $table->string('user_name');
            $table->timestamps();
        
            // Relaciones opcionales
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('sow_id')->references('ticket_sow')->on('sows')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::dropIfExists('create_sows_by_user');
    }
};
