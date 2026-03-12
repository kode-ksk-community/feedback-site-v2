<?php

use App\Http\Controllers\Admin\BranchController;
use App\Http\Controllers\Admin\CounterController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\FeedbackController;
use App\Http\Controllers\Admin\SystemSettingController;
use App\Http\Controllers\Admin\TagController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Client\ServicerController;
use App\Http\Controllers\Client\TerminalController;
use Illuminate\Support\Facades\Route;

Route::get('/', [TerminalController::class, 'activate'])->name('home');
Route::post('/verify-pin', [TerminalController::class, 'verifyPin'])->name('client.verify-pin');
Route::get('/feedback/{counter}', [TerminalController::class, 'feedback'])->name('client.feedback');
Route::post('/feedback/{counter}', [FeedbackController::class, 'store'])->name('feedback.store');
Route::get('/counter/check-user/{id}', [FeedbackController::class, 'checkUserStatus'])
    ->name('client.check-user');

Route::prefix('servicer')->group(function () {
    Route::get('/start', [ServicerController::class, 'start'])->name('servicer.start');
    Route::post('/login', [ServicerController::class, 'login'])->name('servicer.login');
    Route::post('/logout', [ServicerController::class, 'logout'])->name('servicer.logout');
    Route::get('/success', [ServicerController::class, 'success'])->name('servicer.success');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('dashboard', DashboardController::class)->names('dashboard');
    // ========================================================
    //              Administrator
    // ========================================================
    Route::prefix('admin')
        ->as('admin.')
        ->middleware([
            'auth',
            'can:access-admin-page'
        ])
        ->group(function () {
            Route::resource('branches', BranchController::class)->names('branches');
            Route::resource('counters', CounterController::class)->names('counters');
            Route::resource('tags', TagController::class)->names('tags');
            Route::resource('users', UserController::class)->names('users');
        });

    Route::prefix('superadmin')
        ->as('superadmin.')
        ->middleware([
            'auth',
            'can:access-superadmin-page'
        ])
        ->group(function () {
            Route::resource('settings', SystemSettingController::class)->names('settings');
        });
});

require __DIR__ . '/settings.php';
