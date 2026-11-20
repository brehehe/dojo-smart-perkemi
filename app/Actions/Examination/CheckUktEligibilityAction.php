<?php

declare(strict_types=1);

namespace App\Actions\Examination;

use App\Models\CoachEvaluation;
use App\Models\Kenshi;
use App\Models\Material;

class CheckUktEligibilityAction
{
    /**
     * Verify all 5 eligibility criteria for UKT examination:
     * 1. Bebas tunggakan iuran (Dues paid)
     * 2. Presensi latihan minimal 16 sesi (Attendance >= 16)
     * 3. Seluruh modul materi kurikulum sabuk saat ini telah selesai (Material progress)
     * 4. Nilai evaluasi Sensei minimal 70 / Grade B (Coach evaluation >= 70)
     * 5. Status keaktifan kenshi aktif (is_active)
     *
     * @return array{is_eligible: bool, criteria: array<string, mixed>}
     */
    public function execute(Kenshi $kenshi): array
    {
        // 1. Dues paid check
        $hasUnpaidDues = $kenshi->hasUnpaidDues();
        $duesEligible = ! $hasUnpaidDues;

        // 2. Attendance count check (>= 16)
        $attendanceCount = $kenshi->attendances()->count();
        $attendanceEligible = $attendanceCount >= 16;

        // 3. Materials completed for current rank
        $totalRankMaterials = Material::where('target_rank', $kenshi->rank?->value ?? 'minarai')
            ->where('is_active', true)
            ->count();

        $completedRankMaterials = $kenshi->materialProgresses()
            ->where('is_completed', true)
            ->whereHas('material', fn ($q) => $q->where('target_rank', $kenshi->rank?->value ?? 'minarai'))
            ->count();

        $materialEligible = $totalRankMaterials === 0 || $completedRankMaterials >= $totalRankMaterials;

        // 4. Coach evaluation check (score >= 70)
        $latestEvaluation = CoachEvaluation::where('kenshi_id', $kenshi->id)
            ->latest('evaluation_date')
            ->first();

        $coachScore = $latestEvaluation?->overall_score ?? 0;
        $coachEligible = $coachScore >= 70;

        // 5. Active status
        $isActive = (bool) $kenshi->is_active;

        $isEligible = $duesEligible && $attendanceEligible && $materialEligible && $coachEligible && $isActive;

        return [
            'is_eligible' => $isEligible,
            'criteria' => [
                'dues_paid' => [
                    'passed' => $duesEligible,
                    'label' => 'Bebas Tunggakan Iuran',
                    'detail' => $duesEligible ? 'Lunas' : 'Ada tunggakan iuran',
                ],
                'attendance' => [
                    'passed' => $attendanceEligible,
                    'label' => 'Presensi Latihan',
                    'count' => $attendanceCount,
                    'required' => 16,
                    'detail' => "{$attendanceCount} / 16 Sesi",
                ],
                'material_progress' => [
                    'passed' => $materialEligible,
                    'label' => 'Kelulusan Kurikulum Video & PDF',
                    'completed' => $completedRankMaterials,
                    'total' => $totalRankMaterials,
                    'detail' => $totalRankMaterials > 0 ? "{$completedRankMaterials} / {$totalRankMaterials} Modul" : '100% Selesai',
                ],
                'coach_evaluation' => [
                    'passed' => $coachEligible,
                    'label' => 'Rekomendasi Pelatih Dojo',
                    'score' => $coachScore,
                    'grade' => $latestEvaluation?->grade ?? 'Belum Dinilai',
                    'detail' => $coachEligible ? "Skor {$coachScore} ({$latestEvaluation?->grade})" : 'Belum memenuhi batas minimal skor 70',
                ],
                'membership_active' => [
                    'passed' => $isActive,
                    'label' => 'Status Keanggotaan',
                    'detail' => $isActive ? 'Aktif' : 'Non-Aktif',
                ],
            ],
        ];
    }
}
