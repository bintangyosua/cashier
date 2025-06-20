<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TransactionItem;

class TransactionItemController extends Controller
{

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $item = TransactionItem::findOrFail($id);

        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $item->quantity = $validated['quantity'];
        $item->subtotal = $item->quantity * $item->price;
        $item->save();

        return back()->with('success', 'Item berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $item = TransactionItem::findOrFail($id);
        $item->delete();

        return back()->with('success', 'Item berhasil dihapus.');
    }
}
