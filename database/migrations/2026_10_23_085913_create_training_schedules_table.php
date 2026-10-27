<?php

declare(strict_types=1);

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
        Schema::create('training_schedules', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('dojo_id')->constrained('dojos')->cascadeOnDelete();
            $table->string('title', 150)->index();
            $table->string('program_type', 50)->default('regular')->index();
            $table->date('date')->index();
            $table->string('start_time', 10);
            $table->string('end_time', 10);
            $table->string('location_name', 150)->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->unsignedInteger('radius_meters')->default(150);
            $table->string('instructor_name', 100)->nullable();
            $table->text('notes')->nullable();
            $table->string('status', 30)->default('scheduled')->index();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['dojo_id', 'date']);
            $table->index(['date', 'status']);
            $table->index(['dojo_id', 'status']);
            $table->index(['deleted_at', 'date']);
            $table->index(['deleted_at', 'dojo_id']);
            $table->index(['created_at', 'dojo_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('training_schedules');
    }
};
