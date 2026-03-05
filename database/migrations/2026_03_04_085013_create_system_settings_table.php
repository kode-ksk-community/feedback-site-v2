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
        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();
            $table->string('app_name')->default('Company Feedback');
            $table->string('logo')->nullable();
            $table->string('primary_color', 20)->default('#3b82f6');
            $table->time('shift_morning_start')->default('08:00:00');
            $table->time('shift_morning_end')->default('12:00:00');
            $table->time('shift_afternoon_start')->default('13:00:00');
            $table->time('shift_afternoon_end')->default('17:00:00');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_settings');
    }
};
