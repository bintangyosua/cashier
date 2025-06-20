<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $start = $request->query('start_date', now()->startOfMonth()->toDateString());
        $end = $request->query('end_date', now()->endOfMonth()->toDateString());

        $transactions = Transaction::with('user')
            ->whereBetween('created_at', [$start, $end])
            ->where('status', 'completed')
            ->orderBy('created_at', 'desc')
            ->get();

        $totalIncome = $transactions->sum('total');
        $totalTransactions = $transactions->count();

        return Inertia::render('dashboard/reports/index', [
            'transactions' => $transactions,
            'totalIncome' => $totalIncome,
            'totalTransactions' => $totalTransactions,
            'startDate' => $start,
            'endDate' => $end,
        ]);
    }
}
