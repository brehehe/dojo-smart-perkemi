<?php

declare(strict_types=1);

namespace App\Enums;

enum DojoStatus: string
{
    case Active = 'active';
    case Inactive = 'inactive';
    case Suspended = 'suspended';

    public function label(): string
    {
        return match ($this) {
            self::Active => 'Aktif',
            self::Inactive => 'Non-Aktif',
            self::Suspended => 'Ditangguhkan',
        };
    }

    public function badgeColor(): string
    {
        return match ($this) {
            self::Active => 'emerald',
            self::Inactive => 'slate',
            self::Suspended => 'rose',
        };
    }
}
