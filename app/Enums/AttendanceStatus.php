<?php

declare(strict_types=1);

namespace App\Enums;

enum AttendanceStatus: string
{
    case Present = 'present';
    case Late = 'late';
    case Excused = 'excused';
    case Sick = 'sick';
    case Absent = 'absent';

    public function label(): string
    {
        return match ($this) {
            self::Present => 'Hadir',
            self::Late => 'Terlambat',
            self::Excused => 'Izin',
            self::Sick => 'Sakit',
            self::Absent => 'Alpa / Tidak Hadir',
        };
    }

    public function badgeColor(): string
    {
        return match ($this) {
            self::Present => 'emerald',
            self::Late => 'amber',
            self::Excused => 'sky',
            self::Sick => 'violet',
            self::Absent => 'rose',
        };
    }
}
