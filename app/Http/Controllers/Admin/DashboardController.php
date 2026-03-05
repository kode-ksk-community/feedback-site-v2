<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use App\Models\{Feedback, Branch, Counter, User, Tag, CounterUser};

class DashboardController extends Controller
{
    /**
     * Display a listing of the resource.
     * Optimized for minimal database round-trips.
     */
    public function index(Request $request)
    {
        // 1. Date Range Handling
        $start = $request->date_start ? Carbon::parse($request->date_start) : null;
        $end = $request->date_end ? Carbon::parse($request->date_end)->endOfDay() : null;

        if ($request->preset === 'daily') {
            $start = now()->startOfDay();
            $end = now();
        }
        if ($request->preset === 'weekly') {
            $start = now()->startOfWeek();
            $end = now();
        }
        if ($request->preset === 'monthly') {
            $start = now()->startOfMonth();
            $end = now();
        }
        if ($request->preset === 'yearly') {
            $start = now()->startOfYear();
            $end = now();
        }

        // 2. Base Query with Dynamic Scoping
        $query = Feedback::query()
            ->when($start, fn($q) => $q->where('submitted_at', '>=', $start))
            ->when($end, fn($q) => $q->where('submitted_at', '<=', $end))
            ->when($request->branch_id, function ($q) use ($request) {
                $q->whereHas('counter', fn($c) => $c->where('branch_id', $request->branch_id));
            })
            ->when($request->counter_id, fn($q) => $q->where('counter_id', $request->counter_id))
            ->when($request->servicer_id, fn($q) => $q->where('user_id', $request->servicer_id));

        $metrics = (clone $query)->selectRaw('COUNT(*) as total, AVG(rating) as average')->first();

        // 3. Servicer Ranking (filtered by date and location)
        $topServicers = User::where('role', 'servicer')
            ->withCount(['feedbacks' => function ($q) use ($start, $end) {
                $q->when($start, fn($s) => $s->where('submitted_at', '>=', $start))
                    ->when($end, fn($e) => $e->where('submitted_at', '<=', $end));
            }])
            ->withAvg(['feedbacks' => function ($q) use ($start, $end) {
                $q->when($start, fn($s) => $s->where('submitted_at', '>=', $start))
                    ->when($end, fn($e) => $e->where('submitted_at', '<=', $end));
            }], 'rating')
            ->orderByDesc('feedbacks_avg_rating')
            ->limit(5)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'totalFeedbacks' => (int) $metrics->total,
                'avgRating'      => round((float) $metrics->average, 1),
                'activeServicers' => CounterUser::whereNull('end_time')->count(),
            ],
            'recentComments' => (clone $query)->with('user:id,name')->latest()->limit(10)->get(),
            // 3. Recent Tags (Shared filter logic)
            $recentTags = Tag::whereHas('feedbacks', function ($q) use ($start, $end, $request) {
                $q->when($start, fn($sub) => $sub->where('submitted_at', '>=', $start))
                    ->when($end, fn($sub) => $sub->where('submitted_at', '<=', $end))
                    ->when($request->branch_id, function ($sub) use ($request) {
                        $sub->whereHas('counter', fn($c) => $c->where('branch_id', $request->branch_id));
                    })
                    ->when($request->counter_id, fn($sub) => $sub->where('counter_id', $request->counter_id))
                    ->when($request->servicer_id, fn($sub) => $sub->where('user_id', $request->servicer_id));
            })
                ->withCount(['feedbacks' => function ($q) use ($start, $end, $request) {
                    // We count only feedbacks that match the current filters
                    $q->when($start, fn($sub) => $sub->where('submitted_at', '>=', $start))
                        ->when($end, fn($sub) => $sub->where('submitted_at', '<=', $end))
                        ->when($request->branch_id, function ($sub) use ($request) {
                            $sub->whereHas('counter', fn($c) => $c->where('branch_id', $request->branch_id));
                        })
                        ->when($request->counter_id, fn($sub) => $sub->where('counter_id', $request->counter_id))
                        ->when($request->servicer_id, fn($sub) => $sub->where('user_id', $request->servicer_id));
                }])
                ->orderByDesc('feedbacks_count')
                ->limit(10)
                ->get(),
            'topServicers'   => $topServicers,
            'branches'       => Branch::all(['id', 'name']),
            'counters'       => Counter::when($request->branch_id, fn($q) => $q->where('branch_id', $request->branch_id))->get(['id', 'name']),
            'servicers'      => User::where('role', 'servicer')->get(['id', 'name']),
            'filters'        => $request->only(['date_start', 'date_end', 'preset', 'branch_id', 'counter_id', 'servicer_id']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
