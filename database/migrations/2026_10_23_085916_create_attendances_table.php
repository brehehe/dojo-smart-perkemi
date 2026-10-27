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
        Schema::create('attendances', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('training_schedule_id')->constrained('training_schedules')->cascadeOnDelete();
            $table->foreignUuid('kenshi_id')->constrained('kenshis')->cascadeOnDelete();
            $table->string('status', 30)->default('present')->index();
            $table->dateTime('check_in_at')->nullable()->index();
            $table->string('photo_path', 500)->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->decimal('location_accuracy', 8, 2)->nullable();
            $table->decimal('distance_meters', 8, 2)->nullable();
            $table->boolean('is_within_radius')->default(false)->index();
            $table->foreignUuid('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['training_schedule_id', 'kenshi_id']);
            $table->index(['kenshi_id', 'status']);
            $table->index(['training_schedule_id', 'status']);
            $table->index(['verified_by', 'status']);
            $table->index(['deleted_at', 'status']);
            $table->index(['training_schedule_id', 'check_in_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
