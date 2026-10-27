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
        Schema::create('independent_trainings', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('kenshi_id')->constrained('kenshis')->cascadeOnDelete();
            $table->date('training_date')->index();
            $table->string('drill_type', 100);
            $table->string('title', 255);
            $table->integer('duration_minutes')->default(30);
            $table->string('intensity', 30)->default('medium');
            $table->string('reps_or_cycles', 150)->nullable();
            $table->integer('estimated_calories')->nullable();
            $table->text('notes')->nullable();
            $table->string('status', 30)->default('recorded')->index();
            $table->text('coach_notes')->nullable();
            $table->foreignUuid('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('independent_trainings');
    }
};
