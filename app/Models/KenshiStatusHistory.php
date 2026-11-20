<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KenshiStatusHistory extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'kenshi_status_history';

    protected $fillable = [
        'kenshi_id',
        'status',
        'from_period',
        'to_period',
        'reason',
        'approved_by',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
        ];
    }

    public function kenshi(): BelongsTo
    {
        return $this->belongsTo(Kenshi::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
