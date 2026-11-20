<?php

declare(strict_types=1);

namespace App\Enums;

enum KenshiRank: string
{
    case Minarai = 'minarai';
    case Kyu8 = 'kyu_8';
    case Kyu7 = 'kyu_7';
    case Kyu6 = 'kyu_6';
    case Kyu5 = 'kyu_5';
    case Kyu4 = 'kyu_4';
    case Kyu3 = 'kyu_3';
    case Kyu2 = 'kyu_2';
    case Kyu1 = 'kyu_1';
    case Dan1 = 'dan_1';
    case Dan2 = 'dan_2';
    case Dan3 = 'dan_3';
    case Dan4 = 'dan_4';
    case Dan5 = 'dan_5';
    case Dan6 = 'dan_6';
    case Dan7 = 'dan_7';

    public function label(): string
    {
        return match ($this) {
            self::Minarai => 'Minarai',
            self::Kyu8 => 'Kyu VIII',
            self::Kyu7 => 'Kyu VII',
            self::Kyu6 => 'Kyu VI',
            self::Kyu5 => 'Kyu V',
            self::Kyu4 => 'Kyu IV',
            self::Kyu3 => 'Kyu III',
            self::Kyu2 => 'Kyu II',
            self::Kyu1 => 'Kyu I',
            self::Dan1 => 'I Dan',
            self::Dan2 => 'II Dan',
            self::Dan3 => 'III Dan',
            self::Dan4 => 'IV Dan',
            self::Dan5 => 'V Dan',
            self::Dan6 => 'VI Dan',
            self::Dan7 => 'VII Dan',
        };
    }

    public function beltColor(): string
    {
        return match ($this) {
            self::Minarai => 'white',
            self::Kyu8, self::Kyu7 => 'yellow',
            self::Kyu6, self::Kyu5 => 'green',
            self::Kyu4 => 'blue',
            self::Kyu3, self::Kyu2, self::Kyu1 => 'brown',
            default => 'black',
        };
    }

    public function isDan(): bool
    {
        return str_starts_with($this->value, 'dan_');
    }

    public function nextRank(): ?self
    {
        return match ($this) {
            self::Minarai => self::Kyu8,
            self::Kyu8 => self::Kyu7,
            self::Kyu7 => self::Kyu6,
            self::Kyu6 => self::Kyu5,
            self::Kyu5 => self::Kyu4,
            self::Kyu4 => self::Kyu3,
            self::Kyu3 => self::Kyu2,
            self::Kyu2 => self::Kyu1,
            self::Kyu1 => self::Dan1,
            self::Dan1 => self::Dan2,
            self::Dan2 => self::Dan3,
            self::Dan3 => self::Dan4,
            self::Dan4 => self::Dan5,
            self::Dan5 => self::Dan6,
            self::Dan6 => self::Dan7,
            self::Dan7 => null,
        };
    }
}
