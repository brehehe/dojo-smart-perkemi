<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\InvoiceStatus;
use App\Enums\InvoiceType;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Invoice extends Model
{
    use HasFactory, HasUuids, LogsActivity, SoftDeletes;

    protected $fillable = [
        'kenshi_id',
        'dojo_id',
        'type',
        'period',
        'amount',
        'policy_snapshot',
        'status',
        'due_date',
        'paid_at',
        'fee_setting_id',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'type' => InvoiceType::class,
            'status' => InvoiceStatus::class,
            'amount' => 'integer',
            'due_date' => 'date',
            'paid_at' => 'datetime',
            'policy_snapshot' => 'array',
            'metadata' => 'array',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('invoice');
    }

    public function kenshi(): BelongsTo
    {
        return $this->belongsTo(Kenshi::class);
    }

    public function dojo(): BelongsTo
    {
        return $this->belongsTo(Dojo::class);
    }

    public function feeSetting(): BelongsTo
    {
        return $this->belongsTo(DojoFeeSetting::class, 'fee_setting_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function allocations(): HasMany
    {
        return $this->hasMany(Allocation::class);
    }

    public function isPaid(): bool
    {
        return $this->status === InvoiceStatus::Paid;
    }

    public function scopeUnpaid(Builder $query): Builder
    {
        return $query->where('status', InvoiceStatus::Unpaid);
    }

    public function scopePaid(Builder $query): Builder
    {
        return $query->where('status', InvoiceStatus::Paid);
    }
}
