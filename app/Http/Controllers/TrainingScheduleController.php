<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Schedule\CreateScheduleAction;
use App\Enums\AttendanceStatus;
use App\Enums\ScheduleProgramType;
use App\Http\Requests\Schedule\StoreScheduleRequest;
use App\Http\Resources\AttendanceResource;
use App\Http\Resources\DojoResource;
use App\Http\Resources\KenshiResource;
use App\Http\Resources\TrainingScheduleResource;
use App\Models\Dojo;
use App\Models\Kenshi;
use App\Models\TrainingSchedule;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TrainingScheduleController extends Controller
{
    /**
     * Display the interactive calendar and schedule agenda.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Resolve current month/year or query param
        $year = (int) ($request->query('year') ?? now()->year);
        $month = (int) ($request->query('month') ?? now()->month);
        $dojoFilter = $request->query('dojo_id');

        $currentDate = Carbon::createFromDate($year, $month, 1);

        $schedules = TrainingSchedule::query()
            ->with(['dojo:id,name,code,pengprov'])
            ->withCount('attendances')
            ->forDojo($dojoFilter)
            ->whereYear('date', $year)
            ->whereMonth('date', $month)
            ->orderBy('date')
            ->orderBy('start_time')
            ->get();

        // Today's ongoing / upcoming sessions for quick access
        $todaySchedules = TrainingSchedule::query()
            ->with(['dojo:id,name,code,pengprov'])
            ->withCount('attendances')
            ->forDojo($dojoFilter)
            ->whereDate('date', now()->toDateString())
            ->orderBy('start_time')
            ->get();

        $activeDojos = Dojo::active()->select('id', 'name', 'code', 'pengprov', 'status')->get();

        $canCreateSchedule = $user ? $user->can('create', TrainingSchedule::class) : false;
        $managedDojo = ($user && $user->hasRole('Sensei'))
            ? Dojo::where('head_sensei_id', $user->id)->first()
            : null;

        return Inertia::render('Schedules/Calendar', [
            'schedules' => TrainingScheduleResource::collection($schedules),
            'today_schedules' => TrainingScheduleResource::collection($todaySchedules),
            'dojos' => DojoResource::collection($activeDojos),
            'can_create_schedule' => $canCreateSchedule,
            'managed_dojo_id' => $managedDojo?->id,
            'current_month' => [
                'year' => $year,
                'month' => $month,
                'name' => $currentDate->translatedFormat('F Y'),
                'days_in_month' => $currentDate->daysInMonth,
                'first_day_of_week' => $currentDate->copy()->startOfMonth()->dayOfWeek,
            ],
            'filters' => [
                'dojo_id' => $dojoFilter,
                'year' => $year,
                'month' => $month,
            ],
            'program_types' => collect(ScheduleProgramType::cases())->map(fn ($pt) => [
                'value' => $pt->value,
                'label' => $pt->label(),
                'color' => $pt->badgeColor(),
            ]),
        ]);
    }

    /**
     * Store single, multi, or recurring training schedules.
     */
    public function store(StoreScheduleRequest $request, CreateScheduleAction $action): RedirectResponse
    {
        $created = $action->execute($request->validated());

        return $this->redirectWithSuccess(
            'schedules.index',
            "Berhasil menjadwalkan {$created->count()} sesi latihan dojo ke kalender."
        );
    }

    /**
     * Display the detailed attendance roster and monitoring for a training session.
     */
    public function show(TrainingSchedule $schedule, Request $request): Response
    {
        $user = $request->user();
        $isSuperAdmin = $user?->hasRole('SuperAdmin');
        $isSensei = $user?->hasRole('Sensei');
        $isPengurus = $user?->hasAnyRole(['PengprovAdmin', 'PengkabAdmin']);
        $isKenshiOnly = $user?->hasRole('Kenshi') && ! ($isSuperAdmin || $isSensei || $isPengurus);

        $schedule->load(['dojo.kenshis' => fn ($q) => $q->where('is_active', true)->orderBy('full_name')]);
        $schedule->load(['attendances.kenshi', 'attendances.verifier']);

        $attendances = $schedule->attendances;
        $dojoKenshis = $schedule->dojo->kenshis ?? collect();

        $currentKenshi = null;
        if ($user) {
            $currentKenshi = Kenshi::where('user_id', $user->id)->first();
        }

        // Determine if schedule session has passed/finished
        $scheduleDate = Carbon::parse($schedule->date);
        $isFinished = $scheduleDate->isPast() && ! $scheduleDate->isToday();
        if ($scheduleDate->isToday() && $schedule->end_time) {
            $endTime = Carbon::parse($scheduleDate->format('Y-m-d').' '.$schedule->end_time);
            $isFinished = now()->greaterThan($endTime);
        }

        // For regular Kenshi: scope attendance strictly to their own record
        if ($isKenshiOnly) {
            $myAttendance = $currentKenshi
                ? $attendances->firstWhere('kenshi_id', $currentKenshi->id)
                : null;

            $scopedAttendances = $myAttendance ? collect([$myAttendance]) : collect();
            $unmarkedKenshis = (! $myAttendance && $currentKenshi) ? collect([$currentKenshi]) : collect();

            $isAttended = $myAttendance && in_array($myAttendance->status, [AttendanceStatus::Present, AttendanceStatus::Late]);

            return Inertia::render('Schedules/Attendance', [
                'schedule' => new TrainingScheduleResource($schedule),
                'attendances' => AttendanceResource::collection($scopedAttendances),
                'unmarked_kenshis' => KenshiResource::collection($unmarkedKenshis),
                'is_kenshi_view' => true,
                'is_session_finished' => $isFinished,
                'current_kenshi' => $currentKenshi ? new KenshiResource($currentKenshi) : null,
                'my_attendance' => $myAttendance ? new AttendanceResource($myAttendance) : null,
                'stats' => [
                    'total_members' => 1,
                    'total_attended' => $isAttended ? 1 : 0,
                    'present_count' => $myAttendance?->status === AttendanceStatus::Present ? 1 : 0,
                    'late_count' => $myAttendance?->status === AttendanceStatus::Late ? 1 : 0,
                    'excused_count' => $myAttendance?->status === AttendanceStatus::Excused ? 1 : 0,
                    'sick_count' => $myAttendance?->status === AttendanceStatus::Sick ? 1 : 0,
                    'absent_count' => ($myAttendance?->status === AttendanceStatus::Absent || (! $myAttendance && $isFinished)) ? 1 : 0,
                    'attendance_percentage' => $isAttended ? 100 : 0,
                ],
                'attendance_statuses' => collect(AttendanceStatus::cases())->map(fn ($s) => [
                    'value' => $s->value,
                    'label' => $s->label(),
                    'color' => $s->badgeColor(),
                ]),
            ]);
        }

        // Admin & Sensei: Full roster and management monitoring
        $presentCount = $attendances->where('status', AttendanceStatus::Present)->count();
        $lateCount = $attendances->where('status', AttendanceStatus::Late)->count();
        $excusedCount = $attendances->where('status', AttendanceStatus::Excused)->count();
        $sickCount = $attendances->where('status', AttendanceStatus::Sick)->count();
        $absentCount = $attendances->where('status', AttendanceStatus::Absent)->count();
        $totalAttended = $presentCount + $lateCount;

        // Kenshis from this dojo who haven't logged attendance yet
        $loggedKenshiIds = $attendances->pluck('kenshi_id')->all();
        $unmarkedKenshis = $dojoKenshis->filter(fn (Kenshi $k) => ! in_array($k->id, $loggedKenshiIds, true));

        return Inertia::render('Schedules/Attendance', [
            'schedule' => new TrainingScheduleResource($schedule),
            'attendances' => AttendanceResource::collection($attendances),
            'unmarked_kenshis' => KenshiResource::collection($unmarkedKenshis->values()),
            'dojo_kenshis' => KenshiResource::collection($dojoKenshis),
            'can_manage_attendance' => (bool) ($isSuperAdmin || $isSensei || $isPengurus),
            'is_kenshi_view' => false,
            'is_session_finished' => $isFinished,
            'current_kenshi' => $currentKenshi ? new KenshiResource($currentKenshi) : null,
            'my_attendance' => null,
            'stats' => [
                'total_members' => $dojoKenshis->count(),
                'total_attended' => $totalAttended,
                'present_count' => $presentCount,
                'late_count' => $lateCount,
                'excused_count' => $excusedCount,
                'sick_count' => $sickCount,
                'absent_count' => $absentCount + ($isFinished ? $unmarkedKenshis->count() : 0),
                'attendance_percentage' => $dojoKenshis->count() > 0 ? round(($totalAttended / $dojoKenshis->count()) * 100) : 0,
            ],
            'attendance_statuses' => collect(AttendanceStatus::cases())->map(fn ($s) => [
                'value' => $s->value,
                'label' => $s->label(),
                'color' => $s->badgeColor(),
            ]),
        ]);
    }

    /**
     * Soft delete a training schedule.
     */
    public function destroy(TrainingSchedule $schedule): RedirectResponse
    {
        $this->authorize('delete', $schedule);

        $title = $schedule->title;
        $date = $schedule->date;

        $schedule->delete();

        return $this->redirectWithSuccess(
            'schedules.index',
            "Jadwal latihan [{$title}] pada tanggal {$date} telah dihapus."
        );
    }
}
