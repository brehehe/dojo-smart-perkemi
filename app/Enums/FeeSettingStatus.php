<?php

declare(strict_types=1);

namespace App\Enums;

enum FeeSettingStatus: string
{
    case Draft = 'draft';
    case PendingPB = 'pending_pb';
    case Approved = 'approved';
    case Rejected = 'rejected';
    case Superseded = 'superseded';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draft Usulan',
            self::PendingPB => 'Menunggu Persetujuan PB',
            self::Approved => 'Disetujui & Aktif',
            self::Rejected => 'Ditolak PB',
            self::Superseded => 'Digantikan Versi Baru',
        };
    }
}
