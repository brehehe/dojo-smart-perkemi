<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\KenshiRank;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KenshiPromotion extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'kenshi_id',
        'previous_rank',
        'new_rank',
        'promotion_date',
        'sk_number',
        'certificate_number',
        'examination_id',
        'promoted_by',
        'notes',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'previous_rank' => KenshiRank::class,
            'new_rank' => KenshiRank::class,
            'promotion_date' => 'date',
            'metadata' => 'array',
        ];
    }

    public function kenshi(): BelongsTo
    {
        return $this->belongsTo(Kenshi::class);
    }

    public function examination(): BelongsTo
    {
        return $this->belongsTo(Examination::class);
    }

    public function promoter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'promoted_by');
    }
}
