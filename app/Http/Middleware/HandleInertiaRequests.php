<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\Dojo;
use App\Models\Kenshi;
use App\Models\TrainingSchedule;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        $can = [];
        if ($user) {
            $isSuperAdmin = $user->hasRole('SuperAdmin');
            $can = [
                'dojo_create' => $isSuperAdmin || $user->can('create', Dojo::class),
                'kenshi_create' => $isSuperAdmin || $user->can('create', Kenshi::class),
                'kenshi_manage' => $isSuperAdmin || $user->can('kenshi.manage'),
                'schedule_create' => $isSuperAdmin || $user->can('create', TrainingSchedule::class),
                'view_reports' => $isSuperAdmin || $user->hasAnyRole(['PengprovAdmin', 'PengkabAdmin', 'Sensei']) || $user->can('kenshi.manage'),
                'view_finance' => $isSuperAdmin || $user->hasAnyRole(['PengprovAdmin', 'PengkabAdmin', 'Sensei']),
                'view_system_logs' => $isSuperAdmin,
                'view_my_dojo' => $isSuperAdmin || $user->hasAnyRole(['PengprovAdmin', 'Sensei']),
                'view_kta_portal' => $isSuperAdmin || $user->hasRole('Kenshi'),
                'view_directory' => $isSuperAdmin || $user->hasAnyRole(['PengprovAdmin', 'PengkabAdmin', 'Sensei']),
                'evaluate_kenshi' => $isSuperAdmin || $user->hasAnyRole(['PengprovAdmin', 'PengkabAdmin', 'Sensei']),
            ];
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'roles' => method_exists($user, 'getRoleNames') ? $user->getRoleNames()->values()->all() : [],
                    'permissions' => method_exists($user, 'getAllPermissions') ? $user->getAllPermissions()->pluck('name')->values()->all() : [],
                    'can' => $can,
                    'kenshi_id' => $user->kenshi?->id,
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
                'info' => fn () => $request->session()->get('info'),
            ],
            'app' => [
                'name' => config('app.name', 'Perkemi e-Dojo'),
                'version' => '1.0.0',
            ],
        ];
    }
}
