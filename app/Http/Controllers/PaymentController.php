<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Dues\RecordPaymentAction;
use App\Models\Invoice;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    /**
     * Submit payment for an invoice with proof or external reference.
     */
    public function store(Request $request, RecordPaymentAction $action): RedirectResponse
    {
        $validated = $request->validate([
            'invoice_id' => ['required', 'uuid', 'exists:invoices,id'],
            'amount' => ['required', 'integer', 'min:1000'],
            'channel' => ['required', 'string', 'in:bri_transfer,bni_transfer,myperkemi,manual_receipt'],
            'external_reference' => ['nullable', 'string', 'max:150'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $invoice = Invoice::findOrFail($validated['invoice_id']);

        $action->execute(
            $invoice,
            $validated['amount'],
            $validated['channel'],
            $validated['external_reference'] ?? 'PAY-'.now()->format('YmdHis').'-'.strtoupper(substr($invoice->id, 0, 4)),
            null,
            $request->user()?->id,
            $validated['notes'] ?? null
        );

        return back()->with('success', 'Pembayaran iuran berhasil diverifikasi dan hak alokasi 5 pihak telah dihitung secara otomatis.');
    }
}
