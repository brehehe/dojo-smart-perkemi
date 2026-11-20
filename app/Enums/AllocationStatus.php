<?php

declare(strict_types=1);

namespace App\Enums;

enum AllocationStatus: string
{
    case Allocated = 'allocated';
    case Payable = 'payable';
    case Transferred = 'transferred';
    case Reconciled = 'reconciled';

    public function label(): string
    {
        return match ($this) {
            self::Allocated => 'Teralokasi (Hak Tercatat)',
            self::Payable => 'Siap Disalurkan',
            self::Transferred => 'Telah Ditransfer',
            self::Reconciled => 'Terekonsiliasi Sempurna',
        };
    }
}
