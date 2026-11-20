<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\KenshiRank;
use App\Enums\RegistrationStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExaminationRegistration extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'examination_id',
        'kenshi_id',
        'current_rank',
        'target_rank',
        'chest_number',
        'eligibility_check',
        'is_eligible',
        'status',
        'final_score',
        'result_grade',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'current_rank' => KenshiRank::class,
            'target_rank' => KenshiRank::class,
            'status' => RegistrationStatus::class,
            'is_eligible' => 'boolean',
            'final_score' => 'float',
            'eligibility_check' => 'array',
        ];
    }

    public function examination(): BelongsTo
    {
        return $this->belongsTo(Examination::class);
    }

    public function kenshi(): BelongsTo
    {
        return $this->belongsTo(Kenshi::class);
    }

    public function scores(): HasMany
    {
        return $this->hasMany(ExaminationScore::class, 'registration_id');
    }
}
