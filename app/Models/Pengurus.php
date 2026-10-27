<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Pengurus extends Model
{
    use HasFactory, HasUuids, LogsActivity, SoftDeletes;

    protected $table = 'pengurus';

    protected $fillable = [
        'type',
        'name',
        'code',
        'region',
        'user_id',
        'sk_number',
        'sk_period',
        'leader_name',
        'secretary_name',
        'contact_phone',
        'contact_email',
        'address',
        'status',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'type', 'region', 'leader_name', 'status'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('pengurus_organization');
    }

    /**
     * User account associated with this Pengurus for authentication.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Direct relationship to kenshis linked by foreign key.
     */
    public function kenshis(): HasMany
    {
        $foreignKey = $this->type === 'pengprov' ? 'pengprov_id' : 'pengkot_id';

        return $this->hasMany(Kenshi::class, $foreignKey);
    }

    /**
     * Dojos affiliated with this region.
     */
    public function getDojosAttribute()
    {
        if ($this->type === 'pengprov') {
            return Dojo::where('pengprov', $this->region)->get();
        }

        return Dojo::where('pengkab', $this->region)->get();
    }

    /**
     * Athletes affiliated with this organization.
     */
    public function getAthletesAttribute()
    {
        if ($this->type === 'pengprov') {
            return Kenshi::where(function ($q) {
                $q->where('pengprov_id', $this->id)
                    ->orWhere(function ($sub) {
                        $sub->where('is_atlet_pengprov', true)
                            ->where('pengprov', $this->region);
                    });
            })->get();
        }

        return Kenshi::where(function ($q) {
            $q->where('pengkot_id', $this->id)
                ->orWhere(function ($sub) {
                    $sub->where('is_atlet_pengkot', true)
                        ->where('pengkot', $this->region);
                });
        })->get();
    }

    /**
     * Scope for Pengkot / Pengkab organizations.
     */
    public function scopePengkot(Builder $query): Builder
    {
        return $query->where('type', 'pengkot');
    }

    /**
     * Scope for Pengprov organizations.
     */
    public function scopePengprov(Builder $query): Builder
    {
        return $query->where('type', 'pengprov');
    }

    /**
     * Scope for active organizations.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }
}
