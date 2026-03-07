<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\SystemSetting;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Cache;
class SystemSettingsServiceProvider extends ServiceProvider
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
        // Performance: Use Cache to avoid hitting the DB on every single request
        $settings = Cache::rememberForever('system_settings', function () {
            // Ensure table exists to avoid errors during initial migration
            if (Schema::hasTable('system_settings')) {
                return SystemSetting::first();
            }
            return null;
        });

        if ($settings) {
            // Override Laravel Configs at runtime
            Config::set('app.name', $settings->app_name);

            // Custom settings for use in Blade/Inertia/Controllers
            Config::set('settings.primary_color', $settings->primary_color);
            Config::set('settings.logo', $settings->logo ? asset('storage/' . $settings->logo) : null);
            Config::set('settings.shifts', [
                'morning' => ['start' => $settings->shift_morning_start, 'end' => $settings->shift_morning_end],
                'afternoon' => ['start' => $settings->shift_afternoon_start, 'end' => $settings->shift_afternoon_end],
            ]);
        }
    }
}
