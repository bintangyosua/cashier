<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $products = Product::select('id', 'name', 'price', 'stock')->get();

        return Inertia::render('dashboard/transactions/pos', [
            'products' => $products,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'payment_method' => 'required|string|in:tunai,transfer,qris',
        ]);

        DB::commit(); // jika semua transaksi sukses

        DB::beginTransaction();

        try {
            $transaction = Transaction::create([
                'user_id' => auth()->id(),
                'total' => 0, // akan dihitung nanti
                'payment_method' => $validated['payment_method'],
                'status' => 'draft',
            ]);

            $total = 0;

            foreach ($validated['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);
                $subtotal = $product->price * $item['quantity'];
                $total += $subtotal;

                TransactionItem::create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'price' => $product->price,
                    'subtotal' => $subtotal,
                ]);

                // kurangi stok
                $product->decrement('stock', $item['quantity']);
            }

            $transaction->update(['total' => $total]);

            DB::commit();

            return redirect()->route('transactions.history')->with('success', 'Transaksi berhasil disimpan.');

        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors('Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    public function history()
    {
        $transactions = Transaction::with(['items.product'])
            ->where('user_id', auth()->id())
            ->latest()
            ->get();

        return Inertia::render('dashboard/transactions/history', [
            'transactions' => $transactions
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $transaction = Transaction::with('items.product')->findOrFail($id);

        return Inertia::render('dashboard/transactions/show', [
            'transaction' => $transaction
        ]);
    }

    public function update(Request $request, string $id)
    {
        $transaction = Transaction::with('items')->findOrFail($id);

        if ($transaction->status !== 'draft') {
            return back()->withErrors('Hanya transaksi berstatus draft yang dapat diperbarui.');
        }

        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'payment_method' => 'required|string|in:cash,transfer,qris',
        ]);

        DB::beginTransaction();

        try {
            // Kembalikan stok dari item sebelumnya
            foreach ($transaction->items as $item) {
                $item->product->increment('stock', $item->quantity);
                $item->delete();
            }

            $total = 0;
            foreach ($validated['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);
                $subtotal = $product->price * $item['quantity'];
                $total += $subtotal;

                TransactionItem::create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'price' => $product->price,
                    'subtotal' => $subtotal,
                ]);

                $product->decrement('stock', $item['quantity']);
            }

            $transaction->update([
                'total' => $total,
                'payment_method' => $validated['payment_method'],
            ]);

            DB::commit();

            return redirect()->route('transactions.history')->with('success', 'Transaksi berhasil diperbarui.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors('Terjadi kesalahan: ' . $e->getMessage());
        }
    }


    public function void(string $id)
    {
        $transaction = Transaction::with('items.product')->findOrFail($id);

        if ($transaction->status === 'voided') {
            return back()->withErrors('Transaksi sudah dibatalkan.');
        }

        if ($transaction->status !== 'draft' && $transaction->status !== 'paid') {
            return back()->withErrors('Transaksi tidak dapat dibatalkan.');
        }

        $transaction->status = 'voided';
        $transaction->save();

        // Kembalikan stok produk
        foreach ($transaction->items as $item) {
            $item->product->increment('stock', $item->quantity);
        }

        return redirect()->route('transactions.history')->with('success', 'Transaksi berhasil dibatalkan.');
    }


}
