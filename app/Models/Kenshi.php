<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\KenshiRank;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Crypt;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;
use Throwable;

class Kenshi extends Model
{
    use HasFactory, HasUuids, LogsActivity, SoftDeletes;

    protected $fillable = [
        'id_card_number',
        'user_id',
        'dojo_id',
        'full_name',
        'nickname',
        'gender',
        'place_of_birth',
        'date_of_birth',
        'blood_type',
        'rank',
        'member_type',
        'phone',
        'address',
        'joined_at',
        'is_active',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'rank' => KenshiRank::class,
            'date_of_birth' => 'date',
            'joined_at' => 'date',
            'is_active' => 'boolean',
            'metadata' => 'array',
        ];
    }

    /**
     * Gracefully encrypt address on store and decrypt on retrieval,
     * maintaining compatibility with unencrypted legacy records.
     */
    protected function address(): Attribute
    {
        return Attribute::make(
            get: function (?string $value): ?string {
                if ($value === null) {
                    return null;
                }

                try {
                    return Crypt::decryptString($value);
                } catch (Throwable) {
                    return $value;
                }
            },
            set: fn (?string $value): ?string => $value !== null ? Crypt::encryptString($value) : null,
        );
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('kenshi_audit');
    }

    /**
     * Associated user account for credentials and login.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The dojo this kenshi trains at.
     */
    public function dojo(): BelongsTo
    {
        return $this->belongsTo(Dojo::class);
    }

    /**
     * Attendance history for this kenshi.
     */
    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    /**
     * Independent training sessions logged by this kenshi.
     */
    public function independentTrainings(): HasMany
    {
        return $this->hasMany(IndependentTraining::class);
    }

    /**
     * Coach assessments and evaluations for this kenshi.
     */
    public function coachEvaluations(): HasMany
    {
        return $this->hasMany(CoachEvaluation::class);
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
            $q->where('full_name', 'like', "%{$term}%")
                ->orWhere('id_card_number', 'like', "%{$term}%")
                ->orWhere('phone', 'like', "%{$term}%");
        });
    }

    /**
     * Scope to filter by rank.
     */
    public function scopeRank(Builder $query, ?KenshiRank $rank): Builder
    {
        if ($rank === null) {
            return $query;
        }

        return $query->where('rank', $rank);
    }

    /**
     * Scope to filter by dojo.
     */
    public function scopeByDojo(Builder $query, ?string $dojoId): Builder
    {
        if (blank($dojoId)) {
            return $query;
        }

        return $query->where('dojo_id', $dojoId);
    }

    /**
     * Scope to filter athlete members.
     */
    public function scopeAthletes(Builder $query): Builder
    {
        return $query->where('member_type', 'athlete');
    }

    /**
     * Scope to filter coach/pelatih members.
     */
    public function scopeCoaches(Builder $query): Builder
    {
        return $query->where('member_type', 'coach');
    }

    /**
     * Scope to filter active kenshi members.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Determine if this member is a registered coach / pelatih.
     */
    public function isCoach(): bool
    {
        return $this->member_type === 'coach';
    }
}
