<?php

declare(strict_types=1);

namespace App\Actions\Schedule;

use App\Models\TrainingSchedule;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class CreateScheduleAction
{
    /**
     * Create single, multi, or recurring training schedules in atomic transaction.
     *
     * @param  array<string, mixed>  $data
     * @return Collection<int, TrainingSchedule>
     */
    public function execute(array $data): Collection
    {
        return DB::transaction(function () use ($data): Collection {
            $created = new Collection;
            $mode = $data['mode'] ?? 'single';

            $targetDates = [];

            if ($mode === 'single' && ! empty($data['date'])) {
                $targetDates[] = Carbon::parse($data['date'])->toDateString();
            } elseif ($mode === 'multi' && ! empty($data['dates'])) {
                foreach ($data['dates'] as $date) {
                    $targetDates[] = Carbon::parse($date)->toDateString();
                }
            } elseif ($mode === 'recurring' && ! empty($data['days_of_week']) && ! empty($data['start_date']) && ! empty($data['end_date'])) {
                $period = CarbonPeriod::create($data['start_date'], $data['end_date']);
                $days = array_map('intval', $data['days_of_week']);

                foreach ($period as $date) {
                    if (in_array($date->dayOfWeek, $days, true)) {
                        $targetDates[] = $date->toDateString();
                    }
                }
            }

            // Fallback to today if no date was specified
            if (empty($targetDates)) {
                $targetDates[] = now()->toDateString();
            }

            // Deduplicate and sort dates
            $targetDates = array_values(array_unique($targetDates));
            sort($targetDates);

            $basePayload = [
                'dojo_id' => $data['dojo_id'],
                'title' => $data['title'],
                'program_type' => $data['program_type'],
                'start_time' => $data['start_time'],
                'end_time' => $data['end_time'],
                'location_name' => $data['location_name'] ?? null,
                'latitude' => $data['latitude'] ?? null,
                'longitude' => $data['longitude'] ?? null,
                'radius_meters' => $data['radius_meters'] ?? 150,
                'instructor_name' => $data['instructor_name'] ?? null,
                'notes' => $data['notes'] ?? null,
                'status' => 'scheduled',
            ];

            foreach ($targetDates as $dateString) {
                $schedule = TrainingSchedule::create(array_merge($basePayload, [
                    'date' => $dateString,
                ]));

                $created->push($schedule);
            }

            activity('training_schedule')
                ->causedBy(auth()->user())
                ->log("Dibuat {$created->count()} jadwal latihan untuk Dojo [{$data['title']}].");

            return $created;
        });
    }
}
