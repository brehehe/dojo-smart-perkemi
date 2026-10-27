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
        Schema::create('kenshis', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->string('id_card_number', 30)->unique();
            $table->foreignUuid('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignUuid('dojo_id')->constrained('dojos')->cascadeOnDelete();
            $table->string('full_name', 150)->index();
            $table->string('nickname', 50)->nullable();
            $table->enum('gender', ['M', 'F'])->default('M')->index();
            $table->string('place_of_birth', 100)->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('blood_type', 5)->nullable();
            $table->string('rank', 30)->default('minarai')->index();
            $table->string('phone', 30)->nullable();
            $table->text('address')->nullable();
            $table->date('joined_at')->nullable()->index();
            $table->boolean('is_active')->default(true)->index();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['dojo_id', 'rank']);
            $table->index(['dojo_id', 'is_active']);
            $table->index(['dojo_id', 'full_name']);
            $table->index(['user_id', 'is_active']);
            $table->index(['deleted_at', 'dojo_id']);
            $table->index(['deleted_at', 'is_active']);
            $table->index(['created_at', 'dojo_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kenshis');
    }
};
