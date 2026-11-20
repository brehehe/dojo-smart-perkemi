<?php

declare(strict_types=1);

namespace App\Enums;

enum InvoiceStatus: string
{
    case Unpaid = 'unpaid';
    case Partial = 'partial';
    case Paid = 'paid';
    case Waived = 'waived';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Unpaid => 'Belum Lunas',
            self::Partial => 'Sebagian',
            self::Paid => 'Lunas',
            self::Waived => 'Dibebaskan (Cuti/Izin Resmi)',
            self::Cancelled => 'Dibatalkan',
        };
    }
}
