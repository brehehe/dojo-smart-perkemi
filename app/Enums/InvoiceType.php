<?php

declare(strict_types=1);

namespace App\Enums;

enum InvoiceType: string
{
    case KyuMonthly = 'kyu_monthly';
    case DanMonthly = 'dan_monthly';
    case RegistrationRegular = 'registration_regular';
    case RegistrationExecutive = 'registration_executive';
    case WskoAnnual = 'wsko_annual';

    public function label(): string
    {
        return match ($this) {
            self::KyuMonthly => 'Iuran Bulanan Kyukenshi',
            self::DanMonthly => 'Iuran Bulanan Yudansha',
            self::RegistrationRegular => 'Pendaftaran Baru (Dojo Reguler)',
            self::RegistrationExecutive => 'Pendaftaran Baru (Dojo Eksekutif)',
            self::WskoAnnual => 'Membership Fee WSKO (Tahunan)',
        };
    }

    public function standardAmount(): int
    {
        return match ($this) {
            self::KyuMonthly, self::DanMonthly => 50000,
            self::RegistrationRegular => 60000,
            self::RegistrationExecutive => 160000,
            self::WskoAnnual => 10000,
        };
    }
}
