<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Category;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;    

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        Product::factory(20)->create();
        Category::factory()->count(5)->create();
        User::factory()->count(5)->create();    

        User::create([
            'name' => 'Admin GetKasir',
            'email' => 'admin@getkasir.test',
            'password' => Hash::make('password123'),
        ]); 
    }
}
