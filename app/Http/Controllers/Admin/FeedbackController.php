<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Counter;
use App\Models\CounterUser;
use App\Models\Feedback;
use App\Models\FeedbackTag;
use Illuminate\Http\Request;

class FeedbackController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
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
    public function store(Request $request, Counter $counter)
    {
        
        $request->validate([
            'rating'      => 'required|integer|min:1|max:5',
            'comment'     => 'nullable|string|max:1000',
            'tagIds'      => 'nullable|array',
            'tagIds.*'    => 'integer|exists:tags,id',
        ]);

        // Get active assignment
        $assignment = CounterUser::where('counter_id', $counter->id)
            ->whereNull('end_time')
            ->latest('start_time')
            ->first();

        if (!$assignment) {
            return back()->withErrors([
                'error' => 'No active servicer at this counter.'
            ]);
        }

        // Create feedback
        $feedback = Feedback::create([
            'counter_id'             => $counter->id,
            'servicer_id'            => $assignment->servicer_id,
            'servicer_assignment_id' => $assignment->id,
            'rating'                 => $request->rating,
            'comment'                => $request->comment,
            'ip_address'             => $request->ip(),
            'user_agent'             => $request->userAgent(),
        ]);

        // Attach tags (clean way)
        if ($request->filled('tagIds')) {
            // Log::info('Attaching tags to feedback', ['feedback_id' => $feedback->id, 'tag_ids' => $request->tagIds]);
            foreach ($request->tagIds as $tagId) {
                FeedbackTag::create([
                    'feedback_id' => $feedback->id,
                    'tag_id' => $tagId,
                ]);
            }
        }

        return back()->with('success', 'Thank you for your feedback!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Feedback $feedback)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Feedback $feedback)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Feedback $feedback)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Feedback $feedback)
    {
        //
    }
}
