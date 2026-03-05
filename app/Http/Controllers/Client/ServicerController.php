<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Counter;
use App\Models\CounterUser;
use App\Models\ServicerAssignment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class ServicerController extends Controller
{
    public function start(Request $request)
    {
        $counterId = $request->query('counter_id');
        $token     = $request->query('token');

        $counter = Counter::findOrFail($counterId);

        // Security check for fixed QR token
        if ($counter->fixed_qr_token !== $token) {
            abort(403, 'Invalid or expired QR code');
        }

        return Inertia::render('Servicer/Login', [
            'counter'     => $counter->only(['id', 'name']),
            'counterName' => $counter->name,
        ]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'login'      => 'required|string',
            'password'   => 'required|string',
            'counter_id' => 'required|exists:counters,id',
        ]);

        $loginField = filter_var($request->login, FILTER_VALIDATE_EMAIL)
            ? 'email'
            : 'username';

        if (!Auth::attempt([$loginField => $request->login, 'password' => $request->password])) {
            return back()->withErrors(['login' => 'Invalid username/email or password']);
        }

        $user = Auth::user();

        // if ($user->role !== 'servicer') {
        //     Auth::logout();
        //     return back()->withErrors(['login' => 'Only servicers are allowed to log in here']);
        // }

        // Prevent multiple active sessions
        $activeShift = CounterUser::where('user_id', $user->id)
            ->whereNull('end_time')
            ->first();

        if ($activeShift) {
            Auth::logout();
            return back()->withErrors([
                'login' => 'You are already working at another counter.'
            ]);
        }

        // 'counter_id',
        // 'user_id',
        // 'start_time',
        // 'end_time',
        // 'is_active',
        // 'expires_at',


        CounterUser::create([
            'counter_id'  => $request->counter_id,
            'user_id'     => $user->id,
            'start_time'  => now(),
            'end_time'    => null, // end time should be null until the shift ends
            'is_active'   => true,
            'expires_at'  => now()->endOfDay(), // 23:59:59 today
            'created_by'  => $user->id,
        ]);

        return redirect()->route('servicer.success');
    }

    public function success()
    {
        return Inertia::render('Servicer/Success');
    }
}
