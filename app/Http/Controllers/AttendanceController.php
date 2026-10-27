<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Attendance\RecordAttendanceAction;
use App\Enums\AttendanceStatus;
use App\Http\Requests\Attendance\StoreAttendanceRequest;
use App\Http\Resources\AttendanceResource;
use App\Http\Resources\KenshiResource;
use App\Http\Resources\TrainingScheduleResource;
use App\Models\Attendance;
use App\Models\Kenshi;
use App\Models\TrainingSchedule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    /**
     * Display the mobile-friendly camera capture & geotag check-in portal.
     */
    public function checkIn(Request $request): Response
    {
        $user = $request->user();

        // 1. Resolve target schedule
        $scheduleId = $request->query('schedule_id');
        $schedule = null;

        if ($scheduleId) {
            $schedule = TrainingSchedule::with('dojo')->find($scheduleId);
        }

        if (! $schedule) {
            // Find today's session or the next upcoming session
            $schedule = TrainingSchedule::with('dojo')
                ->whereDate('date', now()->toDateString())
                ->first()
                ?? TrainingSchedule::with('dojo')->upcoming()->first();
        }

        // 2. Resolve current kenshi (if logged in user is a Kenshi member)
        $currentKenshi = null;
        if ($user) {
            $currentKenshi = Kenshi::where('user_id', $user->id)->with('dojo')->first();
        }

        // 3. Available schedules for selection
        $availableSchedules = TrainingSchedule::with('dojo')
            ->where('date', '>=', now()->subDays(2)->toDateString())
            ->orderBy('date')
            ->orderBy('start_time')
            ->take(15)
            ->get();

        // 4. Kenshi roster for this schedule's dojo
        $kenshis = collect();
        if ($schedule) {
            $kenshis = Kenshi::where('dojo_id', $schedule->dojo_id)
                ->where('is_active', true)
                ->orderBy('full_name')
                ->get();
        }

        // 5. Existing attendance for this kenshi on this schedule
        $existingAttendance = null;
        if ($schedule && $currentKenshi) {
            $existingAttendance = Attendance::where('training_schedule_id', $schedule->id)
                ->where('kenshi_id', $currentKenshi->id)
                ->first();
        }

        return Inertia::render('Attendance/CheckIn', [
            'schedule' => $schedule ? new TrainingScheduleResource($schedule) : null,
            'available_schedules' => TrainingScheduleResource::collection($availableSchedules),
            'current_kenshi' => $currentKenshi ? new KenshiResource($currentKenshi) : null,
            'existing_attendance' => $existingAttendance ? new AttendanceResource($existingAttendance) : null,
            'kenshis' => KenshiResource::collection($kenshis),
            'attendance_statuses' => collect(AttendanceStatus::cases())->map(fn ($s) => [
                'value' => $s->value,
                'label' => $s->label(),
                'color' => $s->badgeColor(),
            ]),
        ]);
    }

    /**
     * Store kenshi attendance with camera snapshot and GPS geotagging.
     */
    public function store(StoreAttendanceRequest $request, RecordAttendanceAction $action): RedirectResponse
    {
        $attendance = $action->execute($request->validated(), $request->user()?->id);

        $schedule = $attendance->schedule;
        $kenshi = $attendance->kenshi;

        $distanceText = $attendance->distance_meters !== null
            ? " (Jarak: {$attendance->distance_meters}m)"
            : '';

        return redirect()->route('schedules.show', $schedule->id)
            ->with('success', "Presensi Kenshi [{$kenshi->full_name}] berhasil dicatat{$distanceText}.");
    }

    /**
     * Submit permit / excuse (Izin or Sakit) with optional proof document/photo.
     * Can be submitted by Kenshi themselves (pending approval) or by Admin/Sensei (directly approved).
     */
    public function submitPermit(Request $request, RecordAttendanceAction $action): RedirectResponse
    {
        $user = $request->user();
        $isSuperAdmin = (bool) $user?->hasRole('SuperAdmin');
        $isSensei = (bool) $user?->hasRole('Sensei');
        $isPengurus = (bool) $user?->hasAnyRole(['PengprovAdmin', 'PengkabAdmin']);
        $isAuthority = $isSuperAdmin || $isSensei || $isPengurus;

        $validated = $request->validate([
            'training_schedule_id' => ['required', 'uuid', 'exists:training_schedules,id'],
            'kenshi_id' => ['nullable', 'uuid', 'exists:kenshis,id'],
            'status' => ['required', Rule::in(['excused', 'sick'])],
            'notes' => ['required', 'string', 'max:500'],
            'photo' => ['nullable'],
        ]);

        $kenshiId = $validated['kenshi_id'] ?? null;
        if (! $kenshiId && $user) {
            $kenshi = Kenshi::where('user_id', $user->id)->first();
            $kenshiId = $kenshi?->id;
        }

        if (! $kenshiId) {
            return back()->with('error', 'Pilih atlet kenshi yang berhalangan atau lengkapi data kenshi.');
        }

        $validated['kenshi_id'] = $kenshiId;

        // If submitted by Admin/Sensei: immediately approved with their user_id
        // If submitted by Kenshi themselves: verified_by is null (pending approval by Sensei)
        $verifierId = $isAuthority ? $user?->id : null;

        $attendance = $action->execute($validated, $verifierId);
        $statusLabel = $attendance->status->label();

        $message = $isAuthority
            ? "Pencatatan {$statusLabel} untuk Kenshi [{$attendance->kenshi?->full_name}] berhasil disimpan dan disetujui."
            : "Permohonan {$statusLabel} berhasil diajukan dan menunggu persetujuan (approval) dari Sensei / Pelatih Dojo.";

        return back()->with('success', $message);
    }

    /**
     * Sensei / Admin Dojo approve a kenshi's permit request.
     */
    public function approvePermit(Request $request, Attendance $attendance): RedirectResponse
    {
        $user = $request->user();
        $isSuperAdmin = (bool) $user?->hasRole('SuperAdmin');
        $isSensei = (bool) $user?->hasRole('Sensei');
        $isPengurus = (bool) $user?->hasAnyRole(['PengprovAdmin', 'PengkabAdmin']);

        if (! ($isSuperAdmin || $isSensei || $isPengurus)) {
            abort(403, 'Hanya Sensei atau Admin yang berhak menyetujui (approve) izin kenshi.');
        }

        $attendance->update([
            'verified_by' => $user->id,
            'notes' => $attendance->notes
                ? ($attendance->notes.' [Disetujui oleh '.$user->name.']')
                : ('Disetujui oleh '.$user->name),
        ]);

        return back()->with('success', "Permohonan izin Kenshi [{$attendance->kenshi?->full_name}] telah disetujui (approved) oleh {$user->name}.");
    }

    /**
     * Sensei / Admin Dojo override or update attendance status with justification notes.
     */
    public function overrideStatus(Request $request, RecordAttendanceAction $action): RedirectResponse
    {
        $user = $request->user();
        $isSuperAdmin = $user?->hasRole('SuperAdmin');
        $isSensei = $user?->hasRole('Sensei');
        $isPengurus = $user?->hasAnyRole(['PengprovAdmin', 'PengkabAdmin']);

        if (! ($isSuperAdmin || $isSensei || $isPengurus)) {
            abort(403, 'Hanya Sensei atau Admin yang berhak merubah status presensi.');
        }

        $validated = $request->validate([
            'training_schedule_id' => ['required', 'uuid', 'exists:training_schedules,id'],
            'kenshi_id' => ['required', 'uuid', 'exists:kenshis,id'],
            'status' => ['required', Rule::enum(AttendanceStatus::class)],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $attendance = $action->execute($validated, $user?->id);
        $statusLabel = $attendance->status->label();

        return back()->with('success', "Status presensi kenshi berhasil diperbarui menjadi [{$statusLabel}].");
    }
}
