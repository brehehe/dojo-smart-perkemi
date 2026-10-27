<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\AttendanceStatus;
use App\Enums\ScheduleProgramType;
use App\Models\Attendance;
use App\Models\Dojo;
use App\Models\Kenshi;
use App\Models\TrainingSchedule;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;

class TrainingScheduleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $surabaya = Dojo::where('code', 'DOJO-SBY-001')->first();

        if (! $surabaya) {
            return;
        }

        $now = now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();

        $surabayaPeriod = CarbonPeriod::create($startOfMonth, $endOfMonth);
        $surabayaKenshis = Kenshi::where('dojo_id', $surabaya->id)->get();

        foreach ($surabayaPeriod as $date) {
            $dayOfWeek = $date->dayOfWeek;

            if ($dayOfWeek === 1 || $dayOfWeek === 4) {
                // Senin (1) & Kamis (4): 19:00 - 21:00
                $schedule = TrainingSchedule::updateOrCreate(
                    [
                        'dojo_id' => $surabaya->id,
                        'date' => $date->toDateString(),
                        'start_time' => '19:00',
                    ],
                    [
                        'title' => 'Latihan Rutin Embu, Randori & Gisei Surabaya',
                        'program_type' => ScheduleProgramType::Regular,
                        'end_time' => '21:00',
                        'location_name' => 'PERKEMI PENGKOT SURABAYA (Sawahan Tatami Hall)',
                        'latitude' => -7.3183485,
                        'longitude' => 112.7177549,
                        'radius_meters' => 150,
                        'instructor_name' => 'Sensei Hadi Siswanto (V Dan)',
                        'status' => $date->isPast() ? 'completed' : ($date->isToday() ? 'ongoing' : 'scheduled'),
                    ]
                );

                if ($date->isPast() || $date->isToday()) {
                    $this->seedSampleAttendances($schedule, $surabayaKenshis);
                }
            } elseif ($dayOfWeek === 6) {
                // Sabtu (6): 08:00 - 11:00
                $schedule = TrainingSchedule::updateOrCreate(
                    [
                        'dojo_id' => $surabaya->id,
                        'date' => $date->toDateString(),
                        'start_time' => '08:00',
                    ],
                    [
                        'title' => 'Pemusatan Teknik & Persiapan Ujian Kenaikan Tingkat (UKT)',
                        'program_type' => ScheduleProgramType::UktPreparation,
                        'end_time' => '11:00',
                        'location_name' => 'PERKEMI PENGKOT SURABAYA (Sawahan Tatami Hall)',
                        'latitude' => -7.3183485,
                        'longitude' => 112.7177549,
                        'radius_meters' => 150,
                        'instructor_name' => 'Sensei Hadi Siswanto (V Dan)',
                        'status' => $date->isPast() ? 'completed' : ($date->isToday() ? 'ongoing' : 'scheduled'),
                    ]
                );

                if ($date->isPast() || $date->isToday()) {
                    $this->seedSampleAttendances($schedule, $surabayaKenshis);
                }
            }
        }
    }

    /**
     * Create realistic mock attendance entries for past/ongoing sessions.
     *
     * @param  Collection<int, Kenshi>  $kenshis
     */
    private function seedSampleAttendances(TrainingSchedule $schedule, $kenshis): void
    {
        $statuses = [
            AttendanceStatus::Present,
            AttendanceStatus::Present,
            AttendanceStatus::Present,
            AttendanceStatus::Late,
            AttendanceStatus::Excused,
        ];

        foreach ($kenshis as $index => $kenshi) {
            $status = $statuses[$index % count($statuses)];
            $distance = rand(15, 85); // within 150m radius

            Attendance::updateOrCreate(
                [
                    'training_schedule_id' => $schedule->id,
                    'kenshi_id' => $kenshi->id,
                ],
                [
                    'status' => $status,
                    'check_in_at' => Carbon::parse($schedule->date->format('Y-m-d').' '.$schedule->start_time)->addMinutes(rand(-10, 15)),
                    'latitude' => $schedule->latitude ? $schedule->latitude + (rand(-100, 100) / 1000000) : null,
                    'longitude' => $schedule->longitude ? $schedule->longitude + (rand(-100, 100) / 1000000) : null,
                    'location_accuracy' => 12.5,
                    'distance_meters' => $distance,
                    'is_within_radius' => true,
                    'notes' => $status === AttendanceStatus::Late ? 'Terlambat 10 menit karena perjalanan dinas' : null,
                ]
            );
        }
    }
}
