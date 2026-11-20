<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\AllocationStatus;
use App\Enums\BeneficiaryType;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Allocation extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'invoice_id',
        'beneficiary_type',
        'beneficiary_id',
        'rate_percentage',
        'amount',
        'status',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'beneficiary_type' => BeneficiaryType::class,
            'status' => AllocationStatus::class,
            'rate_percentage' => 'float',
            'amount' => 'integer',
            'metadata' => 'array',
        ];
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function transfers(): HasMany
    {
        return $this->hasMany(Transfer::class);
    }
}
