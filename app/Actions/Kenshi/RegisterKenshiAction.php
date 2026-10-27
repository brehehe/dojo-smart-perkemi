<?php

declare(strict_types=1);

namespace App\Actions\Kenshi;

use App\Models\Kenshi;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class RegisterKenshiAction
{
    /**
     * Register a new Kenshi, optionally generating a user login account and audit log.
     *
     * @param  array<string, mixed>  $data
     */
    public function execute(array $data): Kenshi
    {
        return DB::transaction(function () use ($data): Kenshi {
            $userId = null;

            // Conditionally provision a user login account
            if (! empty($data['create_user_account']) && ! empty($data['email'])) {
                // Default password is NIK (id_card_number) unless custom password is provided
                $password = ! empty($data['password'])
                    ? $data['password']
                    : $data['id_card_number'];

                $user = User::create([
                    'name' => $data['full_name'],
                    'email' => $data['email'],
                    'password' => Hash::make($password),
                ]);

                if (method_exists($user, 'assignRole')) {
                    $roleToAssign = ($data['member_type'] ?? 'athlete') === 'coach' ? 'Sensei' : 'Kenshi';
                    $user->assignRole($roleToAssign);
                }

                $userId = $user->id;
            }

            unset($data['create_user_account'], $data['email'], $data['password']);

            if ($userId !== null) {
                $data['user_id'] = $userId;
            }

            $kenshi = Kenshi::create($data);

            activity('kenshi')
                ->performedOn($kenshi)
                ->causedBy(auth()->user())
                ->withProperties([
                    'id_card_number' => $kenshi->id_card_number,
                    'rank' => $kenshi->rank->value,
                    'dojo_id' => $kenshi->dojo_id,
                ])
                ->log("Kenshi baru [{$kenshi->full_name}] ({$kenshi->id_card_number}) berhasil terdaftar.");

            return $kenshi;
        });
    }
}
