<?php

declare(strict_types=1);

namespace App\Actions\Attendance;

use App\Enums\AttendanceStatus;
use App\Models\Attendance;
use App\Models\Kenshi;
use App\Models\TrainingSchedule;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class RecordAttendanceAction
{
    /**
     * Record or update kenshi attendance with camera snapshot and GPS geotagging.
     *
     * @param  array<string, mixed>  $data
     */
    public function execute(array $data, ?string $userId = null): Attendance
    {
        return DB::transaction(function () use ($data, $userId): Attendance {
            $schedule = TrainingSchedule::findOrFail($data['training_schedule_id']);
            $kenshi = Kenshi::findOrFail($data['kenshi_id']);

            // 1. Process Camera Photo (Base64 data URI or UploadedFile)
            $photoPath = null;
            if (! empty($data['photo'])) {
                if (is_string($data['photo']) && str_starts_with($data['photo'], 'data:image')) {
                    $parts = explode(',', $data['photo']);
                    if (isset($parts[1])) {
                        $imageBinary = base64_decode($parts[1]);
                        $filename = 'attendances/'.Str::uuid()->toString().'.jpg';
                        Storage::disk('public')->put($filename, $imageBinary);
                        $photoPath = $filename;
                    }
                } elseif ($data['photo'] instanceof UploadedFile) {
                    $photoPath = $data['photo']->store('attendances', 'public');
                }
            }

            // 2. Calculate Distance & Geofence (Haversine formula)
            $userLat = isset($data['latitude']) && $data['latitude'] !== '' ? (float) $data['latitude'] : null;
            $userLng = isset($data['longitude']) && $data['longitude'] !== '' ? (float) $data['longitude'] : null;
            $distanceMeters = null;
            $isWithinRadius = false;

            if ($userLat !== null && $userLng !== null && $schedule->latitude !== null && $schedule->longitude !== null) {
                $distanceMeters = $this->calculateHaversineDistance(
                    $userLat,
                    $userLng,
                    (float) $schedule->latitude,
                    (float) $schedule->longitude
                );

                $allowedRadius = $schedule->radius_meters ?: 150;
                $isWithinRadius = $distanceMeters <= $allowedRadius;
            }

            // 3. Upsert attendance record
            $existing = Attendance::where('training_schedule_id', $schedule->id)
                ->where('kenshi_id', $kenshi->id)
                ->first();

            $photoToSave = $photoPath ?? $existing?->photo_path;

            $attendance = Attendance::updateOrCreate(
                [
                    'training_schedule_id' => $schedule->id,
                    'kenshi_id' => $kenshi->id,
                ],
                [
                    'status' => $data['status'],
                    'check_in_at' => $existing?->check_in_at ?? now(),
                    'photo_path' => $photoToSave,
                    'latitude' => $userLat ?? $existing?->latitude,
                    'longitude' => $userLng ?? $existing?->longitude,
                    'location_accuracy' => isset($data['location_accuracy']) && $data['location_accuracy'] !== '' ? (float) $data['location_accuracy'] : $existing?->location_accuracy,
                    'distance_meters' => $distanceMeters !== null ? round($distanceMeters, 2) : $existing?->distance_meters,
                    'is_within_radius' => $isWithinRadius || (bool) $existing?->is_within_radius,
                    'verified_by' => in_array($data['status'], ['excused', 'sick'], true) ? $userId : ($userId ?? $existing?->verified_by),
                    'notes' => $data['notes'] ?? $existing?->notes,
                ]
            );

            // 4. Recalculate kenshi attendance statistics
            $this->syncKenshiAttendanceStats($kenshi);

            activity('attendance')
                ->performedOn($attendance)
                ->causedBy($userId ? User::find($userId) : null)
                ->log("Presensi tercatat untuk Kenshi [{$kenshi->full_name}] pada sesi [{$schedule->title}].");

            return $attendance;
        });
    }

    /**
     * Calculate geodesic distance between two points in meters using Haversine formula.
     */
    private function calculateHaversineDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371000; // Earth radius in meters

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    /**
     * Recalculate and persist updated attendance rate on Kenshi metadata.
     */
    private function syncKenshiAttendanceStats(Kenshi $kenshi): void
    {
        $attendedCount = Attendance::where('kenshi_id', $kenshi->id)
            ->whereIn('status', [AttendanceStatus::Present, AttendanceStatus::Late])
            ->count();

        $totalSchedules = TrainingSchedule::where('dojo_id', $kenshi->dojo_id)
            ->where('date', '<=', now()->toDateString())
            ->count();

        $rate = $totalSchedules > 0 ? (int) round(($attendedCount / $totalSchedules) * 100) : 100;
        $rate = min(100, max(0, $rate));

        $metadata = $kenshi->metadata ?? [];
        $metadata['attendance_rate'] = $rate;
        $metadata['total_sessions'] = $attendedCount;
        $metadata['last_attendance_at'] = now()->toIso8601String();

        if ($rate >= 85) {
            $metadata['ready_for_ukt'] = true;
        }

        $kenshi->update(['metadata' => $metadata]);
    }
}
