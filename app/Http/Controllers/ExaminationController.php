<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Examination\CheckUktEligibilityAction;
use App\Actions\Examination\PromoteKenshiUktAction;
use App\Actions\Examination\SubmitExaminationScoreAction;
use App\Enums\RegistrationStatus;
use App\Models\Examination;
use App\Models\ExaminationRegistration;
use App\Models\Kenshi;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExaminationController extends Controller
{
    /**
     * Display list of scheduled UKT events.
     */
    public function index(Request $request): Response
    {
        $examinations = Examination::withCount('registrations')
            ->latest('date')
            ->paginate(15);

        return Inertia::render('Examinations/Index', [
            'examinations' => $examinations,
        ]);
    }

    /**
     * Display specific UKT event detail and registered examinees.
     */
    public function show(Examination $examination, Request $request): Response
    {
        $examination->load(['registrations.kenshi.dojo', 'registrations.scores.examiner']);

        return Inertia::render('Examinations/Show', [
            'examination' => $examination,
            'isExaminer' => $request->user()?->hasAnyRole(['Sensei', 'SuperAdmin', 'PengprovAdmin']),
        ]);
    }

    /**
     * Register a kenshi for an upcoming UKT examination session.
     */
    public function register(
        Examination $examination,
        Request $request,
        CheckUktEligibilityAction $checker
    ): RedirectResponse {
        $user = $request->user();
        $kenshiId = $request->input('kenshi_id');

        $kenshi = $kenshiId
            ? Kenshi::findOrFail($kenshiId)
            : ($user ? Kenshi::where('user_id', $user->id)->first() : null);

        if (! $kenshi) {
            return back()->with('error', 'Profil kenshi tidak ditemukan.');
        }

        // Verify the 5 eligibility criteria
        $eligibility = $checker->execute($kenshi);

        if (! $eligibility['is_eligible']) {
            return back()->with('error', 'Kenshi belum memenuhi seluruh prasyarat wajib UKT (iuran, kehadiran, materi, atau evaluasi pelatih).');
        }

        $nextRank = $kenshi->rank?->nextRank();
        if (! $nextRank) {
            return back()->with('error', 'Kenshi telah mencapai tingkatan tertinggi.');
        }

        ExaminationRegistration::updateOrCreate(
            [
                'examination_id' => $examination->id,
                'kenshi_id' => $kenshi->id,
            ],
            [
                'current_rank' => $kenshi->rank,
                'target_rank' => $nextRank,
                'eligibility_check' => $eligibility['criteria'],
                'is_eligible' => true,
                'status' => RegistrationStatus::Verified,
                'chest_number' => 'NO-'.rand(10, 99),
            ]
        );

        return back()->with('success', "Pendaftaran UKT berhasil. Kenshi [{$kenshi->full_name}] telah diverifikasi lolos 5 prasyarat.");
    }

    /**
     * Examiner inputs digital score for an examinee.
     */
    public function submitScore(Request $request, SubmitExaminationScoreAction $scorer): RedirectResponse
    {
        $validated = $request->validate([
            'registration_id' => ['required', 'uuid', 'exists:examination_registrations,id'],
            'dokuhon_score' => ['required', 'integer', 'between:0,100'],
            'goho_score' => ['required', 'integer', 'between:0,100'],
            'juho_score' => ['required', 'integer', 'between:0,100'],
            'embu_score' => ['required', 'integer', 'between:0,100'],
            'randori_score' => ['required', 'integer', 'between:0,100'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $registration = ExaminationRegistration::findOrFail($validated['registration_id']);

        $scorer->execute(
            $registration,
            $request->user(),
            $validated['dokuhon_score'],
            $validated['goho_score'],
            $validated['juho_score'],
            $validated['embu_score'],
            $validated['randori_score'],
            $validated['notes'] ?? null
        );

        return back()->with('success', "Penilaian dewan penguji berhasil disimpan dengan skor akhir {$registration->fresh()->final_score}.");
    }

    /**
     * Finalize exam results and promote passed kenshi.
     */
    public function finalize(
        ExaminationRegistration $registration,
        Request $request,
        PromoteKenshiUktAction $promoter
    ): RedirectResponse {
        $user = $request->user();
        if (! $user?->hasAnyRole(['SuperAdmin', 'PengprovAdmin', 'PengkabAdmin', 'Sensei'])) {
            abort(403, 'Anda tidak berwenang mengesahkan kenaikan tingkat kenshi.');
        }

        $kenshi = $registration->kenshi;
        $examination = $registration->examination;

        $promotion = $promoter->execute(
            $kenshi,
            $user,
            $examination,
            $request->input('sk_number'),
            $request->input('certificate_number'),
            $request->input('notes')
        );

        $registration->update(['status' => RegistrationStatus::Passed]);

        return back()->with('success', "Selamat! Kenshi [{$kenshi->full_name}] resmi dipromosikan ke tingkat [{$promotion->new_rank->label()}].");
    }

    /**
     * Kenshi UKT Portal: roadmap, eligibility check, and exam registration.
     */
    public function kenshiPortal(Request $request, CheckUktEligibilityAction $checker): Response
    {
        $user = $request->user();
        $kenshi = $user ? Kenshi::where('user_id', $user->id)->with('dojo')->first() : null;

        if (! $kenshi) {
            $kenshi = Kenshi::with('dojo')->first();
        }

        $eligibility = $kenshi ? $checker->execute($kenshi) : null;

        $upcomingExaminations = Examination::open()->latest('date')->take(5)->get();

        $activeRegistration = $kenshi ? ExaminationRegistration::where('kenshi_id', $kenshi->id)
            ->with('examination')
            ->latest()
            ->first() : null;

        return Inertia::render('Examinations/KenshiPortal', [
            'currentKenshi' => $kenshi,
            'eligibility' => $eligibility,
            'upcomingExaminations' => $upcomingExaminations,
            'activeRegistration' => $activeRegistration,
        ]);
    }
}
