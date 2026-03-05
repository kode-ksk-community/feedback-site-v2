<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use Inertia\Inertia;
use Illuminate\Http\Request;

class BranchController extends Controller
{
    public function index()
    {
        $branches = Branch::latest()->get();   // add ->paginate(15) later if needed

        return Inertia::render('Admin/Branches/Index', [
            'branches' => $branches,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
            // 'contact_phone' => 'nullable|string|max:50',
        ]);

        Branch::create($validated);

        return redirect()->route('admin.branches.index')
            ->with('toast', 'Branch created successfully!');
    }

    public function update(Request $request, Branch $branch)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'contact_phone' => 'nullable|string|max:50',
        ]);

        $branch->update($validated);

        return redirect()->route('admin.branches.index')
            ->with('toast', 'Branch updated successfully!');
    }

    public function destroy(Branch $branch)
    {
        $branch->delete();

        return redirect()->route('admin.branches.index')
            ->with('toast', 'Branch deleted successfully!');
    }
}