<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ScheduleProgramType;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class TrainingSchedule extends Model
{
    use HasFactory, HasUuids, LogsActivity, SoftDeletes;

    protected $fillable = [
        'dojo_id',
        'title',
        'program_type',
        'date',
        'start_time',
        'end_time',
        'location_name',
        'latitude',
        'longitude',
        'radius_meters',
        'instructor_name',
        'notes',
        'status',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date:Y-m-d',
            'program_type' => ScheduleProgramType::class,
            'radius_meters' => 'integer',
            'latitude' => 'float',
            'longitude' => 'float',
            'metadata' => 'array',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('training_schedule_audit');
    }

    /**
     * Dojo where this training session is hosted.
     */
    public function dojo(): BelongsTo
    {
        return $this->belongsTo(Dojo::class);
    }

    /**
     * Attendance entries logged for this training session.
     */
    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    /**
     * Scope for a specific dojo.
     */
    public function scopeForDojo(Builder $query, ?string $dojoId): Builder
    {
        if (blank($dojoId)) {
            return $query;
        }

        return $query->where('dojo_id', $dojoId);
    }

    /**
     * Scope for schedules within a specific month.
     */
    public function scopeInMonth(Builder $query, int $year, int $month): Builder
    {
        return $query->whereYear('date', $year)
            ->whereMonth('date', $month);
    }

    /**
     * Scope for upcoming or today's schedules.
     */
    public function scopeUpcoming(Builder $query): Builder
    {
        return $query->where('date', '>=', now()->toDateString())
            ->orderBy('date')
            ->orderBy('start_time');
    }
}
