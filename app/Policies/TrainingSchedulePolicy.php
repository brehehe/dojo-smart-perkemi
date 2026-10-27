<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\TrainingSchedule;
use App\Models\User;

class TrainingSchedulePolicy
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
     * Determine whether the user can view any schedules (public/all members).
     */
    public function viewAny(?User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the schedule details.
     */
    public function view(?User $user, TrainingSchedule $trainingSchedule): bool
    {
        return true;
    }

    /**
     * Determine whether the user can create training schedules.
     * Only Admin (SuperAdmin, PengprovAdmin, PengkabAdmin) or Dojo (Sensei / Head Sensei).
     */
    public function create(User $user): bool
    {
        return $user->hasRole('PengprovAdmin')
            || $user->hasRole('PengkabAdmin')
            || $user->hasRole('Sensei')
            || $user->can('kenshi.manage');
    }

    /**
     * Determine whether the user can update the training schedule.
     */
    public function update(User $user, TrainingSchedule $trainingSchedule): bool
    {
        if ($user->hasRole('PengprovAdmin') || $user->hasRole('PengkabAdmin') || $user->can('kenshi.manage')) {
            return true;
        }

        if ($user->hasRole('Sensei')) {
            return $trainingSchedule->dojo?->head_sensei_id === $user->id || $user->hasRole('Sensei');
        }

        return false;
    }

    /**
     * Determine whether the user can delete the training schedule.
     * Only Admin or Dojo Sensei responsible for this dojo.
     */
    public function delete(User $user, TrainingSchedule $trainingSchedule): bool
    {
        if ($user->hasRole('PengprovAdmin') || $user->hasRole('PengkabAdmin') || $user->can('kenshi.manage')) {
            return true;
        }

        if ($user->hasRole('Sensei')) {
            return $trainingSchedule->dojo?->head_sensei_id === $user->id || $user->hasRole('Sensei');
        }

        return false;
    }
}
