<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\KenshiRank;
use App\Enums\MaterialPillar;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Material extends Model
{
    use HasFactory, HasUuids, LogsActivity, SoftDeletes;

    protected $fillable = [
        'title',
        'slug',
        'pillar',
        'target_rank',
        'summary',
        'video_url',
        'video_duration',
        'video_chapters',
        'pdf_path',
        'is_official_pb',
        'scope_type',
        'pengprov_id',
        'pengkot_id',
        'media_type',
        'file_path',
        'pdf_pages_count',
        'pages_data',
        'dojo_id',
        'uploader_id',
        'is_active',
        'is_public',
        'order_priority',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'pillar' => MaterialPillar::class,
            'target_rank' => KenshiRank::class,
            'video_chapters' => 'array',
            'is_official_pb' => 'boolean',
            'is_active' => 'boolean',
            'is_public' => 'boolean',
            'order_priority' => 'integer',
            'pdf_pages_count' => 'integer',
            'pages_data' => 'array',
            'metadata' => 'array',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('material_curriculum');
    }

    public function dojo(): BelongsTo
    {
        return $this->belongsTo(Dojo::class);
    }

    public function pengprov(): BelongsTo
    {
        return $this->belongsTo(Pengurus::class, 'pengprov_id');
    }

    public function pengkot(): BelongsTo
    {
        return $this->belongsTo(Pengurus::class, 'pengkot_id');
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploader_id');
    }

    public function progresses(): HasMany
    {
        return $this->hasMany(KenshiMaterialProgress::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeOfficial(Builder $query): Builder
    {
        return $query->where('is_official_pb', true);
    }

    public function scopeForDojo(Builder $query, ?string $dojoId): Builder
    {
        if (blank($dojoId)) {
            return $query->whereNull('dojo_id');
        }

        return $query->where(function (Builder $q) use ($dojoId): void {
            $q->whereNull('dojo_id')->orWhere('dojo_id', $dojoId);
        });
    }

    /**
     * Scope materials accessible for a specific kenshi based on belt rank and organizational hierarchy.
     */
    public function scopeAccessibleForKenshi(Builder $query, Kenshi $kenshi): Builder
    {
        $ranksOrder = array_column(KenshiRank::cases(), 'value');
        $kenshiRankIdx = array_search($kenshi->rank?->value, $ranksOrder, true);

        // Valid ranks allowed for this kenshi (same rank or below)
        $allowedRanks = $kenshiRankIdx !== false
            ? array_slice($ranksOrder, 0, $kenshiRankIdx + 1)
            : [$kenshi->rank?->value ?? 'minarai'];

        return $query->where(function (Builder $q) use ($kenshi, $allowedRanks): void {
            // 1. National PB materials (gated by belt rank, or public)
            $q->where(function (Builder $sub) use ($allowedRanks): void {
                $sub->where(function (Builder $nat): void {
                    $nat->where('scope_type', 'national')
                        ->orWhere('is_official_pb', true);
                })->where(function (Builder $perm) use ($allowedRanks): void {
                    $perm->where('is_public', true)
                        ->orWhereIn('target_rank', $allowedRanks);
                });
            });

            // 2. Pengprov materials matching kenshi's Pengprov
            if ($kenshi->pengprov_id || $kenshi->pengprov) {
                $q->orWhere(function (Builder $sub) use ($kenshi): void {
                    $sub->where('scope_type', 'pengprov')
                        ->where(function (Builder $cond) use ($kenshi): void {
                            if ($kenshi->pengprov_id) {
                                $cond->where('pengprov_id', $kenshi->pengprov_id);
                            }
                            if ($kenshi->pengprov) {
                                $cond->orWhereHas('pengprov', fn ($p) => $p->where('region', $kenshi->pengprov));
                            }
                        });
                });
            }

            // 3. Pengkot / Pengkab materials matching kenshi's Pengkot
            if ($kenshi->pengkot_id || $kenshi->pengkot) {
                $q->orWhere(function (Builder $sub) use ($kenshi): void {
                    $sub->where('scope_type', 'pengkot')
                        ->where(function (Builder $cond) use ($kenshi): void {
                            if ($kenshi->pengkot_id) {
                                $cond->where('pengkot_id', $kenshi->pengkot_id);
                            }
                            if ($kenshi->pengkot) {
                                $cond->orWhereHas('pengkot', fn ($p) => $p->where('region', $kenshi->pengkot));
                            }
                        });
                });
            }

            // 4. Dojo materials matching kenshi's registered Dojo
            if ($kenshi->dojo_id) {
                $q->orWhere(function (Builder $sub) use ($kenshi): void {
                    $sub->where('scope_type', 'dojo')
                        ->where('dojo_id', $kenshi->dojo_id);
                });
            }
        });
    }
}
