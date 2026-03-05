<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Counter;
use App\Models\CounterUser;
use App\Models\ServicerAssignment;
use App\Models\Tag;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cookie;

class TerminalController extends Controller
{
    public function activate(Request $request)
    {
        // 1. Efficient Data Fetching
        $branches = Branch::select(['id', 'name'])->get();
        $counters = Counter::select('id', 'name', 'branch_id', 'pin')
            ->with('branch:id,name')
            ->where('is_active', true)
            ->get();

        // 2. Check if the cookie ALREADY exists
        $existingToken = $request->cookie('terminal_token');

        $response = Inertia::render('client/ActivateCounter', [
            'branches' => $branches,
            'counters' => $counters,
            'terminalToken' => $existingToken, // Pass to frontend if needed
        ]);

        // 3. ONLY attach the cookie if it's missing (Performance Optimization)
        if (!$existingToken) {
            $newToken = Str::uuid()->toString();
            return $response->toResponse($request)->withCookie(
                cookie()->forever('terminal_token', $newToken, null, null, true, true)
            );
        }

        return $response;
    }

    // public function verifyPin(Request $request)
    // {
    //     $request->validate([
    //         'counter_id' => 'required|exists:counters,id',
    //         'pin' => 'required|string',
    //         'device_uuid' => 'required|string'
    //     ]);

    //     $counter = Counter::findOrFail($request->counter_id);

    //     if (!Hash::check($request->pin, $counter->pin ?? '')) {
    //         return back()->withErrors(['pin' => 'Wrong PIN']);
    //     }

    //     return redirect()->route('client.feedback', $counter->id);
    // }

    public function verifyPin(Request $request)
    {
        $request->validate([
            'counter_id' => 'required|exists:counters,id',
            'pin' => 'required|string|size:6',
        ]);

        $counter = Counter::findOrFail($request->counter_id);

        // 1. Check if counter is already active on another device
        // Logic: If device_uuid exists and heartbeat is fresh (< 2 mins), it's occupied.
        if ($counter->device_uuid && $counter->last_heartbeat_at > now()->subMinutes(2)) {
            // Only block if the requesting device is DIFFERENT from the locked one
            if ($counter->device_uuid !== $request->cookie('terminal_token')) {
                return back()->withErrors(['counter_id' => 'This terminal is currently locked by another device.']);
            }
        }

        // 2. High-Speed PIN Verification
        if (!Hash::check($request->pin, $counter->pin)) {
            return back()->withErrors(['pin' => 'Security Challenge Failed: Invalid PIN.']);
        }

        // 3. One-to-One Binding with Hardware Token
        if ($request->cookie('terminal_token') && $counter->device_uuid !== $request->cookie('terminal_token')) {
            // Optional: Check if the session is actually "stale" (e.g., no heartbeat for 5 mins)
            if ($counter->last_heartbeat_at > now()->subMinutes(5)) {
                return back()->withErrors(['counter_id' => 'This terminal is currently locked by another device.']);
            }
        }

        // 4. Atomic Update: Bind Hardware to Counter
        $counter->update([
            'device_uuid' => $request->cookie('terminal_token'),
            'last_heartbeat_at' => now(),
        ]);

        // 5. Attach Secure Cookie (Expires in 5 years - "Permanent" Hardware ID)
        return redirect()->route('client.feedback', $counter->id);
    }

    // public function verifyPin(Request $request)
    // {
    //     // dd($request->all());
    //     $request->validate([
    //         'counter_id' => 'required|exists:counters,id',
    //         'pin' => 'required|string|size:6',
    //         'device_uuid' => 'required|string'
    //     ]);

    //     $counter = Counter::findOrFail($request->counter_id);

    //     // 1. Security Check: Is this counter already in use by someone else?
    //     if ($counter->device_uuid !== $request->device_uuid) {
    //         // Optional: Check if the session is actually "stale" (e.g., no heartbeat for 5 mins)
    //         if ($counter->last_heartbeat_at > now()->subMinutes(5)) {
    //             return back()->withErrors(['counter_id' => 'This terminal is currently locked by another device.']);
    //         }
    //     }

    //     // 2. PIN Verification
    //     if (!Hash::check($request->pin, $counter->pin ?? '')) {
    //         return back()->withErrors(['pin' => 'Wrong PIN']);
    //     }

    //     // 3. One-to-One Binding
    //     $counter->update([
    //         'device_uuid' => $request->device_uuid,
    //         'last_heartbeat_at' => now()
    //     ]);

    //     return redirect()->route('client.feedback', $counter->id);
    // }

    public function feedback(Counter $counter)
    {
        $counter->load('branch');

        $tags = Tag::where('category', '!=', 'neutral')->get();

        // Get active servicer for this counter
        $activeAssignment = CounterUser::with('user')
            ->where('counter_id', $counter->id)
            ->whereNull('end_time')
            ->latest('start_time')
            ->first();



        return Inertia::render('client/Feedback', [
            'counter' => $counter,
            'tags' => $tags,
            'fixed_qr_token' => $counter->fixed_qr_token,
            'currentServicer' => $activeAssignment ? $activeAssignment->user : null,
        ]);
    }
}
