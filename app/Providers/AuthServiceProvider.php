<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Gate::define(
        //     'access-instructor-page',
        //     fn($user) =>
        //     in_array($user->role, [UserRole::INSTRUCTOR, UserRole::ADMIN])
        // );
        Gate::define('access-servicer-page', function ($user) {
            return $user->role == "servicer" || $user->role == "manager" || $user->role == "admin" || $user->role == "superadmin";
        });
        Gate::define('access-manager-page', function ($user) {
            return $user->role == "manager" || $user->role == "admin" || $user->role == "superadmin";
        });
        Gate::define('access-admin-page', function ($user) {
            return $user->role == "admin" || $user->role == "superadmin";
        });
        Gate::define('access-superadmin-page', function ($user) {
            return $user->role == "superadmin";
        });

        // servicer
        // manager
        // admin
        // superadmin
    }
}
