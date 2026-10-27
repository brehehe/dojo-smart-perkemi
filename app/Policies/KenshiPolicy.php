<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Kenshi;
use App\Models\User;

class KenshiPolicy
{
    /**
     * SuperAdmin bypass.
     */
    public function before(?User $user, string $ability): ?bool
    {
        if ($user && $user->hasRole('SuperAdmin')) {
            return true;
        }

        return null;
    }

    /**
     * Publicly viewable directory of kenshis.
     */
    public function viewAny(?User $user): bool
    {
        return true;
    }

    /**
     * Publicly viewable kenshi profile.
     */
    public function view(?User $user, Kenshi $kenshi): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->can('kenshi.manage');
    }

    public function update(User $user, Kenshi $kenshi): bool
    {
        return $user->can('kenshi.manage');
    }

    public function delete(User $user, Kenshi $kenshi): bool
    {
        return $user->can('kenshi.manage');
    }
}
