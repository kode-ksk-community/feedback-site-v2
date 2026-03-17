<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Counter;
use App\Models\CounterUser;
use App\Models\Feedback;
use App\Models\Tag;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {

        if (Auth::user()->role === 'servicer') {
            if ($counterUser = CounterUser::with('counter')->where('user_id', Auth::id())->where('is_active', true)->first()) {
                // return redirect()->route('dashboard.index');
                return Inertia::render('Servicer/Dashboard' , compact('counterUser'));
            }
        }

        // 1. Fast Date Range Handling using match()
        $start = match ($request->preset) {
            'daily'   => now()->startOfDay(),
            'weekly'  => now()->startOfWeek(),
            'monthly' => now()->startOfMonth(),
            'yearly'  => now()->startOfYear(),
            default   => $request->date_start ? Carbon::parse($request->date_start) : null,
        };

        $end = match ($request->preset) {
            'daily', 'weekly', 'monthly', 'yearly' => now(),
            default => $request->date_end ? Carbon::parse($request->date_end)->endOfDay() : null,
        };

        // 2. DRY Filter Scope (Massive Performance Boost & Table Prefixing)
        $applyFilters = function ($query) use ($start, $end, $request) {
            // Dynamically get the table name to prevent ambiguous column errors during JOINs
            $table = $query->getModel()->getTable();

            $query->when($start, fn($q) => $q->where("$table.created_at", '>=', $start))
                ->when($end, fn($q) => $q->where("$table.created_at", '<=', $end))
                ->when($request->branch_id, fn($q) => $q->whereHas('counter', fn($c) => $c->where('branch_id', $request->branch_id)))
                ->when($request->counter_id, fn($q) => $q->where('counter_id', $request->counter_id))
                ->when($request->servicer_id, fn($q) => $q->where('user_id', $request->servicer_id));
        };

        // 3. Base Query & Metrics
        $feedbackQuery = Feedback::query()->tap($applyFilters);
        $metrics = (clone $feedbackQuery)->selectRaw('COUNT(id) as total, COALESCE(AVG(rating), 0) as average')->first();
        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'totalFeedbacks'  => (int) $metrics->total,
                'avgRating'       => round((float) $metrics->average, 1),
                'activeServicers' => CounterUser::whereNull('end_time')->where('is_active', true)->count(),
            ],

            // Eager load only required columns
            'recentComments' => (clone $feedbackQuery)
                ->with('user:id,name')
                ->whereNotNull('comment') // UX: Don't send empty comments to UI
                ->latest()
                ->limit(10)
                ->get(['id', 'user_id', 'rating', 'comment', 'created_at']),

            'recentTags' => Tag::whereHas('feedbacks', $applyFilters)
                ->withCount(['feedbacks' => $applyFilters])
                ->orderByDesc('feedbacks_count')
                ->limit(10)
                ->get(['id', 'name']), // Column pruning

            'topServicers' => User::where('role', 'servicer')
                ->withCount(['feedbacks' => $applyFilters])
                ->withAvg(['feedbacks' => $applyFilters], 'rating')
                ->orderByDesc('feedbacks_avg_rating')
                ->limit(5)
                ->get(['id', 'name']), // Column pruning

            // Dropdown Data
            'branches'  => Branch::all(['id', 'name']),
            'counters'  => Counter::when($request->branch_id, fn($q) => $q->where('branch_id', $request->branch_id))->get(['id', 'name']),
            'servicers' => User::where('role', 'servicer')->get(['id', 'name']),
            'filters'   => $request->only(['date_start', 'date_end', 'preset', 'branch_id', 'counter_id', 'servicer_id']),
        ]);
    }
}
