<?php

declare(strict_types=1);

namespace App\Actions\Examination;

use App\Enums\KenshiRank;
use App\Models\Examination;
use App\Models\Kenshi;
use App\Models\KenshiPromotion;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class PromoteKenshiUktAction
{
    /**
     * Promote kenshi to the next rank, log certificate record, and auto-update KTA.
     */
    public function execute(
        Kenshi $kenshi,
        User $promoter,
        ?Examination $examination = null,
        ?string $skNumber = null,
        ?string $certNumber = null,
        ?string $notes = null
    ): KenshiPromotion {
        return DB::transaction(function () use (
            $kenshi,
            $promoter,
            $examination,
            $skNumber,
            $certNumber,
            $notes
        ): KenshiPromotion {
            $prevRank = $kenshi->rank ?? KenshiRank::Minarai;
            $nextRank = $prevRank->nextRank();

            if (! $nextRank) {
                throw new \InvalidArgumentException("Kenshi {$kenshi->full_name} sudah mencapai tingkatan tertinggi.");
            }

            // Update Kenshi model
            $kenshi->update([
                'rank' => $nextRank,
            ]);

            // Create Promotion certificate record
            $promotion = KenshiPromotion::create([
                'kenshi_id' => $kenshi->id,
                'previous_rank' => $prevRank,
                'new_rank' => $nextRank,
                'promotion_date' => now()->toDateString(),
                'sk_number' => $skNumber ?? 'SK-UKT-PERKEMI-'.now()->format('Y/m/d'),
                'certificate_number' => $certNumber ?? 'CERT-'.now()->format('Ymd').'-'.strtoupper(substr($kenshi->id, 0, 6)),
                'examination_id' => $examination?->id,
                'promoted_by' => $promoter->id,
                'notes' => $notes,
            ]);

            activity('promotion')
                ->performedOn($kenshi)
                ->causedBy($promoter)
                ->log("Kenshi [{$kenshi->full_name}] resmi dipromosikan dari [{$prevRank->label()}] ke [{$nextRank->label()}].");

            return $promotion;
        });
    }
}
