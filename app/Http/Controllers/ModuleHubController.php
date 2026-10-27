<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\CoachEvaluation;
use App\Models\Dojo;
use App\Models\IndependentTraining;
use App\Models\Kenshi;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ModuleHubController extends Controller
{
    /**
     * Physical Performance sport science analytics & metrics.
     */
    public function physicalPerformance(Request $request): Response
    {
        return Inertia::render('Modules/PhysicalPerformance', [
            'totalAthletes' => Kenshi::where('member_type', 'athlete')->count(),
            'totalDojos' => Dojo::active()->count(),
        ]);
    }

    /**
     * Technical Performance tracking (Waza, Kihon, Embu, Randori).
     */
    public function technicalPerformance(Request $request): Response
    {
        return Inertia::render('Modules/TechnicalPerformance', [
            'totalAthletes' => Kenshi::where('member_type', 'athlete')->count(),
        ]);
    }

    /**
     * Independent Training logging & digital logbooks.
     */
    public function independentTraining(Request $request): Response
    {
        $user = $request->user();
        $isSuperAdmin = $user?->hasRole('SuperAdmin');
        $isSensei = $user?->hasRole('Sensei');
        $isPengurus = $user?->hasAnyRole(['PengprovAdmin', 'PengkabAdmin']);
        $isKenshiOnly = $user?->hasRole('Kenshi') && ! ($isSuperAdmin || $isSensei || $isPengurus);

        $currentKenshi = null;
        if ($user) {
            $currentKenshi = Kenshi::where('user_id', $user->id)->with('dojo')->first();
        }

        if ($isKenshiOnly && $currentKenshi) {
            $trainings = IndependentTraining::where('kenshi_id', $currentKenshi->id)
                ->latest('training_date')
                ->latest('created_at')
                ->get();

            $totalMinutes = (int) $trainings->sum('duration_minutes');
            $thisWeekCount = $trainings->where('training_date', '>=', now()->startOfWeek())->count();

            return Inertia::render('Modules/IndependentTraining', [
                'activeKenshis' => 1,
                'isKenshiOnly' => true,
                'currentKenshi' => $currentKenshi,
                'trainings' => $trainings,
                'stats' => [
                    'total_sessions' => $trainings->count(),
                    'total_minutes' => $totalMinutes,
                    'this_week_sessions' => $thisWeekCount,
                    'avg_duration' => $trainings->count() > 0 ? (int) round($totalMinutes / $trainings->count()) : 0,
                ],
            ]);
        }

        // Admin / Coach / Sensei view: can view all dojo logs
        $trainings = IndependentTraining::with(['kenshi.dojo', 'verifier'])
            ->latest('training_date')
            ->latest('created_at')
            ->take(50)
            ->get();

        $activeKenshisCount = Kenshi::active()->count();
        $totalMinutes = (int) $trainings->sum('duration_minutes');

        return Inertia::render('Modules/IndependentTraining', [
            'activeKenshis' => $activeKenshisCount,
            'isKenshiOnly' => false,
            'currentKenshi' => $currentKenshi,
            'trainings' => $trainings,
            'stats' => [
                'total_sessions' => $trainings->count(),
                'total_minutes' => $totalMinutes,
                'this_week_sessions' => $trainings->where('training_date', '>=', now()->startOfWeek())->count(),
                'avg_duration' => $trainings->count() > 0 ? (int) round($totalMinutes / $trainings->count()) : 35,
            ],
        ]);
    }

    /**
     * Store new independent training logbook entry.
     */
    public function storeIndependentTraining(Request $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validate([
            'kenshi_id' => ['nullable', 'uuid', 'exists:kenshis,id'],
            'training_date' => ['required', 'date'],
            'drill_type' => ['required', 'string', 'max:100'],
            'title' => ['required', 'string', 'max:255'],
            'duration_minutes' => ['required', 'integer', 'min:5', 'max:360'],
            'intensity' => ['required', 'string', 'in:light,medium,hard'],
            'reps_or_cycles' => ['nullable', 'string', 'max:150'],
            'estimated_calories' => ['nullable', 'integer', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $kenshiId = $validated['kenshi_id'] ?? null;
        if (! $kenshiId && $user) {
            $kenshi = Kenshi::where('user_id', $user->id)->first();
            $kenshiId = $kenshi?->id;
        }

        if (! $kenshiId) {
            return back()->with('error', 'Profil atlet kenshi tidak ditemukan.');
        }

        $validated['kenshi_id'] = $kenshiId;
        $validated['status'] = 'recorded';

        IndependentTraining::create($validated);

        return back()->with('success', 'Catatan sesi latihan mandiri berhasil disimpan ke logbook digital Anda.');
    }

    /**
     * Delete an independent training entry.
     */
    public function destroyIndependentTraining(IndependentTraining $training, Request $request): RedirectResponse
    {
        $user = $request->user();
        $isSuperAdmin = $user?->hasRole('SuperAdmin');
        $kenshi = $user ? Kenshi::where('user_id', $user->id)->first() : null;

        if (! $isSuperAdmin && $kenshi && $training->kenshi_id !== $kenshi->id) {
            abort(403, 'Anda tidak berhak menghapus catatan latihan ini.');
        }

        $training->delete();

        return back()->with('success', 'Catatan latihan mandiri berhasil dihapus.');
    }

    /**
     * Coach evaluations & assessments overview.
     */
    public function coachEvaluations(Request $request): Response
    {
        $user = $request->user();
        $isSuperAdmin = $user?->hasRole('SuperAdmin');
        $isSensei = $user?->hasRole('Sensei');
        $isPengurus = $user?->hasAnyRole(['PengprovAdmin', 'PengkabAdmin']);
        $isKenshiOnly = $user?->hasRole('Kenshi') && ! ($isSuperAdmin || $isSensei || $isPengurus);

        $currentKenshi = null;
        if ($user) {
            $currentKenshi = Kenshi::where('user_id', $user->id)->with('dojo')->first();
        }

        if ($isKenshiOnly && $currentKenshi) {
            $evaluations = CoachEvaluation::where('kenshi_id', $currentKenshi->id)
                ->with('coach')
                ->latest('evaluation_date')
                ->get();

            return Inertia::render('Modules/CoachEvaluation', [
                'isKenshiOnly' => true,
                'currentKenshi' => $currentKenshi,
                'evaluations' => $evaluations,
                'availableKenshis' => [],
            ]);
        }

        // Coach / Admin: can view evaluations and submit new evaluations
        $evaluations = CoachEvaluation::with(['kenshi.dojo', 'coach'])
            ->latest('evaluation_date')
            ->get();

        $availableKenshis = Kenshi::with('dojo')
            ->where('is_active', true)
            ->orderBy('full_name')
            ->get(['id', 'full_name', 'id_card_number', 'rank', 'dojo_id']);

        return Inertia::render('Modules/CoachEvaluation', [
            'isKenshiOnly' => false,
            'currentKenshi' => $currentKenshi,
            'evaluations' => $evaluations,
            'availableKenshis' => $availableKenshis,
        ]);
    }

    /**
     * Store a coach evaluation for a kenshi.
     */
    public function storeCoachEvaluation(Request $request): RedirectResponse
    {
        $user = $request->user();
        $isSuperAdmin = $user?->hasRole('SuperAdmin');
        $isSensei = $user?->hasRole('Sensei');
        $isPengurus = $user?->hasAnyRole(['PengprovAdmin', 'PengkabAdmin']);

        if (! ($isSuperAdmin || $isSensei || $isPengurus)) {
            abort(403, 'Hanya Sensei atau Pelatih yang berhak memberikan penilaian atlet.');
        }

        $validated = $request->validate([
            'kenshi_id' => ['required', 'uuid', 'exists:kenshis,id'],
            'evaluation_date' => ['required', 'date'],
            'technique_score' => ['required', 'integer', 'between:0,100'],
            'embu_score' => ['required', 'integer', 'between:0,100'],
            'randori_score' => ['required', 'integer', 'between:0,100'],
            'physical_score' => ['required', 'integer', 'between:0,100'],
            'discipline_score' => ['required', 'integer', 'between:0,100'],
            'recommendation' => ['nullable', 'string', 'max:150'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $overall = (int) round((
            $validated['technique_score'] +
            $validated['embu_score'] +
            $validated['randori_score'] +
            $validated['physical_score'] +
            $validated['discipline_score']
        ) / 5);

        $grade = match (true) {
            $overall >= 90 => 'A (Istimewa)',
            $overall >= 80 => 'B+ (Sangat Baik / Siap UKT)',
            $overall >= 70 => 'B (Baik)',
            $overall >= 60 => 'C (Cukup / Perlu Latihan)',
            default => 'D (Kurang)',
        };

        $validated['coach_id'] = $user->id;
        $validated['overall_score'] = $overall;
        $validated['grade'] = $grade;

        CoachEvaluation::create($validated);

        return back()->with('success', "Penilaian pelatih berhasil disimpan dengan skor rata-rata {$overall} ({$grade}).");
    }

    /**
     * Wellness, recovery, sleep, and fatigue monitoring.
     */
    public function wellnessRecovery(Request $request): Response
    {
        return Inertia::render('Modules/WellnessRecovery', [
            'monitoredAthletes' => Kenshi::where('member_type', 'athlete')->count(),
        ]);
    }

    /**
     * Competition Intelligence & tournament scouting.
     */
    public function competitionIntelligence(Request $request): Response
    {
        return Inertia::render('Modules/CompetitionIntelligence', [
            'totalDojos' => Dojo::active()->count(),
        ]);
    }

    /**
     * AI Athlete Intelligence - automated biomechanics & performance insights.
     */
    public function aiIntelligence(Request $request): Response
    {
        return Inertia::render('Modules/AiIntelligence', [
            'analyzedAthletes' => Kenshi::where('member_type', 'athlete')->count(),
        ]);
    }

    /**
     * Promotion & Degradation - UKT Roadmap & grading requirements.
     */
    public function promotions(Request $request): Response
    {
        $user = $request->user();
        $isSuperAdmin = (bool) $user?->hasRole('SuperAdmin');
        $isPengurus = (bool) $user?->hasAnyRole(['PengprovAdmin', 'PengkabAdmin']);
        $isSensei = (bool) $user?->hasRole('Sensei');
        $canPromote = $isSuperAdmin || $isPengurus || $isSensei;

        $isKenshiOnly = $user?->hasRole('Kenshi') && ! $canPromote;
        $currentKenshi = $isKenshiOnly ? Kenshi::where('user_id', $user->id)->first() : null;

        $query = Kenshi::with(['dojo', 'coachEvaluations' => fn ($q) => $q->latest('evaluation_date')->limit(1)])
            ->withCount('attendances')
            ->where('is_active', true);

        if ($currentKenshi) {
            $query->where('id', $currentKenshi->id);
        }

        $candidates = $query->orderByDesc('attendances_count')
            ->limit(30)
            ->get()
            ->map(function ($k) {
                $latestEv = $k->coachEvaluations->first();
                $next = $k->rank?->nextRank();

                return [
                    'id' => $k->id,
                    'id_card_number' => $k->id_card_number,
                    'full_name' => $k->full_name,
                    'dojo' => $k->dojo?->name ?? 'Dojo Pusat',
                    'rank' => $k->rank?->value,
                    'rank_label' => $k->rank?->label(),
                    'next_rank' => $next?->value,
                    'next_rank_label' => $next ? $next->label() : 'Tingkat Tertinggi',
                    'attendances_count' => $k->attendances_count,
                    'latest_score' => $latestEv?->overall_score,
                    'latest_grade' => $latestEv?->grade,
                    'recommendation' => $latestEv?->recommendation,
                    'is_ready' => $k->attendances_count >= 16 && ($latestEv?->overall_score ?? 0) >= 70,
                ];
            });

        $readyCount = $candidates->where('is_ready', true)->count();

        return Inertia::render('Modules/Promotions', [
            'candidates' => $candidates,
            'canPromote' => $canPromote,
            'isKenshiOnly' => $isKenshiOnly,
            'readyCount' => $readyCount,
            'totalCandidates' => $candidates->count(),
        ]);
    }

    /**
     * Promote a kenshi to the next rank tier.
     */
    public function promoteKenshi(Request $request, Kenshi $kenshi): RedirectResponse
    {
        $user = $request->user();
        $isSuperAdmin = (bool) $user?->hasRole('SuperAdmin');
        $isPengurus = (bool) $user?->hasAnyRole(['PengprovAdmin', 'PengkabAdmin']);
        $isSensei = (bool) $user?->hasRole('Sensei');

        if (! ($isSuperAdmin || $isPengurus || $isSensei)) {
            abort(403, 'Hanya Pengurus Federasi atau Sensei yang berhak mengesahkan kenaikan tingkat (UKT).');
        }

        $currentRank = $kenshi->rank;
        $nextRank = $currentRank?->nextRank();

        if (! $nextRank) {
            return back()->with('error', "Kenshi {$kenshi->full_name} sudah berada di tingkatan sabuk tertinggi.");
        }

        $kenshi->update(['rank' => $nextRank]);

        return back()->with('success', "Selamat! Kenshi {$kenshi->full_name} berhasil dinaikkan tingkat ke {$nextRank->label()}.");
    }

    /**
     * Finance & Accounting - dojo cashflow, membership dues, and federation ledger.
     */
    public function finance(Request $request): Response
    {
        return Inertia::render('Modules/Finance', [
            'totalDojos' => Dojo::count(),
            'totalMembers' => Kenshi::active()->count(),
        ]);
    }
}
