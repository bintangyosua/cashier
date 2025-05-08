<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::prefix('dashboard')->group(function () {
        Route::get('', function () {
            return Inertia::render('dashboard');
        })->name('dashboard');

        Route::prefix('categories')->group(function () {
            Route::get('', [CategoryController::class, 'index'])->name('categories.index');
        });

        Route::prefix('products')->group(function () {
            Route::resource('', ProductController::class);
        });
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
