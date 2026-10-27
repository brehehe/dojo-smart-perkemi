<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\DojoStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Dojo extends Model
{
    use HasFactory, HasUuids, LogsActivity, SoftDeletes;

    protected $fillable = [
        'code',
        'name',
        'pengprov',
        'pengkab',
        'address',
        'city',
        'latitude',
        'longitude',
        'radius_meters',
        'head_sensei_id',
        'contact_phone',
        'contact_email',
        'status',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'status' => DojoStatus::class,
            'latitude' => 'float',
            'longitude' => 'float',
            'radius_meters' => 'integer',
            'metadata' => 'array',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('dojo_audit');
    }

    /**
     * Head Sensei or instructor leading this dojo.
     */
    public function headSensei(): BelongsTo
    {
        return $this->belongsTo(User::class, 'head_sensei_id');
    }

    /**
     * Kenshis registered at this dojo.
     */
    public function kenshis(): HasMany
    {
        return $this->hasMany(Kenshi::class);
    }

    /**
     * Training schedules hosted by this dojo.
     */
    public function schedules(): HasMany
    {
        return $this->hasMany(TrainingSchedule::class);
    }

    /**
     * Scope to filter only active dojos.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', DojoStatus::Active);
    }

    /**
     * Scope to search by keyword.
     */
    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        if (blank($term)) {
            return $query;
        }

        return $query->where(function (Builder $q) use ($term): void {
            $q->where('name', 'like', "%{$term}%")
                ->orWhere('code', 'like', "%{$term}%")
                ->orWhere('pengkab', 'like', "%{$term}%")
                ->orWhere('pengprov', 'like', "%{$term}%");
        });
    }
}
