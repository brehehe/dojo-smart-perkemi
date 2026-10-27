<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class IndependentTraining extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'kenshi_id',
        'training_date',
        'drill_type',
        'title',
        'duration_minutes',
        'intensity',
        'reps_or_cycles',
        'estimated_calories',
        'notes',
        'status',
        'coach_notes',
        'verified_by',
    ];

    protected function casts(): array
    {
        return [
            'training_date' => 'date:Y-m-d',
            'duration_minutes' => 'integer',
            'estimated_calories' => 'integer',
        ];
    }

    /**
     * Kenshi member who completed this independent training.
     */
    public function kenshi(): BelongsTo
    {
        return $this->belongsTo(Kenshi::class);
    }

    /**
     * Coach or Sensei who verified this drill log.
     */
    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
