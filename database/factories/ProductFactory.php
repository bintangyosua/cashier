<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'sku' => fake()->numberBetween(10000, 99999),
            'price' => fake()->numberBetween(5, 50) * 10000,
            'stock' => fake()->numberBetween(10, 50),
            'category_id' => Category::inRandomOrder()->value('id'),
        ];
    }
}
