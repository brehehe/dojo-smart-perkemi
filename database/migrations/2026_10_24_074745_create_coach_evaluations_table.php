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
        Schema::create('coach_evaluations', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('kenshi_id')->constrained('kenshis')->cascadeOnDelete();
            $table->foreignUuid('coach_id')->constrained('users')->cascadeOnDelete();
            $table->date('evaluation_date')->index();
            $table->integer('technique_score')->default(80);
            $table->integer('embu_score')->default(80);
            $table->integer('randori_score')->default(80);
            $table->integer('physical_score')->default(80);
            $table->integer('discipline_score')->default(90);
            $table->integer('overall_score')->default(82);
            $table->string('grade', 20)->default('B+');
            $table->string('recommendation', 150)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coach_evaluations');
    }
};
