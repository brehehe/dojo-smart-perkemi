<?php

declare(strict_types=1);

namespace App\Actions\Dues;

use App\Enums\FeeSettingStatus;
use App\Models\Dojo;
use App\Models\DojoFeeSetting;
use App\Models\User;

class RequestDojoFeeSettingAction
{
    /**
     * Submit fee setting proposal for a dojo.
     * If standard Rp50,000, automatically approved per SK.
     * If > Rp50,000, set to pending_pb awaiting PB written approval.
     */
    public function execute(
        Dojo $dojo,
        int $amount,
        string $effectiveFrom,
        ?string $changeReason = null,
        ?User $user = null,
        ?array $allocationRates = null
    ): DojoFeeSetting {
        $status = $amount === 50000 && empty($allocationRates)
            ? FeeSettingStatus::Approved
            : ($user?->hasRole('SuperAdmin') ? FeeSettingStatus::Approved : FeeSettingStatus::PendingPB);

        if ($status === FeeSettingStatus::Approved) {
            DojoFeeSetting::where('dojo_id', $dojo->id)
                ->where('category', 'kyukenshi')
                ->where('status', FeeSettingStatus::Approved)
                ->update(['status' => FeeSettingStatus::Superseded]);
        }

        $metadata = [];
        if (! empty($allocationRates)) {
            $metadata['allocation_rates'] = $allocationRates;
        }

        $setting = DojoFeeSetting::create([
            'dojo_id' => $dojo->id,
            'category' => 'kyukenshi',
            'amount' => $amount,
            'effective_from' => $effectiveFrom,
            'status' => $status,
            'requested_by' => $user?->id,
            'requested_at' => now(),
            'change_reason' => $changeReason,
            'approved_at' => $status === FeeSettingStatus::Approved ? now() : null,
            'approved_by' => $status === FeeSettingStatus::Approved ? $user?->id : null,
            'metadata' => ! empty($metadata) ? $metadata : null,
        ]);

        activity('dojo_fee')
            ->performedOn($setting)
            ->causedBy($user)
            ->log("Pengaturan tarif dojo [{$dojo->name}] sebesar Rp".number_format($amount, 0, ',', '.')." diajukan dengan status [{$status->value}].");

        return $setting;
    }
}
