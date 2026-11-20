<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ExaminationStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Examination extends Model
{
    use HasFactory, HasUuids, LogsActivity, SoftDeletes;

    protected $fillable = [
        'title',
        'level_scope',
        'organizer_id',
        'organizer_type',
        'location_name',
        'date',
        'start_time',
        'end_time',
        'quota',
        'status',
        'sk_number',
        'notes',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'status' => ExaminationStatus::class,
            'date' => 'date',
            'quota' => 'integer',
            'metadata' => 'array',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('examination');
    }

    public function registrations(): HasMany
    {
        return $this->hasMany(ExaminationRegistration::class);
    }

    public function promotions(): HasMany
    {
        return $this->hasMany(KenshiPromotion::class);
    }

    public function scopeOpen(Builder $query): Builder
    {
        return $query->where('status', ExaminationStatus::RegistrationOpen);
    }
}
