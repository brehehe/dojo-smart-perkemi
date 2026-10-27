<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\DojoStatus;
use App\Enums\KenshiRank;
use App\Http\Resources\KenshiResource;
use App\Http\Resources\TrainingScheduleResource;
use App\Models\Attendance;
use App\Models\CoachEvaluation;
use App\Models\Dojo;
use App\Models\IndependentTraining;
use App\Models\Kenshi;
use App\Models\TrainingSchedule;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class DashboardController extends Controller
{
    /**
     * Display the national Perkemi command center & executive dashboard.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $isSuperAdmin = $user?->hasRole('SuperAdmin');
        $isSensei = $user?->hasRole('Sensei');
        $isPengurus = $user?->hasAnyRole(['PengprovAdmin', 'PengkabAdmin']);
        $isKenshiOnly = $user?->hasRole('Kenshi') && ! ($isSuperAdmin || $isSensei || $isPengurus);

        $kenshiProfile = null;
        $kenshiStats = null;
        $latestEvaluation = null;
        $upcomingSchedule = null;
        $recentTrainings = null;

        if ($user) {
            $kenshiProfile = Kenshi::where('user_id', $user->id)->with('dojo')->first();
        }

        if ($isKenshiOnly && $kenshiProfile) {
            $totalAttendances = Attendance::where('kenshi_id', $kenshiProfile->id)->count();
            $presentCount = Attendance::where('kenshi_id', $kenshiProfile->id)->where('status', 'present')->count();
            $lateCount = Attendance::where('kenshi_id', $kenshiProfile->id)->where('status', 'late')->count();
            $excusedCount = Attendance::where('kenshi_id', $kenshiProfile->id)->where('status', 'excused')->count();
            $sickCount = Attendance::where('kenshi_id', $kenshiProfile->id)->where('status', 'sick')->count();
            $absentCount = Attendance::where('kenshi_id', $kenshiProfile->id)->where('status', 'absent')->count();
            $attendedTotal = $presentCount + $lateCount;

            $kenshiStats = [
                'total_attendances' => $totalAttendances,
                'attended_total' => $attendedTotal,
                'present_count' => $presentCount,
                'late_count' => $lateCount,
                'excused_count' => $excusedCount,
                'sick_count' => $sickCount,
                'absent_count' => $absentCount,
                'attendance_rate' => $totalAttendances > 0 ? (int) round(($attendedTotal / $totalAttendances) * 100) : 100,
                'independent_sessions' => IndependentTraining::where('kenshi_id', $kenshiProfile->id)->count(),
                'independent_minutes' => (int) IndependentTraining::where('kenshi_id', $kenshiProfile->id)->sum('duration_minutes'),
            ];

            $latestEvaluation = CoachEvaluation::where('kenshi_id', $kenshiProfile->id)
                ->with('coach')
                ->latest('evaluation_date')
                ->first();

            $upcoming = TrainingSchedule::where('dojo_id', $kenshiProfile->dojo_id)
                ->whereDate('date', '>=', today())
                ->orderBy('date')
                ->orderBy('start_time')
                ->first();

            $upcomingSchedule = $upcoming ? new TrainingScheduleResource($upcoming) : null;

            $recentTrainings = IndependentTraining::where('kenshi_id', $kenshiProfile->id)
                ->latest('training_date')
                ->take(4)
                ->get();
        }

        $totalDojos = Dojo::count();
        $activeDojos = Dojo::where('status', DojoStatus::Active)->count();
        $totalKenshis = Kenshi::count();

        $allKenshis = Kenshi::select('id', 'rank', 'is_active', 'dojo_id')->get();
        $yudanshaCount = $allKenshis->filter(fn (Kenshi $k) => $k->rank->isDan())->count();
        $mudanshaCount = $totalKenshis - $yudanshaCount;

        // Rank tier distribution
        $rankDistribution = [
            'Dan (Yudansha)' => [
                'count' => $yudanshaCount,
                'color' => '#0F172A',
                'percentage' => $totalKenshis > 0 ? round(($yudanshaCount / $totalKenshis) * 100) : 0,
            ],
            'Sabuk Coklat (Kyu 1 - 3)' => [
                'count' => $allKenshis->filter(fn (Kenshi $k) => in_array($k->rank, [KenshiRank::Kyu1, KenshiRank::Kyu2, KenshiRank::Kyu3]))->count(),
                'color' => '#78350F',
                'percentage' => $totalKenshis > 0 ? round(($allKenshis->filter(fn (Kenshi $k) => in_array($k->rank, [KenshiRank::Kyu1, KenshiRank::Kyu2, KenshiRank::Kyu3]))->count() / $totalKenshis) * 100) : 0,
            ],
            'Sabuk Hijau / Biru (Kyu 4 - 6)' => [
                'count' => $allKenshis->filter(fn (Kenshi $k) => in_array($k->rank, [KenshiRank::Kyu4, KenshiRank::Kyu5, KenshiRank::Kyu6]))->count(),
                'color' => '#059669',
                'percentage' => $totalKenshis > 0 ? round(($allKenshis->filter(fn (Kenshi $k) => in_array($k->rank, [KenshiRank::Kyu4, KenshiRank::Kyu5, KenshiRank::Kyu6]))->count() / $totalKenshis) * 100) : 0,
            ],
            'Sabuk Kuning / Putih (Kyu 7 - Minarai)' => [
                'count' => $allKenshis->filter(fn (Kenshi $k) => in_array($k->rank, [KenshiRank::Kyu7, KenshiRank::Kyu8, KenshiRank::Minarai]))->count(),
                'color' => '#D97706',
                'percentage' => $totalKenshis > 0 ? round(($allKenshis->filter(fn (Kenshi $k) => in_array($k->rank, [KenshiRank::Kyu7, KenshiRank::Kyu8, KenshiRank::Minarai]))->count() / $totalKenshis) * 100) : 0,
            ],
        ];

        // Regional Distribution (Pengprov Breakdown)
        $regions = Dojo::query()
            ->select('dojos.pengprov')
            ->selectRaw('count(distinct dojos.id) as dojo_count')
            ->selectRaw('count(kenshis.id) as kenshis_count')
            ->leftJoin('kenshis', function ($join) {
                $join->on('dojos.id', '=', 'kenshis.dojo_id')
                    ->whereNull('kenshis.deleted_at');
            })
            ->whereNull('dojos.deleted_at')
            ->groupBy('dojos.pengprov')
            ->orderByDesc('kenshis_count')
            ->take(6)
            ->get();

        // Recent Kenshi Registrations
        $recentKenshis = Kenshi::with(['dojo:id,name,code,pengprov'])
            ->latest()
            ->take(5)
            ->get();

        // Recent System Activities from Spatie ActivityLog
        $recentActivities = Activity::with('causer:id,name')
            ->latest()
            ->take(6)
            ->get()
            ->map(fn (Activity $act) => [
                'id' => $act->id,
                'description' => $act->description,
                'log_name' => $act->log_name,
                'causer' => $act->causer?->name ?? 'Sistem Perkemi',
                'time_ago' => $act->created_at?->diffForHumans() ?? 'baru saja',
            ]);

        // Upcoming Agenda Perkemi 2026
        $upcomingAgenda = [
            [
                'title' => 'Gashuku Nasional & Ujian Kenaikan Tingkat (UKT) Dan',
                'date' => '14 - 17 November 2026',
                'location' => 'Pusdiklat Shorinji Kempo, Pondok Gede, Jakarta',
                'badge' => 'Nasional',
                'badge_color' => 'rose',
            ],
            [
                'title' => 'Kejuaraan Nasional Antar Kota / Kabupaten (Piala Menpora)',
                'date' => '05 - 08 Desember 2026',
                'location' => 'GOR Among Rogo, D.I. Yogyakarta',
                'badge' => 'Turnamen',
                'badge_color' => 'amber',
            ],
            [
                'title' => 'Penataran Wasit, Juri & Pelatih Daerah Pengprov Perkemi',
                'date' => '16 Januari 2027',
                'location' => 'Bandung, Jawa Barat',
                'badge' => 'Sertifikasi',
                'badge_color' => 'emerald',
            ],
        ];

        return Inertia::render('Dashboard', [
            'is_kenshi_only' => $isKenshiOnly,
            'kenshi_profile' => $kenshiProfile ? new KenshiResource($kenshiProfile) : null,
            'kenshi_stats' => $kenshiStats,
            'latest_evaluation' => $latestEvaluation,
            'upcoming_schedule' => $upcomingSchedule,
            'recent_trainings' => $recentTrainings,
            'metrics' => [
                'total_dojos' => $totalDojos,
                'active_dojos' => $activeDojos,
                'total_kenshis' => $totalKenshis,
                'yudansha_count' => $yudanshaCount,
                'mudansha_count' => $mudanshaCount,
                'pengprov_count' => Dojo::distinct('pengprov')->count('pengprov') ?: 34,
            ],
            'rank_distribution' => $rankDistribution,
            'regions' => $regions,
            'recent_kenshis' => KenshiResource::collection($recentKenshis),
            'recent_activities' => $recentActivities,
            'upcoming_agenda' => $upcomingAgenda,
        ]);
    }
}
