<?php

declare(strict_types=1);

namespace App\Enums;

enum BeneficiaryType: string
{
    case PbPerkemi = 'pb_perkemi';
    case Pengprov = 'pengprov';
    case Pengkot = 'pengkot';
    case Dojo = 'dojo';
    case Pelatih = 'pelatih';

    public function label(): string
    {
        return match ($this) {
            self::PbPerkemi => 'PB PERKEMI (Pusat)',
            self::Pengprov => 'Pengurus Provinsi (Pengprov)',
            self::Pengkot => 'Pengurus Kota/Kabupaten (Pengkot)',
            self::Dojo => 'Pengurus Cabang Dojo',
            self::Pelatih => 'Pelatih Dojo',
        };
    }
}
