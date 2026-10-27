<?php

declare(strict_types=1);

namespace App\Providers;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Disable data wrapping for single JsonResource responses to match frontend props
        JsonResource::withoutWrapping();

        // Prevent lazy loading in local environment to catch N+1 queries early
        Model::preventLazyLoading(! $this->app->isProduction());

        // SuperAdmin bypass for all Spatie Gates & Policies
        Gate::before(function ($user, $ability) {
            return $user instanceof User && $user->hasRole('SuperAdmin') ? true : null;
        });

        // Gate for Opcodes Log Viewer
        Gate::define('viewLogViewer', function (?User $user): bool {
            return $user !== null && $user->hasRole('SuperAdmin');
        });
    }
}
