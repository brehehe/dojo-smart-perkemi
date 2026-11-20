<?php

declare(strict_types=1);

namespace App\Enums;

enum MaterialPillar: string
{
    case Dokuhon = 'dokuhon';
    case Kihon = 'kihon';
    case Goho = 'goho';
    case Juho = 'juho';
    case Embu = 'embu';
    case Randori = 'randori';

    public function label(): string
    {
        return match ($this) {
            self::Dokuhon => 'Dokuhon & Falsafah',
            self::Kihon => 'Kihon (Dasar)',
            self::Goho => 'Goho (Teknik Keras)',
            self::Juho => 'Juho (Teknik Lunak)',
            self::Embu => 'Kumi & Tandoku Embu',
            self::Randori => 'Randori & Perwasitan',
        };
    }

    public function badgeColor(): string
    {
        return match ($this) {
            self::Dokuhon => 'amber',
            self::Kihon => 'slate',
            self::Goho => 'red',
            self::Juho => 'blue',
            self::Embu => 'emerald',
            self::Randori => 'purple',
        };
    }
}
