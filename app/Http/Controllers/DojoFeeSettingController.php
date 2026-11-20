<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Dues\ApproveDojoFeeSettingAction;
use App\Actions\Dues\RequestDojoFeeSettingAction;
use App\Enums\DojoStatus;
use App\Enums\FeeSettingStatus;
use App\Models\Dojo;
use App\Models\DojoFeeSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DojoFeeSettingController extends Controller
{
    /**
     * Display Dojo Fee Configuration & PB Approval Portal.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $isPBOrAdmin = $user && $user->hasAnyRole(['SuperAdmin', 'PengprovAdmin']);
        $isSensei = $user && $user->hasRole('Sensei');

        // Resolve active dojo for Sensei
        $dojo = null;
        if ($isSensei) {
            $dojo = Dojo::where('head_sensei_id', $user->id)->first() ?? Dojo::first();
        } else {
            $dojoId = $request->query('dojo_id');
            $dojo = $dojoId ? Dojo::find($dojoId) : Dojo::first();
        }

        $query = DojoFeeSetting::with(['dojo', 'requester', 'approver'])->latest();

        if ($dojo && ! $isPBOrAdmin) {
            $query->where('dojo_id', $dojo->id);
        }

        $settings = $query->paginate(15)->withQueryString();

        $activeApprovedSetting = $dojo ? DojoFeeSetting::where('dojo_id', $dojo->id)
            ->where('status', FeeSettingStatus::Approved)
            ->latest('effective_from')
            ->first() : null;

        $pendingProposals = $isPBOrAdmin
            ? DojoFeeSetting::with(['dojo', 'requester'])->pendingPB()->latest()->get()
            : collect();

        $defaultRates = [
            'pb' => 20,
            'pengprov' => 10,
            'pengkot' => 10,
            'dojo' => 20,
            'pelatih' => 40,
        ];
        $currentRates = $activeApprovedSetting?->metadata['allocation_rates'] ?? $defaultRates;

        $allDojos = Dojo::where('status', DojoStatus::Active)
            ->orderBy('name')
            ->get(['id', 'name', 'code', 'pengprov', 'pengkab']);

        return Inertia::render('Dojo/FeeSettings', [
            'currentDojo' => $dojo,
            'allDojos' => $allDojos,
            'activeApprovedSetting' => $activeApprovedSetting,
            'currentRates' => $currentRates,
            'settings' => $settings,
            'pendingProposals' => $pendingProposals,
            'isPBOrAdmin' => $isPBOrAdmin,
            'isSensei' => $isSensei,
        ]);
    }

    /**
     * Submit new proposed fee setting.
     */
    public function store(Request $request, RequestDojoFeeSettingAction $action): RedirectResponse
    {
        $validated = $request->validate([
            'dojo_id' => ['required', 'uuid', 'exists:dojos,id'],
            'amount' => ['required', 'integer', 'min:50000', 'max:500000'],
            'effective_from' => ['required', 'string', 'regex:/^\d{4}-\d{2}$/'],
            'change_reason' => ['nullable', 'string', 'max:500'],
            'apply_to_all_dojos' => ['nullable', 'boolean'],
            'rates' => ['nullable', 'array'],
            'rates.pb' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'rates.pengprov' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'rates.pengkot' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'rates.dojo' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'rates.pelatih' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ]);

        $rates = null;
        if (! empty($validated['rates'])) {
            $pb = (float) ($validated['rates']['pb'] ?? 20);
            $prov = (float) ($validated['rates']['pengprov'] ?? 10);
            $kot = (float) ($validated['rates']['pengkot'] ?? 10);
            $dojoRate = (float) ($validated['rates']['dojo'] ?? 20);
            $pelatih = (float) ($validated['rates']['pelatih'] ?? 40);

            $total = $pb + $prov + $kot + $dojoRate + $pelatih;
            if (abs($total - 100.0) > 0.01) {
                return back()->withErrors([
                    'rates' => "Total persentase pembagian 5 pihak harus tepat 100% (saat ini: {$total}%).",
                ]);
            }

            $rates = [
                'pb' => $pb,
                'pengprov' => $prov,
                'pengkot' => $kot,
                'dojo' => $dojoRate,
                'pelatih' => $pelatih,
            ];
        }

        $user = $request->user();
        $isPBOrAdmin = $user && $user->hasAnyRole(['SuperAdmin', 'PengprovAdmin']);
        $applyToAll = $request->boolean('apply_to_all_dojos');

        if ($applyToAll && $isPBOrAdmin) {
            $allDojos = Dojo::where('status', DojoStatus::Active)->get();
            $count = 0;
            foreach ($allDojos as $singleDojo) {
                $setting = $action->execute(
                    $singleDojo,
                    $validated['amount'],
                    $validated['effective_from'],
                    $validated['change_reason'] ?? 'Pengaturan tarif global sekali untuk semua dojo',
                    $user,
                    $rates
                );

                if ($user->hasRole('SuperAdmin') && $setting->status === FeeSettingStatus::PendingPB) {
                    app(ApproveDojoFeeSettingAction::class)->execute(
                        $setting,
                        $user,
                        'SK-MASSAL-'.date('Y')
                    );
                }
                $count++;
            }

            return back()->with('success', 'Tarif Rp'.number_format($validated['amount'], 0, ',', '.')." dan persentase alokasi berhasil disetel sekali untuk seluruh {$count} dojo terdaftar.");
        }

        $dojo = Dojo::findOrFail($validated['dojo_id']);

        $setting = $action->execute(
            $dojo,
            $validated['amount'],
            $validated['effective_from'],
            $validated['change_reason'] ?? null,
            $user,
            $rates
        );

        $msg = $setting->status === FeeSettingStatus::Approved
            ? 'Tarif resmi Rp'.number_format($setting->amount, 0, ',', '.')." berhasil diaktifkan untuk Dojo [{$dojo->name}]."
            : 'Usulan tarif Rp'.number_format($setting->amount, 0, ',', '.')." berhasil diajukan untuk Dojo [{$dojo->name}] dan sedang menunggu persetujuan tertulis PB PERKEMI.";

        return back()->with('success', $msg);
    }

    /**
     * PB PERKEMI authorizes proposed custom fee (Option A).
     */
    public function approve(DojoFeeSetting $setting, Request $request, ApproveDojoFeeSettingAction $action): RedirectResponse
    {
        $user = $request->user();
        if (! $user || ! $user->hasRole('SuperAdmin')) {
            abort(403, 'Hanya PB PERKEMI yang berhak menyetujui usulan tarif iuran di atas Rp50.000.');
        }

        $validated = $request->validate([
            'approval_sk_number' => ['required', 'string', 'max:150'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $action->execute(
            $setting,
            $user,
            $validated['approval_sk_number'],
            null
        );

        return back()->with('success', "Tarif Dojo [{$setting->dojo?->name}] Rp".number_format($setting->amount, 0, ',', '.')." resmi disahkan per SK No. {$validated['approval_sk_number']}.");
    }

    /**
     * PB PERKEMI rejects proposed custom fee.
     */
    public function reject(DojoFeeSetting $setting, Request $request): RedirectResponse
    {
        $user = $request->user();
        if (! $user || ! $user->hasRole('SuperAdmin')) {
            abort(403, 'Hanya PB PERKEMI yang berwenang menolak usulan tarif.');
        }

        $validated = $request->validate([
            'rejection_reason' => ['required', 'string', 'max:500'],
        ]);

        $setting->update([
            'status' => FeeSettingStatus::Rejected,
            'approved_by' => $user->id,
            'approved_at' => now(),
            'rejection_reason' => $validated['rejection_reason'],
        ]);

        return back()->with('success', "Usulan tarif ditolak: {$validated['rejection_reason']}");
    }
}
