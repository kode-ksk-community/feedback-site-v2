<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

/*****************************************************
 *                                                   *
 *         Console Routes for Artisan Commands        *
 *                                                   *
 *****************************************************/
Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('counter:deactivate-expired')->everyMinute();