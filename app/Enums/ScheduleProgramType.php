<?php

declare(strict_types=1);

namespace App\Enums;

enum ScheduleProgramType: string
{
    case Regular = 'regular';
    case UktPreparation = 'ukt_preparation';
    case YudanshaOnly = 'yudansha_only';
    case Gashuku = 'gashuku';
    case TournamentTc = 'tournament_tc';

    public function label(): string
    {
        return match ($this) {
            self::Regular => 'Latihan Rutin',
            self::UktPreparation => 'Pemusatan Latihan UKT',
            self::YudanshaOnly => 'Khusus Sabuk Coklat & Dan',
            self::Gashuku => 'Gashuku Wilayah / Daerah',
            self::TournamentTc => 'Pemusatan Atlet (TC Kejurda/Kejurnas)',
        };
    }

    public function badgeColor(): string
    {
        return match ($this) {
            self::Regular => 'slate',
            self::UktPreparation => 'amber',
            self::YudanshaOnly => 'rose',
            self::Gashuku => 'indigo',
            self::TournamentTc => 'emerald',
        };
    }
}
