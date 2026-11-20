<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Dues\CheckDelinquencyAction;
use App\Actions\Dues\GenerateMonthlyInvoicesAction;
use App\Enums\InvoiceStatus;
use App\Models\Dojo;
use App\Models\Invoice;
use App\Models\Kenshi;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceController extends Controller
{
    /**
     * Kenshi Personal Invoices & Dues Payment Portal.
     */
    public function kenshiPortal(Request $request, CheckDelinquencyAction $delinquencyChecker, GenerateMonthlyInvoicesAction $invoiceGenerator): Response
    {
        $user = $request->user();
        $kenshi = $user ? Kenshi::where('user_id', $user->id)->with('dojo')->first() : null;

        if (! $kenshi) {
            $kenshi = Kenshi::with('dojo')->first();
        }

        // Auto-ensure current month invoice exists so Kenshi has their bill ready to pay
        if ($kenshi && $kenshi->is_active) {
            $currentPeriod = now()->format('Y-m');
            $invoiceGenerator->execute($currentPeriod, null, $kenshi->id);
        }

        if ($kenshi) {
            $delinquencyChecker->execute($kenshi);
        }

        $invoices = $kenshi
            ? Invoice::where('kenshi_id', $kenshi->id)
                ->with(['payments', 'feeSetting'])
                ->latest('period')
                ->latest('created_at')
                ->get()
            : collect();

        $unpaidCount = $invoices->where('status', InvoiceStatus::Unpaid)->count();
        $unpaidSum = (int) $invoices->where('status', InvoiceStatus::Unpaid)->sum('amount');
        $isDelinquent = $unpaidCount >= 12;

        return Inertia::render('Dues/KenshiInvoices', [
            'currentKenshi' => $kenshi,
            'invoices' => $invoices,
            'stats' => [
                'total_invoices' => $invoices->count(),
                'unpaid_count' => $unpaidCount,
                'unpaid_sum' => $unpaidSum,
                'is_delinquent' => $isDelinquent,
                'status_label' => $kenshi?->is_active ? 'Anggota Aktif' : 'Tidak Aktif Sementara (Tunggakan 12 Bulan)',
            ],
        ]);
    }

    /**
     * Dojo Invoices & Ledger Overview for Sensei / Dojo Admin.
     */
    public function dojoIndex(Request $request): Response
    {
        $user = $request->user();
        $isSensei = $user && $user->hasRole('Sensei');

        $dojo = null;
        if ($isSensei) {
            $dojo = Dojo::where('head_sensei_id', $user->id)->first() ?? Dojo::first();
        } else {
            $dojoId = $request->query('dojo_id');
            $dojo = $dojoId ? Dojo::find($dojoId) : Dojo::first();
        }

        $query = Invoice::with(['kenshi', 'payments', 'allocations'])->latest('period');
        if ($dojo) {
            $query->where('dojo_id', $dojo->id);
        }

        $invoices = $query->paginate(20)->withQueryString();

        // Calculate summary stats
        $baseQuery = Invoice::query();
        if ($dojo) {
            $baseQuery->where('dojo_id', $dojo->id);
        }

        $totalInvoiced = (int) (clone $baseQuery)->sum('amount');
        $totalPaid = (int) (clone $baseQuery)->where('status', InvoiceStatus::Paid)->sum('amount');
        $totalUnpaid = (int) (clone $baseQuery)->where('status', InvoiceStatus::Unpaid)->sum('amount');

        // Dojo share (20%) and Trainer share (40%) earned from Kyu monthly
        $dojoShareEarned = (int) round($totalPaid * 0.20);
        $pelatihShareEarned = (int) round($totalPaid * 0.40);

        return Inertia::render('Dues/DojoInvoices', [
            'currentDojo' => $dojo,
            'invoices' => $invoices,
            'stats' => [
                'total_invoiced' => $totalInvoiced,
                'total_paid' => $totalPaid,
                'total_unpaid' => $totalUnpaid,
                'dojo_share_earned' => $dojoShareEarned,
                'pelatih_share_earned' => $pelatihShareEarned,
            ],
        ]);
    }

    /**
     * Bulk generate monthly invoices for dojo or all dojos.
     */
    public function generateMonthly(Request $request, GenerateMonthlyInvoicesAction $action): RedirectResponse
    {
        $validated = $request->validate([
            'period' => ['required', 'string', 'regex:/^\d{4}-\d{2}$/'],
            'dojo_id' => ['nullable', 'uuid', 'exists:dojos,id'],
        ]);

        $generated = $action->execute($validated['period'], $validated['dojo_id'] ?? null);

        return back()->with('success', "Berhasil menerbitkan {$generated->count()} tagihan iuran untuk periode {$validated['period']}.");
    }
}
