<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display the user management list.
     */
    public function index()
    {
        $users = User::select('id', 'name', 'email', 'role')
            ->latest()
            ->get();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
        ]);
    }

    /**
     * Store a new user.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users',
            'role'     => 'required|in:servicer,manager,admin,superadmin',
            'password' => ['required', Password::defaults()],
        ]);

        User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'role'     => $validated['role'],
            'password' => Hash::make($validated['password']),
        ]);

        return redirect()->route('admin.users.index')
            ->with('toast', ['type' => 'success', 'message' => 'User registered successfully!']);
    }

    /**
     * Update user details and optionally their password.
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'role'     => 'required|in:servicer,manager,admin,superadmin',
            'password' => ['nullable', Password::defaults()],
        ]);

        $user->fill([
            'name'  => $validated['name'],
            'email' => $validated['email'],
            'role'  => $validated['role'],
        ]);

        // Only update password if a new one was provided
        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return redirect()->route('admin.users.index')
            ->with('toast', ['type' => 'success', 'message' => 'User profile updated!']);
    }

    /**
     * Remove the user.
     */
    public function destroy(User $user)
    {
        // Prevent users from deleting themselves
        if (auth()->id() === $user->id) {
            return redirect()->back()
                ->with('toast', ['type' => 'error', 'message' => 'You cannot delete your own account!']);
        }

        $user->delete();

        return redirect()->route('admin.users.index')
            ->with('toast', ['type' => 'success', 'message' => 'User access revoked!']);
    }
}
