<?php

declare(strict_types=1);

namespace App\Actions\Dues;

use App\Enums\AllocationStatus;
use App\Enums\BeneficiaryType;
use App\Enums\InvoiceType;
use App\Models\Allocation;
use App\Models\Invoice;
use Illuminate\Support\Collection;

class CalculateAllocationAction
{
    /**
     * Calculate and persist dues allocation entries based on SK PB No. 045/SK-PB/VII/2025.
     *
     * @return Collection<int, Allocation>
     */
    public function execute(Invoice $invoice, int $amount): Collection
    {
        $dojo = $invoice->dojo;
        $allocations = collect();

        // 1. Kyukenshi Monthly Dues: 5 Beneficiaries (Default 20% / 10% / 10% / 20% / 40% or Configured)
        if ($invoice->type === InvoiceType::KyuMonthly) {
            $rates = [
                'pb' => 20.0,
                'pengprov' => 10.0,
                'pengkot' => 10.0,
                'dojo' => 20.0,
                'pelatih' => 40.0,
            ];

            $feeSetting = $invoice->feeSetting;
            if ($feeSetting && ! empty($feeSetting->metadata['allocation_rates'])) {
                $customRates = $feeSetting->metadata['allocation_rates'];
                $rates['pb'] = (float) ($customRates['pb'] ?? 20.0);
                $rates['pengprov'] = (float) ($customRates['pengprov'] ?? 10.0);
                $rates['pengkot'] = (float) ($customRates['pengkot'] ?? 10.0);
                $rates['dojo'] = (float) ($customRates['dojo'] ?? 20.0);
                $rates['pelatih'] = (float) ($customRates['pelatih'] ?? 40.0);
            }

            // Integer parts
            $pbShare = (int) floor($amount * ($rates['pb'] / 100));
            $provShare = (int) floor($amount * ($rates['pengprov'] / 100));
            $kotShare = (int) floor($amount * ($rates['pengkot'] / 100));
            $dojoShare = (int) floor($amount * ($rates['dojo'] / 100));
            $pelatihShare = (int) floor($amount * ($rates['pelatih'] / 100));

            // Deterministic rounding remainder distribution (PB -> Prov -> Kota -> Dojo -> Pelatih)
            $allocatedSum = $pbShare + $provShare + $kotShare + $dojoShare + $pelatihShare;
            $remainder = $amount - $allocatedSum;

            if ($remainder > 0) {
                $pbShare += 1;
                $remainder--;
            }
            if ($remainder > 0) {
                $provShare += 1;
                $remainder--;
            }
            if ($remainder > 0) {
                $kotShare += 1;
                $remainder--;
            }
            if ($remainder > 0) {
                $dojoShare += 1;
                $remainder--;
            }
            if ($remainder > 0) {
                $pelatihShare += 1;
                $remainder--;
            }

            $beneficiaries = [
                [
                    'type' => BeneficiaryType::PbPerkemi,
                    'id' => null,
                    'rate' => $rates['pb'],
                    'amount' => $pbShare,
                ],
                [
                    'type' => BeneficiaryType::Pengprov,
                    'id' => $dojo?->pengprov ? null : null,
                    'rate' => $rates['pengprov'],
                    'amount' => $provShare,
                ],
                [
                    'type' => BeneficiaryType::Pengkot,
                    'id' => $dojo?->pengkab ? null : null,
                    'rate' => $rates['pengkot'],
                    'amount' => $kotShare,
                ],
                [
                    'type' => BeneficiaryType::Dojo,
                    'id' => $dojo?->id,
                    'rate' => $rates['dojo'],
                    'amount' => $dojoShare,
                ],
                [
                    'type' => BeneficiaryType::Pelatih,
                    'id' => $dojo?->head_sensei_id,
                    'rate' => $rates['pelatih'],
                    'amount' => $pelatihShare,
                ],
            ];

            foreach ($beneficiaries as $b) {
                $allocations->push(Allocation::create([
                    'invoice_id' => $invoice->id,
                    'beneficiary_type' => $b['type'],
                    'beneficiary_id' => $b['id'],
                    'rate_percentage' => $b['rate'],
                    'amount' => $b['amount'],
                    'status' => AllocationStatus::Allocated,
                ]));
            }

            return $allocations;
        }

        // 2. Yudansha, Registration & WSKO Fee: 100% to PB PERKEMI
        $allocations->push(Allocation::create([
            'invoice_id' => $invoice->id,
            'beneficiary_type' => BeneficiaryType::PbPerkemi,
            'beneficiary_id' => null,
            'rate_percentage' => 100.00,
            'amount' => $amount,
            'status' => AllocationStatus::Allocated,
            'metadata' => [
                'note' => match ($invoice->type) {
                    InvoiceType::DanMonthly => '100% Iuran Yudansha ke PB PERKEMI',
                    InvoiceType::RegistrationRegular => 'Pendaftaran Reguler Rp60.000 (PB Rp50k + WSKO Rp10k)',
                    InvoiceType::RegistrationExecutive => 'Pendaftaran Eksekutif Rp160.000 (PB Rp150k + WSKO Rp10k)',
                    InvoiceType::WskoAnnual => 'Membership Fee WSKO Tahunan Rp10.000',
                    default => 'Setoran Tunggal PB PERKEMI',
                },
            ],
        ]));

        return $allocations;
    }
}
