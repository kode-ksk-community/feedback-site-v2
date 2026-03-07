<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display the user management list.
     */
    public function index(Request $request)
    {
        // 1. Start the query
        $query = User::query()->select('id', 'name', 'email', 'role', 'created_at');

        // 2. Apply Search Filter (Name or Email)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // 3. Apply Role Filter
        // We check if it's filled AND not the default 'all' string
        if ($request->filled('role') && $request->role !== 'all') {
            $query->where('role', $request->role);
        }

        // 4. Get results with latest at the top
        $users = $query->latest()->get();

        // 5. Return to Inertia
        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => $request->only(['search', 'role']),
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

    public function show(User $user, Request $request)
    {
        // 1. Setup Date Filters
        $query = $user->feedbacks()->with('tags');

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('created_at', [$request->start_date, $request->end_date]);
        } else {
            // Preset filters
            match ($request->preset) {
                'daily' => $query->whereDate('created_at', Carbon::today()),
                'weekly' => $query->whereBetween('created_at', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()]),
                'monthly' => $query->whereMonth('created_at', Carbon::now()->month),
                'yearly' => $query->whereYear('created_at', Carbon::now()->year),
                default => null,
            };
        }

        $feedbacks = $query->latest()->get();

        // 2. Calculate Stats for Charts
        $ratingPerformance = $feedbacks->groupBy('rating')->map->count();

        $tagPerformance = DB::table('feedback_tags')
            ->join('tags', 'feedback_tags.tag_id', '=', 'tags.id')
            ->whereIn('feedback_id', $feedbacks->pluck('id'))
            ->select('tags.name', DB::raw('count(*) as total'))
            ->groupBy('tags.name')
            ->get();

        return Inertia::render('Admin/Users/Show', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'created_at' => $user->created_at->format('F j, Y'),
            ],
            'feedbacks' => $feedbacks,
            'stats' => [
                'average_rating' => round($feedbacks->avg('rating'), 1),
                'total_reviews' => $feedbacks->count(),
                'rating_data' => $ratingPerformance, // { "5": 10, "4": 2 ... }
                'tag_data' => $tagPerformance,
            ],
            'filters' => $request->only(['preset', 'start_date', 'end_date']),
        ]);
    }
}
