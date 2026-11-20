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
        Schema::create('dojo_fee_settings', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('dojo_id')->constrained('dojos')->cascadeOnDelete();
            $table->string('category', 30)->default('kyukenshi'); // kyukenshi, yudansha
            $table->integer('amount')->default(50000); // integer rupiah
            $table->string('effective_from', 7); // YYYY-MM
            $table->string('effective_to', 7)->nullable(); // YYYY-MM
            $table->string('status', 30)->default('draft'); // draft, pending_pb, approved, rejected, superseded
            $table->foreignUuid('requested_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('requested_at')->nullable();
            $table->text('change_reason')->nullable();
            $table->foreignUuid('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('approved_at')->nullable();
            $table->string('approval_sk_number', 100)->nullable();
            $table->string('approval_document_path')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['dojo_id', 'status', 'effective_from']);
        });

        Schema::create('invoices', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('kenshi_id')->constrained('kenshis')->cascadeOnDelete();
            $table->foreignUuid('dojo_id')->nullable()->constrained('dojos')->nullOnDelete();
            $table->string('type', 50); // kyu_monthly, dan_monthly, registration_regular, registration_executive, wsko_annual
            $table->string('period', 10); // YYYY-MM or YYYY
            $table->integer('amount'); // integer rupiah
            $table->json('policy_snapshot')->nullable();
            $table->string('status', 30)->default('unpaid'); // unpaid, partial, paid, waived, cancelled
            $table->date('due_date');
            $table->dateTime('paid_at')->nullable();
            $table->foreignUuid('fee_setting_id')->nullable()->constrained('dojo_fee_settings')->nullOnDelete();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['kenshi_id', 'type', 'period'], 'uniq_kenshi_invoice_period');
            $table->index(['dojo_id', 'status', 'period']);
            $table->index(['status', 'due_date']);
        });

        Schema::create('payments', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('invoice_id')->constrained('invoices')->cascadeOnDelete();
            $table->integer('amount'); // integer rupiah
            $table->string('channel', 50)->default('bri_transfer'); // bri_transfer, bni_transfer, myperkemi, manual_receipt
            $table->string('external_reference', 150)->nullable()->unique();
            $table->string('proof_file_path')->nullable();
            $table->string('status', 30)->default('pending'); // pending, verified, rejected, reversed
            $table->foreignUuid('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('verified_at')->nullable();
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['invoice_id', 'status']);
        });

        Schema::create('allocations', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('invoice_id')->constrained('invoices')->cascadeOnDelete();
            $table->string('beneficiary_type', 50); // pb_perkemi, pengprov, pengkot, dojo, pelatih
            $table->uuid('beneficiary_id')->nullable(); // id dojo, pengurus, or user
            $table->decimal('rate_percentage', 5, 2);
            $table->integer('amount'); // integer rupiah
            $table->string('status', 30)->default('allocated'); // allocated, payable, transferred, reconciled
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['invoice_id', 'beneficiary_type']);
            $table->index(['beneficiary_type', 'beneficiary_id', 'status'], 'alloc_bene_status_idx');
        });

        Schema::create('transfers', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('allocation_id')->constrained('allocations')->cascadeOnDelete();
            $table->integer('amount'); // integer rupiah
            $table->string('proof_reference', 150)->nullable();
            $table->string('proof_file_path')->nullable();
            $table->dateTime('transferred_at')->nullable();
            $table->dateTime('reconciled_at')->nullable();
            $table->foreignUuid('reconciled_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('kenshi_status_history', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('kenshi_id')->constrained('kenshis')->cascadeOnDelete();
            $table->string('status', 50); // active, inactive_temporary, inactive_permanent, leave_approved
            $table->string('from_period', 10)->nullable(); // YYYY-MM
            $table->string('to_period', 10)->nullable(); // YYYY-MM
            $table->text('reason')->nullable();
            $table->foreignUuid('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['kenshi_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transfers');
        Schema::dropIfExists('allocations');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('invoices');
        Schema::dropIfExists('dojo_fee_settings');
        Schema::dropIfExists('kenshi_status_history');
    }
};
