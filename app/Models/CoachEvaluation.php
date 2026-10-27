<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class CoachEvaluation extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'kenshi_id',
        'coach_id',
        'evaluation_date',
        'technique_score',
        'embu_score',
        'randori_score',
        'physical_score',
        'discipline_score',
        'overall_score',
        'grade',
        'recommendation',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'evaluation_date' => 'date:Y-m-d',
            'technique_score' => 'integer',
            'embu_score' => 'integer',
            'randori_score' => 'integer',
            'physical_score' => 'integer',
            'discipline_score' => 'integer',
            'overall_score' => 'integer',
        ];
    }

    /**
     * Kenshi being evaluated.
     */
    public function kenshi(): BelongsTo
    {
        return $this->belongsTo(Kenshi::class);
    }

    /**
     * Coach or Sensei who performed the evaluation.
     */
    public function coach(): BelongsTo
    {
        return $this->belongsTo(User::class, 'coach_id');
    }
}
