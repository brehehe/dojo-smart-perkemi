<?php

declare(strict_types=1);

namespace App\Actions\Dojo;

use App\Models\Dojo;
use Illuminate\Support\Facades\DB;

class CreateDojoAction
{
    /**
     * Create a new Dojo record with transaction safety and activity logging.
     *
     * @param  array<string, mixed>  $data
     */
    public function execute(array $data): Dojo
    {
        return DB::transaction(function () use ($data): Dojo {
            $dojo = Dojo::create($data);

            activity('dojo')
                ->performedOn($dojo)
                ->causedBy(auth()->user())
                ->withProperties(['code' => $dojo->code, 'pengprov' => $dojo->pengprov])
                ->log("Dojo [{$dojo->name}] resmi didaftarkan.");

            return $dojo;
        });
    }
}
