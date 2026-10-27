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
        $senayan = Dojo::where('code', 'DOJO-JKT-001')->first();
        $ugm = Dojo::where('code', 'DOJO-DIY-001')->first();

        if (! $senayan || ! $ugm) {
            return;
        }

        $now = now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();

        // 1. Seed Dojo Senayan: Selasa (Tuesday=2), Kamis (Thursday=4), Sabtu (Saturday=6)
        $senayanPeriod = CarbonPeriod::create($startOfMonth, $endOfMonth);
        $senayanKenshis = Kenshi::where('dojo_id', $senayan->id)->get();

        foreach ($senayanPeriod as $date) {
            $dayOfWeek = $date->dayOfWeek;

            if ($dayOfWeek === 2 || $dayOfWeek === 4) {
                // Selasa & Kamis: 19:00 - 21:00
                $schedule = TrainingSchedule::updateOrCreate(
                    [
                        'dojo_id' => $senayan->id,
                        'date' => $date->toDateString(),
                        'start_time' => '19:00',
                    ],
                    [
                        'title' => 'Latihan Rutin Embu, Randori & Gisei',
                        'program_type' => ScheduleProgramType::Regular,
                        'end_time' => '21:00',
                        'location_name' => 'Dojo PB Perkemi Senayan (Hall C GBK)',
                        'latitude' => -6.2185700,
                        'longitude' => 106.8026100,
                        'radius_meters' => 150,
                        'instructor_name' => 'Sensei Budi Prasetyo (V Dan)',
                        'status' => $date->isPast() ? 'completed' : ($date->isToday() ? 'ongoing' : 'scheduled'),
                    ]
                );

                if ($date->isPast() || $date->isToday()) {
                    $this->seedSampleAttendances($schedule, $senayanKenshis);
                }
            } elseif ($dayOfWeek === 6) {
                // Sabtu: 08:00 - 11:00 (Pemusatan UKT & Sabuk Coklat/Dan)
                $schedule = TrainingSchedule::updateOrCreate(
                    [
                        'dojo_id' => $senayan->id,
                        'date' => $date->toDateString(),
                        'start_time' => '08:00',
                    ],
                    [
                        'title' => 'Pemusatan Teknik & Persiapan Ujian Kenaikan Tingkat (UKT)',
                        'program_type' => ScheduleProgramType::UktPreparation,
                        'end_time' => '11:00',
                        'location_name' => 'Dojo PB Perkemi Senayan (Hall C GBK)',
                        'latitude' => -6.2185700,
                        'longitude' => 106.8026100,
                        'radius_meters' => 150,
                        'instructor_name' => 'Sensei Budi Prasetyo (V Dan)',
                        'status' => $date->isPast() ? 'completed' : ($date->isToday() ? 'ongoing' : 'scheduled'),
                    ]
                );

                if ($date->isPast() || $date->isToday()) {
                    $this->seedSampleAttendances($schedule, $senayanKenshis);
                }
            }
        }

        // 2. Seed Dojo UGM: Senin (Monday=1), Rabu (Wednesday=3)
        $ugmPeriod = CarbonPeriod::create($startOfMonth, $endOfMonth);
        $ugmKenshis = Kenshi::where('dojo_id', $ugm->id)->get();

        foreach ($ugmPeriod as $date) {
            $dayOfWeek = $date->dayOfWeek;

            if ($dayOfWeek === 1 || $dayOfWeek === 3) {
                $schedule = TrainingSchedule::updateOrCreate(
                    [
                        'dojo_id' => $ugm->id,
                        'date' => $date->toDateString(),
                        'start_time' => '16:30',
                    ],
                    [
                        'title' => 'Latihan Rutin Kihon & Hokei Shorinji Kempo',
                        'program_type' => ScheduleProgramType::Regular,
                        'end_time' => '18:30',
                        'location_name' => 'Gelanggang Mahasiswa Universitas Gadjah Mada',
                        'latitude' => -7.7712300,
                        'longitude' => 110.3775000,
                        'radius_meters' => 150,
                        'instructor_name' => 'Sensei Agus Santoso (IV Dan)',
                        'status' => $date->isPast() ? 'completed' : ($date->isToday() ? 'ongoing' : 'scheduled'),
                    ]
                );

                if ($date->isPast() || $date->isToday()) {
                    $this->seedSampleAttendances($schedule, $ugmKenshis);
                }
            }
        }

        // 3. Seed PERKEMI Pengkot Surabaya: Senin (1) & Kamis (4) 19:00 - 21:00
        $surabaya = Dojo::where('code', 'DOJO-SBY-001')->first();
        if ($surabaya) {
            $surabayaKenshis = Kenshi::where('dojo_id', $surabaya->id)->get();
            $surabayaPeriod = CarbonPeriod::create($startOfMonth, $endOfMonth);

            foreach ($surabayaPeriod as $date) {
                $dayOfWeek = $date->dayOfWeek;

                if ($dayOfWeek === 1 || $dayOfWeek === 4) {
                    $schedule = TrainingSchedule::updateOrCreate(
                        [
                            'dojo_id' => $surabaya->id,
                            'date' => $date->toDateString(),
                            'start_time' => '19:00',
                        ],
                        [
                            'title' => 'Latihan Rutin Shorinji Kempo Surabaya',
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
