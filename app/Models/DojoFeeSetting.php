<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\FeeSettingStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class DojoFeeSetting extends Model
{
    use HasFactory, HasUuids, LogsActivity, SoftDeletes;

    protected $fillable = [
        'dojo_id',
        'category',
        'amount',
        'effective_from',
        'effective_to',
        'status',
        'requested_by',
        'requested_at',
        'change_reason',
        'approved_by',
        'approved_at',
        'approval_sk_number',
        'approval_document_path',
        'rejection_reason',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'status' => FeeSettingStatus::class,
            'requested_at' => 'datetime',
            'approved_at' => 'datetime',
            'metadata' => 'array',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('dojo_fee_setting');
    }

    public function dojo(): BelongsTo
    {
        return $this->belongsTo(Dojo::class);
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class, 'fee_setting_id');
    }

    public function scopeApproved(Builder $query): Builder
    {
        return $query->where('status', FeeSettingStatus::Approved);
    }

    public function scopePendingPB(Builder $query): Builder
    {
        return $query->where('status', FeeSettingStatus::PendingPB);
    }
}
