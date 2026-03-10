<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class SystemSettingController extends Controller
{
    public function index()
    {
        $settings = SystemSetting::firstOrCreate(['id' => 1], [
            'app_name' => 'Company Feedback',
            'primary_color' => '#3b82f6',
            'shift_morning_start' => '08:00:00',
            'shift_morning_end' => '12:00:00',
            'shift_afternoon_start' => '13:00:00',
            'shift_afternoon_end' => '17:00:00',
        ]);

        return Inertia::render('Admin/Settings/Index', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        $settings = SystemSetting::firstOrCreate(['id' => 1]);

        // dd($request->all());

        $validated = $request->validate([
            'app_name'               => 'required|string|max:100',
            'primary_color'          => 'required|string|size:7',
            'shift_morning_start'    => 'required|date_format:H:i:s',
            'shift_morning_end'      => 'required|date_format:H:i:s',
            'shift_afternoon_start'  => 'required|date_format:H:i:s',
            'shift_afternoon_end'    => 'required|date_format:H:i:s',
            'logo'                   => 'nullable|image|mimes:jpeg,png,jpg,svg|max:2048',
        ]);

        // Secure & Fast File Handling
        if ($request->hasFile('logo')) {
            // 1. Store new file first (Fail-fast: if storage fails, DB doesn't update)
            $path = $request->file('logo')->store('logos', 'public');

            // dd($path);

            // // 2. Queue the old file for deletion to reduce request latency
            // if ($settings->logo) {
            //     // Using a simple background check/delete if your setup supports queues, 
            //     // otherwise, direct delete is fine but slightly slower.
            //     Storage::disk('public')->delete($settings->logo);
            // }

            $validated['logo'] = $path;
        }

        // Performance: Remove the 'logo' file object from the array 
        // to prevent unwanted overhead during the update process.
        // unset($validated['logo']);

        // Use a Transaction if you have multiple related tables, 
        // but for a single row, update() is efficient enough.

        // dd($validated);
        $settings->update($validated);

        Cache::forget('system_settings');

        return redirect()->route('superadmin.settings.index')
            ->with('toast', ['type' => 'success', 'message' => 'System settings updated!']);
    }
}
