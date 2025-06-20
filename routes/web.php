<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\TransactionController;
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
            Route::get('{product}', [ProductController::class, 'show'])->name('products.show'); // optional
            Route::get('{product}/edit', [ProductController::class, 'edit'])->name('products.edit');
            Route::put('{product}', [ProductController::class, 'update'])->name('products.update');
            Route::delete('{product}', [ProductController::class, 'destroy'])->name('products.destroy');
        });

        Route::prefix('transactions')->group(function () {
            Route::get('', [TransactionController::class, 'index'])->name('transactions.index'); // POS
            Route::post('', [TransactionController::class, 'store'])->name('transactions.store'); // simpan transaksi
            Route::get('history', [TransactionController::class, 'history'])->name('transactions.history'); // riwayat transaksi
        });
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
