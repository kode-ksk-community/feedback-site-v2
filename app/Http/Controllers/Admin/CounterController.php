<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Counter;
use App\Models\Branch;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use BaconQrCode\Writer;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\Image\Png;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Renderer\Image\ImagickImageBackEnd;
use BaconQrCode\Renderer\Image\GDImageBackEnd;

class CounterController extends Controller
{
    public function index()
    {
        $counters = Counter::with('branch:id,name')
            ->latest()
            ->get();

        $branches = Branch::all(['id', 'name']);

        return Inertia::render('Admin/Counters/Index', [
            'counters' => $counters,
            'branches' => $branches,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'name'      => 'required|string|max:255',
            'pin'       => 'required|digits:6',
            'is_active' => 'boolean',
        ]);

        $counter = Counter::create($validated);

        $this->generateFixedQR($counter);

        return redirect()->route('admin.counters.index')
            ->with('toast', ['type' => 'success', 'message' => 'Counter created! PIN: ' . $request->pin]);
    }

    public function update(Request $request, Counter $counter)
    {
        $validated = $request->validate([
            'branch_id'  => 'required|exists:branches,id',
            'name'       => 'required|string|max:255',
            'is_active'  => 'boolean',
            'pin'        => 'nullable|digits:6',
            'change_pin' => 'boolean',
        ]);

        if ($request->change_pin && $request->filled('pin')) {
            $counter->pin = $request->pin;   // mutator will hash it
        }

        $counter->update($validated);

        $this->generateFixedQR($counter);

        return redirect()->route('admin.counters.index')
            ->with('toast', ['type' => 'success', 'message' => 'Counter updated!']);
    }

    public function regeneratePin(Counter $counter)
    {
        $newPin = str_pad(random_int(100000, 999999), 6, '0');
        $counter->pin = $newPin;   // mutator hashes it
        $counter->save();

        return back()->with('toast', [
            'type' => 'success',
            'message' => "New PIN generated for {$counter->name}: <strong>{$newPin}</strong>"
        ]);
    }
    private function generateFixedQR(Counter $counter)
    {
        $token = $counter->fixed_qr_token ?? Str::random(32);

        // $qrUrl = route('service.start', [
        //     'counter_id' => $counter->id,
        //     'token' => $token
        // ]);

        // $directory = storage_path('app/public/qr-codes');
        // $filePath  = $directory . "/counter-{$counter->id}.png";

        // if (!file_exists($directory)) {
        //     mkdir($directory, 0755, true);
        // }

        // $renderer = new ImageRenderer(
        //     new RendererStyle(500),
        //     new GDImageBackEnd()
        // );

        // $writer = new Writer($renderer);

        // file_put_contents($filePath, $writer->writeString($qrUrl));

        $counter->update([
            'fixed_qr_token' => $token,
        ]);
    }
    // private function generateFixedQR(Counter $counter)
    // {
    //     $token = $counter->fixed_qr_token ?? Str::random(32);
    //     // $qrUrl = route('servicer.start', ['counter_id' => $counter->id, 'token' => $token]);

    //     $path = "qr-codes/counter-{$counter->id}.png";
    //     QrCode::format('png')->size(500)->generate($qrUrl, storage_path("app/public/{$path}"));

    //     $counter->update([
    //         'fixed_qr_token' => $token,
    //         // you can add qr_path column if you want
    //     ]);
    // }
}
