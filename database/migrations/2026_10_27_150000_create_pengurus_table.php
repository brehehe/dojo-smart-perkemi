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
        Schema::create('pengurus', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->string('type', 20)->index(); // 'pengkot' or 'pengprov'
            $table->string('name', 150)->index();
            $table->string('code', 50)->unique();
            $table->string('region', 100)->index(); // e.g. 'Kota Surabaya' or 'Jawa Timur'
            $table->foreignUuid('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('sk_number', 100)->nullable();
            $table->string('sk_period', 50)->nullable();
            $table->string('leader_name', 150)->nullable();
            $table->string('secretary_name', 150)->nullable();
            $table->string('contact_phone', 30)->nullable();
            $table->string('contact_email', 100)->nullable();
            $table->text('address')->nullable();
            $table->string('status', 20)->default('active')->index();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['type', 'status']);
            $table->index(['type', 'region']);
        });

        Schema::table('kenshis', function (Blueprint $table): void {
            $table->foreignUuid('pengkot_id')->nullable()->after('is_atlet_pengkot')->constrained('pengurus')->nullOnDelete();
            $table->foreignUuid('pengprov_id')->nullable()->after('is_atlet_pengprov')->constrained('pengurus')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kenshis', function (Blueprint $table): void {
            $table->dropForeign(['pengkot_id']);
            $table->dropForeign(['pengprov_id']);
            $table->dropColumn(['pengkot_id', 'pengprov_id']);
        });

        Schema::dropIfExists('pengurus');
    }
};
