<?php

declare(strict_types=1);

namespace App\Actions\Dues;

use App\Enums\FeeSettingStatus;
use App\Models\DojoFeeSetting;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ApproveDojoFeeSettingAction
{
    /**
     * PB PERKEMI authorizes custom dojo fee setting (Option A).
     */
    public function execute(
        DojoFeeSetting $setting,
        User $approver,
        string $skNumber,
        ?string $docPath = null
    ): DojoFeeSetting {
        return DB::transaction(function () use ($setting, $approver, $skNumber, $docPath): DojoFeeSetting {
            // Supersede previous approved active settings for this dojo
            DojoFeeSetting::where('dojo_id', $setting->dojo_id)
                ->where('category', $setting->category)
                ->where('id', '!=', $setting->id)
                ->where('status', FeeSettingStatus::Approved)
                ->update(['status' => FeeSettingStatus::Superseded]);

            $setting->update([
                'status' => FeeSettingStatus::Approved,
                'approved_by' => $approver->id,
                'approved_at' => now(),
                'approval_sk_number' => $skNumber,
                'approval_document_path' => $docPath,
            ]);

            activity('dojo_fee')
                ->performedOn($setting)
                ->causedBy($approver)
                ->log("PB PERKEMI menyetujui tarif dojo [{$setting->dojo?->name}] Rp".number_format($setting->amount, 0, ',', '.')." dengan SK No: {$skNumber}.");

            return $setting;
        });
    }
}
