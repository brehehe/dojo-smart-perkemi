<?php

declare(strict_types=1);

namespace App\Actions\Material;

use App\Models\Kenshi;
use App\Models\KenshiMaterialProgress;
use App\Models\Material;

class ToggleMaterialProgressAction
{
    /**
     * Mark a curriculum video/PDF as completed or toggle state.
     */
    public function execute(Kenshi $kenshi, Material $material): KenshiMaterialProgress
    {
        $progress = KenshiMaterialProgress::firstOrNew([
            'kenshi_id' => $kenshi->id,
            'material_id' => $material->id,
        ]);

        $newCompleted = ! $progress->is_completed;

        $progress->is_completed = $newCompleted;
        $progress->completed_at = $newCompleted ? now() : null;
        $progress->save();

        activity('curriculum')
            ->performedOn($material)
            ->causedBy($kenshi->user)
            ->log("Kenshi [{$kenshi->full_name}] menandai modul [{$material->title}] sebagai ".($newCompleted ? 'selesai' : 'belum selesai').'.');

        return $progress;
    }
}
