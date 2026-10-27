<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Dojo;
use App\Models\User;

class DojoPolicy
{
    /**
     * Intercept all checks for super-admins.
     */
    public function before(?User $user, string $ability): ?bool
    {
        if ($user && $user->hasRole('SuperAdmin')) {
            return true;
        }

        return null;
    }

    /**
     * Viewable directory of dojos for authenticated users.
     */
    public function viewAny(?User $user): bool
    {
        return $user !== null;
    }

    /**
     * Viewable dojo detail for authenticated users.
     */
    public function view(?User $user, Dojo $dojo): bool
    {
        return $user !== null;
    }

    public function create(User $user): bool
    {
        return $user->can('dojo.create');
    }

    public function update(User $user, Dojo $dojo): bool
    {
        if ($user->can('dojo.update')) {
            return true;
        }

        // Head sensei can update their own dojo
        return $dojo->head_sensei_id === $user->id;
    }

    public function delete(User $user, Dojo $dojo): bool
    {
        return $user->can('dojo.delete');
    }

    public function restore(User $user, Dojo $dojo): bool
    {
        return $user->can('dojo.restore');
    }

    public function forceDelete(User $user, Dojo $dojo): bool
    {
        return $user->can('dojo.force_delete');
    }
}
