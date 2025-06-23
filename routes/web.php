<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\TransactionItemController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\ReportController;
use App\Models\Transaction;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::prefix('dashboard')->group(function () {
        Route::get('', [DashboardController::class, 'index'])->name('dashboard');

        Route::prefix('categories')->group(function () {
            Route::get('', [CategoryController::class, 'index'])->name('categories.index');
            Route::get('create', [CategoryController::class, 'create'])->name('categories.create');
            Route::post('', [CategoryController::class, 'store'])->name('categories.store');
            Route::get('{category}/edit', [CategoryController::class, 'edit'])->name('categories.edit');
            Route::get('{category}', [CategoryController::class, 'show'])->name('categories.show'); 
            Route::put('{category}', [CategoryController::class, 'update'])->name('categories.update');
            Route::delete('{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');
        });

        Route::prefix('products')->group(function () {
            Route::get('', [ProductController::class, 'index'])->name('products.index');
            Route::get('create', [ProductController::class, 'create'])->name('products.create');
            Route::post('', [ProductController::class, 'store'])->name('products.store');
            Route::get('{product}', [ProductController::class, 'show'])->name('products.show'); 
            Route::get('{product}/edit', [ProductController::class, 'edit'])->name('products.edit');
            Route::put('{product}', [ProductController::class, 'update'])->name('products.update');
            Route::delete('{product}', [ProductController::class, 'destroy'])->name('products.destroy');
        });

        Route::prefix('transactions')->group(function () {
            Route::get('', [TransactionController::class, 'index'])->name('transactions.index'); 
            Route::post('', [TransactionController::class, 'store'])->name('transactions.store'); 
            Route::get('history', [TransactionController::class, 'history'])->name('transactions.history'); 
            Route::put('/transactions/{id}/void', [TransactionController::class, 'void'])->name('transactions.void');
        });
        
        Route::resource('users', UserController::class);

        Route::prefix('settings')->group(function () {
            Route::get('', [SettingController::class, 'index'])->name('settings.index');
            Route::put('', [SettingController::class, 'update'])->name('settings.update');
        });

        Route::prefix('transactions/items')->group(function () {
            Route::put('{id}', [TransactionItemController::class, 'update'])->name('transaction-items.update');
            Route::delete('{id}', [TransactionItemController::class, 'destroy'])->name('transaction-items.destroy');
        });

        Route::prefix('reports')->group(function () {
            Route::get('', [ReportController::class, 'index'])->name('reports.index');
        });
         
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
