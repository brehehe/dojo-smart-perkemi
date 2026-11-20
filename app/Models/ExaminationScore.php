<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExaminationScore extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'registration_id',
        'examiner_id',
        'dokuhon_score',
        'goho_score',
        'juho_score',
        'embu_score',
        'randori_score',
        'total_weighted_score',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'dokuhon_score' => 'integer',
            'goho_score' => 'integer',
            'juho_score' => 'integer',
            'embu_score' => 'integer',
            'randori_score' => 'integer',
            'total_weighted_score' => 'float',
        ];
    }

    public function registration(): BelongsTo
    {
        return $this->belongsTo(ExaminationRegistration::class, 'registration_id');
    }

    public function examiner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'examiner_id');
    }
}
