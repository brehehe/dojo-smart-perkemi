<?php

declare(strict_types=1);

namespace App\Enums;

enum ExaminationStatus: string
{
    case Draft = 'draft';
    case RegistrationOpen = 'registration_open';
    case InProgress = 'in_progress';
    case Completed = 'completed';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draft Jadwal',
            self::RegistrationOpen => 'Pendaftaran Dibuka',
            self::InProgress => 'Sedang Berlangsung',
            self::Completed => 'Selesai & Disahkan',
            self::Cancelled => 'Dibatalkan',
        };
    }
}
