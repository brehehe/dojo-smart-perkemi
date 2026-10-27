<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Jobs\ExportReportJob;
use App\Models\Attendance;
use App\Models\CoachEvaluation;
use App\Models\Dojo;
use App\Models\IndependentTraining;
use App\Models\Kenshi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    /**
     * Display the Central Reporting & Analytics Command Hub.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $isKenshiOnly = $user && $user->hasRole('Kenshi') && ! $user->hasAnyRole(['SuperAdmin', 'PengprovAdmin', 'PengkabAdmin', 'Sensei']);
        $selfKenshi = $isKenshiOnly ? $user->kenshi : null;

        // Base metrics calculation
        if ($selfKenshi) {
            $evaluationsQuery = CoachEvaluation::where('kenshi_id', $selfKenshi->id);
            $independentQuery = IndependentTraining::where('kenshi_id', $selfKenshi->id);
            $attendancesCount = Attendance::where('kenshi_id', $selfKenshi->id)->count();

            $metrics = [
                'is_kenshi_only' => true,
                'total_dojos' => $selfKenshi->dojo_id ? 1 : 0,
                'active_dojos' => $selfKenshi->dojo_id ? 1 : 0,
                'total_kenshis' => 1,
                'total_athletes' => 1,
                'total_coaches' => 0,
                'total_attendances' => $attendancesCount,
                'today_attendances' => Attendance::where('kenshi_id', $selfKenshi->id)->whereDate('created_at', today())->count(),
                'total_evaluations' => (clone $evaluationsQuery)->count(),
                'avg_evaluation_score' => (int) round((clone $evaluationsQuery)->avg('overall_score') ?? 0),
                'ready_ukt_count' => $attendancesCount >= 16 ? 1 : 0,
                'total_independent_trainings' => (clone $independentQuery)->count(),
                'total_training_minutes' => (int) (clone $independentQuery)->sum('duration_minutes'),
            ];

            $aspectAverages = [
                'technique' => (int) round((clone $evaluationsQuery)->avg('technique_score') ?? 80),
                'embu' => (int) round((clone $evaluationsQuery)->avg('embu_score') ?? 80),
                'randori' => (int) round((clone $evaluationsQuery)->avg('randori_score') ?? 75),
                'physical' => (int) round((clone $evaluationsQuery)->avg('physical_score') ?? 85),
                'discipline' => (int) round((clone $evaluationsQuery)->avg('discipline_score') ?? 90),
                'overall' => (int) round((clone $evaluationsQuery)->avg('overall_score') ?? 82),
            ];

            $recentEvaluations = (clone $evaluationsQuery)->with('coach')->latest('evaluation_date')->take(6)->get();
            $recentIndependent = (clone $independentQuery)->latest('training_date')->take(6)->get();
            $recentAttendances = Attendance::where('kenshi_id', $selfKenshi->id)->with('schedule.dojo')->latest()->take(6)->get();
            $recentKenshis = collect([$selfKenshi->load('dojo')]);
            $recentDojos = $selfKenshi->dojo ? collect([$selfKenshi->dojo]) : collect([]);
            $promotionCandidates = collect([[
                'id' => $selfKenshi->id,
                'id_card_number' => $selfKenshi->id_card_number,
                'full_name' => $selfKenshi->full_name,
                'dojo_name' => $selfKenshi->dojo?->name ?? '-',
                'rank_label' => $selfKenshi->rank?->label(),
                'next_rank_label' => $selfKenshi->rank?->nextRank()?->label() ?? 'Tingkat Tertinggi',
                'attendances_count' => $attendancesCount,
                'latest_score' => $recentEvaluations->first()?->overall_score ?? '-',
                'is_ready' => $attendancesCount >= 16 && ($recentEvaluations->first()?->overall_score ?? 0) >= 70,
            ]]);
        } else {
            $totalEvaluations = CoachEvaluation::count();
            $avgScore = $totalEvaluations > 0 ? (int) round(CoachEvaluation::avg('overall_score')) : 82;
            $totalIndependent = IndependentTraining::count();
            $totalMinutes = (int) IndependentTraining::sum('duration_minutes');

            $metrics = [
                'is_kenshi_only' => false,
                'total_dojos' => Dojo::count(),
                'active_dojos' => Dojo::active()->count(),
                'total_kenshis' => Kenshi::count(),
                'total_athletes' => Kenshi::where('member_type', 'athlete')->count(),
                'total_coaches' => Kenshi::where('member_type', 'coach')->count(),
                'total_attendances' => Attendance::count(),
                'today_attendances' => Attendance::whereDate('created_at', today())->count(),
                'total_evaluations' => $totalEvaluations,
                'avg_evaluation_score' => $avgScore,
                'ready_ukt_count' => Kenshi::has('attendances', '>=', 16)->count(),
                'total_independent_trainings' => $totalIndependent,
                'total_training_minutes' => $totalMinutes,
            ];

            $aspectAverages = [
                'technique' => (int) round(CoachEvaluation::avg('technique_score') ?? 84),
                'embu' => (int) round(CoachEvaluation::avg('embu_score') ?? 82),
                'randori' => (int) round(CoachEvaluation::avg('randori_score') ?? 78),
                'physical' => (int) round(CoachEvaluation::avg('physical_score') ?? 85),
                'discipline' => (int) round(CoachEvaluation::avg('discipline_score') ?? 91),
                'overall' => $avgScore,
            ];

            $recentEvaluations = CoachEvaluation::with(['kenshi.dojo', 'coach'])->latest('evaluation_date')->take(6)->get();
            $recentIndependent = IndependentTraining::with('kenshi.dojo')->latest('training_date')->take(6)->get();
            $recentAttendances = Attendance::with(['kenshi', 'schedule.dojo'])->latest()->take(6)->get();
            $recentKenshis = Kenshi::with('dojo')->latest()->take(6)->get();
            $recentDojos = Dojo::with('headSensei')->withCount('kenshis')->latest()->take(6)->get();

            $promotionCandidates = Kenshi::with(['dojo', 'coachEvaluations' => fn ($q) => $q->latest('evaluation_date')->limit(1)])
                ->withCount('attendances')
                ->where('is_active', true)
                ->orderByDesc('attendances_count')
                ->take(6)
                ->get()
                ->map(function ($k) {
                    $latestEv = $k->coachEvaluations->first();
                    $next = $k->rank?->nextRank();

                    return [
                        'id' => $k->id,
                        'id_card_number' => $k->id_card_number,
                        'full_name' => $k->full_name,
                        'dojo_name' => $k->dojo?->name ?? '-',
                        'rank_label' => $k->rank?->label(),
                        'next_rank_label' => $next ? $next->label() : 'Tingkat Tertinggi',
                        'attendances_count' => $k->attendances_count,
                        'latest_score' => $latestEv?->overall_score ?? '-',
                        'is_ready' => $k->attendances_count >= 16 && ($latestEv?->overall_score ?? 0) >= 70,
                    ];
                });
        }

        $dojosList = Dojo::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Reports/Index', [
            'metrics' => $metrics,
            'aspectAverages' => $aspectAverages,
            'recentData' => [
                'dojos' => $recentDojos,
                'kenshis' => $recentKenshis,
                'attendances' => $recentAttendances,
                'evaluations' => $recentEvaluations,
                'independentTrainings' => $recentIndependent,
                'promotions' => $promotionCandidates,
            ],
            'dojosList' => $dojosList,
            'isKenshiOnly' => $isKenshiOnly,
        ]);
    }

    /**
     * Dispatch background export job via Laravel Queue or handle immediate download.
     */
    public function export(Request $request): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'string', 'in:dojo,kenshi,attendance,evaluation,independent,promotion'],
            'format' => ['required', 'string', 'in:excel,pdf'],
            'mode' => ['nullable', 'string', 'in:queue,direct'],
        ]);

        $type = $validated['type'];
        $format = $validated['format'];
        $mode = $validated['mode'] ?? 'queue';

        $exportId = Str::uuid()->toString();

        Cache::put("export_job_{$exportId}", [
            'status' => 'pending',
            'type' => $type,
            'format' => $format,
            'export_id' => $exportId,
            'created_at' => now()->toIso8601String(),
            'user_id' => $request->user()?->id,
        ], now()->addHours(6));

        if ($mode === 'direct') {
            // Synchronous execution
            $job = new ExportReportJob($type, $format, $exportId, (string) $request->user()?->id);
            $job->handle();

            return redirect()->route('reports.download', ['exportId' => $exportId]);
        }

        // Asynchronous processing using Laravel Queue (QUEUE_CONNECTION=database)
        ExportReportJob::dispatch($type, $format, $exportId, (string) $request->user()?->id);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => "Pekerjaan ekspor antrean [{$type}] dalam format [{$format}] telah dijadwalkan di background worker queue.",
                'export_id' => $exportId,
                'status' => 'pending',
            ]);
        }

        return back()->with('success', "Proses ekspor laporan {$type} ({$format}) telah dikirim ke Queue. File akan siap diunduh dalam beberapa saat.");
    }

    /**
     * Poll queue job status.
     */
    public function status(string $exportId): JsonResponse
    {
        $data = Cache::get("export_job_{$exportId}");

        if (! $data) {
            return response()->json([
                'status' => 'not_found',
                'message' => 'ID ekspor tidak ditemukan atau telah kadaluarsa.',
            ], 404);
        }

        return response()->json($data);
    }

    /**
     * Download completed exported file.
     */
    public function download(string $exportId): BinaryFileResponse|StreamedResponse|Response
    {
        $data = Cache::get("export_job_{$exportId}");

        if (! $data || empty($data['path'])) {
            abort(404, 'File ekspor belum selesai atau sudah kadaluarsa.');
        }

        $path = $data['path'];

        if (! Storage::disk('local')->exists($path)) {
            abort(404, 'File hasil ekspor tidak ditemukan di penyimpanan server.');
        }

        $fullPath = Storage::disk('local')->path($path);
        $filename = $data['filename'] ?? basename($path);

        if ($data['format'] === 'pdf') {
            // HTML printable report served inline for printing/viewing
            return response()->file($fullPath, [
                'Content-Type' => 'text/html; charset=UTF-8',
                'Content-Disposition' => "inline; filename=\"{$filename}\"",
            ]);
        }

        return Storage::disk('local')->download($path, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
