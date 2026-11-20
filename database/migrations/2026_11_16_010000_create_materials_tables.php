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
        Schema::create('materials', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->string('title', 200);
            $table->string('slug', 255)->unique();
            $table->string('pillar', 50); // dokuhon, kihon, goho, juho, embu, randori
            $table->string('target_rank', 30)->default('minarai'); // minarai, kyu_8, ..., dan_7
            $table->text('summary')->nullable();
            $table->string('video_url')->nullable();
            $table->string('video_duration', 20)->nullable();
            $table->json('video_chapters')->nullable(); // [{ "title": "...", "timestamp": "01:15", "seconds": 75 }]
            $table->string('pdf_path')->nullable();
            $table->boolean('is_official_pb')->default(true);
            $table->foreignUuid('dojo_id')->nullable()->constrained('dojos')->nullOnDelete();
            $table->foreignUuid('uploader_id')->nullable()->constrained('users')->nullOnDelete();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_public')->default(false);
            $table->integer('order_priority')->default(0);
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['target_rank', 'pillar', 'is_active']);
            $table->index(['dojo_id', 'is_active']);
        });

        Schema::create('kenshi_material_progress', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('kenshi_id')->constrained('kenshis')->cascadeOnDelete();
            $table->foreignUuid('material_id')->constrained('materials')->cascadeOnDelete();
            $table->boolean('is_completed')->default(false);
            $table->dateTime('completed_at')->nullable();
            $table->integer('watch_time_seconds')->default(0);
            $table->timestamps();

            $table->unique(['kenshi_id', 'material_id']);
            $table->index(['kenshi_id', 'is_completed']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kenshi_material_progress');
        Schema::dropIfExists('materials');
    }
};
