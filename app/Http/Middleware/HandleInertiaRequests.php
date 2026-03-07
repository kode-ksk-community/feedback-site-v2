<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
                'can' => [
                    'access-admin-page' => $request->user()?->can('access-admin-page'),
                    'access-superadmin-page' => $request->user()?->can('access-superadmin-page'),
                    'access-manager-page' => $request->user()?->can('access-manager-page'),
                    'access-servicer-page' => $request->user()?->can('access-servicer-page'),
                ],
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error'   => $request->session()->get('error'),
            ],

            'system' => [
                'app_name' => config('app.name'),
                'logo' => config('settings.logo'),
                'primary_color' => config('settings.primary_color'),
                // Only share what the frontend actually needs
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
