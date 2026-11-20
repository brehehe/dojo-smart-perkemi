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
        Schema::create('examinations', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->string('title', 200);
            $table->string('level_scope', 50)->default('pengkot_kyu'); // pengkot_kyu, pengprov_dan_muda, pb_dan_madya
            $table->uuid('organizer_id')->nullable(); // pengurus or dojo id
            $table->string('organizer_type', 50)->nullable(); // pengurus, dojo
            $table->string('location_name', 200);
            $table->date('date');
            $table->string('start_time', 10)->default('08:00');
            $table->string('end_time', 10)->default('16:00');
            $table->integer('quota')->default(50);
            $table->string('status', 30)->default('registration_open'); // draft, registration_open, in_progress, completed, cancelled
            $table->string('sk_number', 100)->nullable();
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['level_scope', 'status', 'date']);
        });

        Schema::create('examination_registrations', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('examination_id')->constrained('examinations')->cascadeOnDelete();
            $table->foreignUuid('kenshi_id')->constrained('kenshis')->cascadeOnDelete();
            $table->string('current_rank', 30);
            $table->string('target_rank', 30);
            $table->string('chest_number', 20)->nullable();
            $table->json('eligibility_check')->nullable(); // { "dues_paid": true, "attendance_count": 18, "material_progress": 100, ... }
            $table->boolean('is_eligible')->default(false);
            $table->string('status', 30)->default('registered'); // registered, verified, examined, passed, failed, remedial
            $table->decimal('final_score', 5, 2)->nullable();
            $table->string('result_grade', 20)->nullable(); // A, B+, B, C, D
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['examination_id', 'kenshi_id']);
            $table->index(['examination_id', 'status']);
        });

        Schema::create('examination_scores', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('registration_id')->constrained('examination_registrations')->cascadeOnDelete();
            $table->foreignUuid('examiner_id')->constrained('users')->cascadeOnDelete();
            $table->integer('dokuhon_score')->default(80); // 15%
            $table->integer('goho_score')->default(80);    // 25%
            $table->integer('juho_score')->default(80);    // 25%
            $table->integer('embu_score')->default(80);    // 20%
            $table->integer('randori_score')->default(80); // 15%
            $table->decimal('total_weighted_score', 5, 2)->default(80.00);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['registration_id', 'examiner_id']);
        });

        Schema::create('kenshi_promotions', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('kenshi_id')->constrained('kenshis')->cascadeOnDelete();
            $table->string('previous_rank', 30);
            $table->string('new_rank', 30);
            $table->date('promotion_date');
            $table->string('sk_number', 100)->nullable();
            $table->string('certificate_number', 100)->nullable();
            $table->foreignUuid('examination_id')->nullable()->constrained('examinations')->nullOnDelete();
            $table->foreignUuid('promoted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['kenshi_id', 'promotion_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kenshi_promotions');
        Schema::dropIfExists('examination_scores');
        Schema::dropIfExists('examination_registrations');
        Schema::dropIfExists('examinations');
    }
};
