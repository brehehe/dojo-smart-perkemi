<?php

declare(strict_types=1);

namespace App\Enums;

enum RegistrationStatus: string
{
    case Registered = 'registered';
    case Verified = 'verified';
    case Examined = 'examined';
    case Passed = 'passed';
    case Failed = 'failed';
    case Remedial = 'remedial';

    public function label(): string
    {
        return match ($this) {
            self::Registered => 'Terdaftar (Verifikasi Syarat)',
            self::Verified => 'Lolos Syarat & Siap Ujian',
            self::Examined => 'Telah Diuji',
            self::Passed => 'LULUS (Naik Tingkat)',
            self::Failed => 'Tidak Lulus',
            self::Remedial => 'Ujian Ulang (Remedial)',
        };
    }
}
