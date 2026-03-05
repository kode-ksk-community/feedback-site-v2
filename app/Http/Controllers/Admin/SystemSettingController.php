<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use Inertia\Inertia;
use Illuminate\Http\Request;
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
        $validated = $request->validate([
            'app_name'               => 'required|string|max:100',
            'primary_color'          => 'required|string|size:7',
            'shift_morning_start'    => 'required|date_format:H:i:s',
            'shift_morning_end'      => 'required|date_format:H:i:s',
            'shift_afternoon_start'  => 'required|date_format:H:i:s',
            'shift_afternoon_end'    => 'required|date_format:H:i:s',
            'logo'                   => 'nullable|image|max:2048', // 2MB
        ]);

        $settings = SystemSetting::firstOrCreate(['id' => 1]);

        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            if ($settings->logo_url && Storage::disk('public')->exists($settings->logo_url)) {
                Storage::disk('public')->delete($settings->logo_url);
            }
            $path = $request->file('logo')->store('logos', 'public');
            $validated['logo_url'] = $path;
        } else {
            $validated['logo_url'] = $settings->logo_url;
        }

        $settings->update($validated);

        return redirect()->route('admin.settings.edit')
            ->with('toast', ['type' => 'success', 'message' => 'System settings updated successfully!']);
    }
}
