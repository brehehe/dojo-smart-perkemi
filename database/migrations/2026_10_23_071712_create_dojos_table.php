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
        Schema::create('dojos', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->string('code', 20)->unique();
            $table->string('name', 150)->index();
            $table->string('pengprov', 100)->index();
            $table->string('pengkab', 100)->index();
            $table->text('address')->nullable();
            $table->string('city', 100)->nullable()->index();
            $table->foreignUuid('head_sensei_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('contact_phone', 30)->nullable();
            $table->string('contact_email', 100)->nullable();
            $table->string('status', 30)->default('active')->index();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'pengprov']);
            $table->index(['pengprov', 'pengkab']);
            $table->index(['head_sensei_id', 'status']);
            $table->index(['deleted_at', 'status']);
            $table->index(['status', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dojos');
    }
};
