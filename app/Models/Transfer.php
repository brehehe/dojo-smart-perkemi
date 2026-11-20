<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transfer extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'allocation_id',
        'amount',
        'proof_reference',
        'proof_file_path',
        'transferred_at',
        'reconciled_at',
        'reconciled_by',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'transferred_at' => 'datetime',
            'reconciled_at' => 'datetime',
        ];
    }

    public function allocation(): BelongsTo
    {
        return $this->belongsTo(Allocation::class);
    }

    public function reconciler(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reconciled_by');
    }
}
