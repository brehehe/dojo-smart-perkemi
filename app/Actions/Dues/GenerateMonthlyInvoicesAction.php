<?php

declare(strict_types=1);

namespace App\Actions\Dues;

use App\Enums\FeeSettingStatus;
use App\Enums\InvoiceStatus;
use App\Enums\InvoiceType;
use App\Models\DojoFeeSetting;
use App\Models\Invoice;
use App\Models\Kenshi;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class GenerateMonthlyInvoicesAction
{
    /**
     * Generate monthly dues invoice for active kenshi in a given period (YYYY-MM).
     *
     * @return Collection<int, Invoice>
     */
    public function execute(string $period, ?string $dojoId = null, ?string $kenshiId = null): Collection
    {
        $query = Kenshi::where('is_active', true)->with('dojo');

        if ($kenshiId) {
            $query->where('id', $kenshiId);
        } elseif ($dojoId) {
            $query->where('dojo_id', $dojoId);
        }

        $kenshis = $query->get();
        $generated = collect();

        $carbonPeriod = Carbon::createFromFormat('Y-m', $period);
        $dueDate = $carbonPeriod->copy()->day(10)->toDateString();

        foreach ($kenshis as $kenshi) {
            $isDan = $kenshi->rank?->isDan() ?? false;
            $type = $isDan ? InvoiceType::DanMonthly : InvoiceType::KyuMonthly;

            // Check if invoice already exists for this kenshi, type, and period
            $existing = Invoice::where('kenshi_id', $kenshi->id)
                ->where('type', $type)
                ->where('period', $period)
                ->first();

            if ($existing) {
                $generated->push($existing);

                continue;
            }

            // Determine fee amount
            if ($isDan) {
                $amount = 50000;
                $feeSettingId = null;
            } else {
                $activeSetting = DojoFeeSetting::where('dojo_id', $kenshi->dojo_id)
                    ->where('category', 'kyukenshi')
                    ->where('status', FeeSettingStatus::Approved)
                    ->where('effective_from', '<=', $period)
                    ->latest('effective_from')
                    ->first();

                $amount = $activeSetting ? $activeSetting->amount : 50000;
                $feeSettingId = $activeSetting?->id;
            }

            $invoice = Invoice::create([
                'kenshi_id' => $kenshi->id,
                'dojo_id' => $kenshi->dojo_id,
                'type' => $type,
                'period' => $period,
                'amount' => $amount,
                'fee_setting_id' => $feeSettingId,
                'status' => InvoiceStatus::Unpaid,
                'due_date' => $dueDate,
                'policy_snapshot' => [
                    'sk_reference' => 'SK PB PERKEMI No. 045/SK-PB/VII/2025',
                    'standard_amount' => 50000,
                    'configured_amount' => $amount,
                    'is_dan' => $isDan,
                ],
            ]);

            $generated->push($invoice);
        }

        return $generated;
    }
}
