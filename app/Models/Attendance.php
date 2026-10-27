<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\AttendanceStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Attendance extends Model
{
    use HasFactory, HasUuids, LogsActivity, SoftDeletes;

    protected $fillable = [
        'training_schedule_id',
        'kenshi_id',
        'status',
        'check_in_at',
        'photo_path',
        'latitude',
        'longitude',
        'location_accuracy',
        'distance_meters',
        'is_within_radius',
        'verified_by',
        'notes',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'status' => AttendanceStatus::class,
            'check_in_at' => 'datetime',
            'latitude' => 'float',
            'longitude' => 'float',
            'location_accuracy' => 'float',
            'distance_meters' => 'float',
            'is_within_radius' => 'boolean',
            'metadata' => 'array',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('attendance_audit');
    }

    /**
     * Publicly accessible URL for selfie photo if stored.
     */
    public function getPhotoUrlAttribute(): ?string
    {
        if (blank($this->photo_path)) {
            return null;
        }

        if (str_starts_with($this->photo_path, 'http://') || str_starts_with($this->photo_path, 'https://')) {
            return $this->photo_path;
        }

        return Storage::url($this->photo_path);
    }

    /**
     * Training schedule session.
     */
    public function schedule(): BelongsTo
    {
        return $this->belongsTo(TrainingSchedule::class, 'training_schedule_id');
    }

    /**
     * Kenshi who checked in.
     */
    public function kenshi(): BelongsTo
    {
        return $this->belongsTo(Kenshi::class);
    }

    /**
     * User (Sensei or Admin) who verified this record.
     */
    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
