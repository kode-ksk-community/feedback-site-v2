<?php

namespace App\Console\Commands;

use App\Models\CounterUser;
use Illuminate\Console\Command;

class DeactivateExpiredCounterUsers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:deactivate-expired-counter-users';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        CounterUser::where('is_active', true)
        ->where('expires_at', '<=', now())
        ->update([
            'is_active' => false,
            'end_time' => now()
        ]);
    }
}
