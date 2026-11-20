<?php

declare(strict_types=1);

namespace App\Actions\Examination;

use App\Enums\RegistrationStatus;
use App\Models\ExaminationRegistration;
use App\Models\ExaminationScore;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class SubmitExaminationScoreAction
{
    /**
     * Submit examiner digital scoring:
     * Dokuhon (15%), Goho (25%), Juho (25%), Embu (20%), Randori (15%).
     */
    public function execute(
        ExaminationRegistration $registration,
        User $examiner,
        int $dokuhon,
        int $goho,
        int $juho,
        int $embu,
        int $randori,
        ?string $notes = null
    ): ExaminationScore {
        return DB::transaction(function () use (
            $registration,
            $examiner,
            $dokuhon,
            $goho,
            $juho,
            $embu,
            $randori,
            $notes
        ): ExaminationScore {
            $weightedScore = round(
                ($dokuhon * 0.15) +
                ($goho * 0.25) +
                ($juho * 0.25) +
                ($embu * 0.20) +
                ($randori * 0.15),
                2
            );

            $score = ExaminationScore::updateOrCreate(
                [
                    'registration_id' => $registration->id,
                    'examiner_id' => $examiner->id,
                ],
                [
                    'dokuhon_score' => $dokuhon,
                    'goho_score' => $goho,
                    'juho_score' => $juho,
                    'embu_score' => $embu,
                    'randori_score' => $randori,
                    'total_weighted_score' => $weightedScore,
                    'notes' => $notes,
                ]
            );

            // Compute aggregate average across all examiners
            $avgScore = round((float) $registration->scores()->avg('total_weighted_score'), 2);

            $status = match (true) {
                $avgScore >= 70.00 => RegistrationStatus::Passed,
                $avgScore >= 60.00 => RegistrationStatus::Remedial,
                default => RegistrationStatus::Failed,
            };

            $grade = match (true) {
                $avgScore >= 85.00 => 'A (Istimewa)',
                $avgScore >= 70.00 => 'B (Lulus Standar)',
                $avgScore >= 60.00 => 'C (Ujian Ulang/Remedial)',
                default => 'D (Tidak Lulus)',
            };

            $registration->update([
                'final_score' => $avgScore,
                'status' => $status,
                'result_grade' => $grade,
            ]);

            activity('examination')
                ->performedOn($registration)
                ->causedBy($examiner)
                ->log("Skor penguji diinput untuk [{$registration->kenshi?->full_name}], nilai total: {$weightedScore}.");

            return $score;
        });
    }
}
