<?php

declare(strict_types=1);

namespace App\Actions\Dues;

use App\Models\Kenshi;
use App\Models\KenshiStatusHistory;

class CheckDelinquencyAction
{
    /**
     * Check if kenshi has 12 consecutive unpaid invoices, and if so,
     * transition membership status to inactive_temporary per SK Diktum V.
     */
    public function execute(Kenshi $kenshi): bool
    {
        if ($kenshi->isDelinquent12Months()) {
            if ($kenshi->is_active) {
                $kenshi->update(['is_active' => false]);

                KenshiStatusHistory::create([
                    'kenshi_id' => $kenshi->id,
                    'status' => 'inactive_temporary',
                    'from_period' => now()->format('Y-m'),
                    'reason' => 'Menunggak iuran bulanan selama 12 bulan berturut-turut (SK PB No. 045/SK-PB/VII/2025 Diktum V).',
                ]);

                activity('membership')
                    ->performedOn($kenshi)
                    ->log("Kenshi [{$kenshi->full_name}] dinonaktifkan sementara karena menunggak iuran 12 bulan berturut-turut.");
            }

            return true;
        }

        return false;
    }
}
