<?php

declare(strict_types=1);

namespace App\Actions\Dojo;

use App\Models\Dojo;
use Illuminate\Support\Facades\DB;

class UpdateDojoAction
{
    /**
     * Update an existing Dojo with transaction safety and audit tracking.
     *
     * @param  array<string, mixed>  $data
     */
    public function execute(Dojo $dojo, array $data): Dojo
    {
        return DB::transaction(function () use ($dojo, $data): Dojo {
            $dojo->update($data);

            activity('dojo')
                ->performedOn($dojo)
                ->causedBy(auth()->user())
                ->log("Data dojo [{$dojo->name}] berhasil diperbarui.");

            return $dojo;
        });
    }
}
