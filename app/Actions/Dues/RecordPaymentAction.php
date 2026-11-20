<?php

declare(strict_types=1);

namespace App\Actions\Dues;

use App\Enums\InvoiceStatus;
use App\Enums\PaymentStatus;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class RecordPaymentAction
{
    public function __construct(
        private CalculateAllocationAction $calculateAllocation
    ) {}

    /**
     * Record payment, mark invoice as paid, and generate ledger allocations.
     * Guarded with idempotency on external_reference.
     */
    public function execute(
        Invoice $invoice,
        int $amount,
        string $channel = 'bri_transfer',
        ?string $externalRef = null,
        ?string $proofPath = null,
        ?string $userId = null,
        ?string $notes = null
    ): Payment {
        return DB::transaction(function () use (
            $invoice,
            $amount,
            $channel,
            $externalRef,
            $proofPath,
            $userId,
            $notes
        ): Payment {
            // Idempotency guard: return existing payment if already processed with this reference
            if ($externalRef !== null) {
                $existing = Payment::where('external_reference', $externalRef)->first();
                if ($existing && $existing->status === PaymentStatus::Verified) {
                    return $existing;
                }
            }

            $payment = Payment::create([
                'invoice_id' => $invoice->id,
                'amount' => $amount,
                'channel' => $channel,
                'external_reference' => $externalRef,
                'proof_file_path' => $proofPath,
                'status' => PaymentStatus::Verified,
                'verified_by' => $userId,
                'verified_at' => now(),
                'notes' => $notes,
            ]);

            // Mark invoice as paid
            $invoice->update([
                'status' => InvoiceStatus::Paid,
                'paid_at' => now(),
            ]);

            // Create ledger allocations if not yet generated
            if ($invoice->allocations()->doesntExist()) {
                $this->calculateAllocation->execute($invoice, $amount);
            }

            activity('dues')
                ->performedOn($payment)
                ->causedBy($userId ? User::find($userId) : null)
                ->log('Pembayaran iuran senilai Rp'.number_format($amount, 0, ',', '.')." diverifikasi untuk tagihan #{$invoice->id}.");

            return $payment;
        });
    }
}
