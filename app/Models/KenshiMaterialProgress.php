<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KenshiMaterialProgress extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'kenshi_material_progress';

    protected $fillable = [
        'kenshi_id',
        'material_id',
        'is_completed',
        'completed_at',
        'watch_time_seconds',
    ];

    protected function casts(): array
    {
        return [
            'is_completed' => 'boolean',
            'completed_at' => 'datetime',
            'watch_time_seconds' => 'integer',
        ];
    }

    public function kenshi(): BelongsTo
    {
        return $this->belongsTo(Kenshi::class);
    }

    public function material(): BelongsTo
    {
        return $this->belongsTo(Material::class);
    }
}
