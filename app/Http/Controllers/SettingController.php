<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Setting;

class SettingController extends Controller
{
    public function index()
    {
        $setting = Setting::first(); 

        return Inertia::render('dashboard/settings/index', [
            'setting' => $setting
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'store_name' => 'required|string|max:255',
            'store_email' => 'nullable|email',
            'store_phone' => 'nullable|string|max:20',
            'store_address' => 'nullable|string|max:255',
        ]);

        $setting = Setting::first();
        if (!$setting) {
            $setting = new Setting();
        }

        $setting->fill($validated);
        $setting->save();

        return redirect()->back()->with('success', 'Pengaturan berhasil disimpan.');
    }
}
