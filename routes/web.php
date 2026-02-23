<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ActivityController;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/view/{slug}', [\App\Http\Controllers\PublicPlannerController::class, 'show'])->name('public.view');

Route::get('/dashboard', [ActivityController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/activities', [ActivityController::class, 'index'])->name('activities.index');
    Route::post('/activities', [ActivityController::class, 'store'])->name('activities.store');
    Route::put('/activities/{activity}', [ActivityController::class, 'update'])->name('activities.update');
    Route::delete('/activities/{activity}', [ActivityController::class, 'destroy'])->name('activities.destroy');

    Route::post('/agendas', [\App\Http\Controllers\AgendaController::class, 'store'])->name('agendas.store');
    Route::put('/agendas/{id}', [\App\Http\Controllers\AgendaController::class, 'update'])->name('agendas.update');
    Route::delete('/agendas/{id}', [\App\Http\Controllers\AgendaController::class, 'destroy'])->name('agendas.destroy');
});

require __DIR__.'/auth.php';
