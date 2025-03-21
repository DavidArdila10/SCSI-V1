<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('cronometros', function (Blueprint $table) {
            $table->string('PM_assigned', 50)->nullable()->after('PM');
        });
    }

    public function down(): void
    {
        Schema::table('cronometros', function (Blueprint $table) {
            $table->dropColumn('PM_assigned');
        });
    }
};
