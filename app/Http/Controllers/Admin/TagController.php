<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tag;
use Inertia\Inertia;
use Illuminate\Http\Request;

class TagController extends Controller
{
    /**
     * Display a listing of the tags.
     */
    public function index()
    {
        $tags = Tag::with('creator:id,full_name')
            ->latest()
            ->get();

        return Inertia::render('Admin/Tags/Index', [
            'tags' => $tags,
        ]);
    }

    /**
     * Store a newly created tag in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'  => 'required|string|max:100|unique:tags,name',
            'level' => 'required|integer|min:1|max:5',
        ]);

        Tag::create([
            'name'       => $validated['name'],
            'level'      => $validated['level'],
            'created_by' => auth()->id(),
        ]);

        return redirect()->route('admin.tags.index')
            ->with('toast', ['type' => 'success', 'message' => 'Tag created successfully!']);
    }

    /**
     * Update the specified tag in storage.
     */
    public function update(Request $request, Tag $tag)
    {
        $validated = $request->validate([
            'name'  => 'required|string|max:100|unique:tags,name,' . $tag->id,
            'level' => 'required|integer|min:1|max:5',
        ]);

        $tag->update($validated);

        return redirect()->route('admin.tags.index')
            ->with('toast', ['type' => 'success', 'message' => 'Tag updated successfully!']);
    }

    /**
     * Remove the specified tag from storage.
     */
    public function destroy(Tag $tag)
    {
        $tag->delete();

        return redirect()->route('admin.tags.index')
            ->with('toast', ['type' => 'success', 'message' => 'Tag deleted successfully!']);
    }
}