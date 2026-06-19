<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Helpers\Response;
use App\Helpers\Sanitizer;
use App\Middleware\AuthMiddleware;
use App\Models\Category;

class CategoryController
{
    public function index(): void
    {
        Response::success(Category::getAll());
    }

    public function top(): void
    {
        Response::success(Category::getTop(8));
    }

    public function store(): void
    {
        AuthMiddleware::requireAdmin();
        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $id = Category::create([
            'name' => Sanitizer::string($input['name']),
            'slug' => Sanitizer::slug($input['name']),
            'description' => Sanitizer::stripHtml($input['description'] ?? ''),
            'icon' => Sanitizer::string($input['icon'] ?? 'folder'),
            'color' => Sanitizer::string($input['color'] ?? '#6366F1'),
        ]);

        Response::success(Category::findById($id), 'Category created', 201);
    }

    public function update(int $id): void
    {
        AuthMiddleware::requireAdmin();
        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        Category::update($id, [
            'name' => Sanitizer::string($input['name']),
            'slug' => Sanitizer::slug($input['name']),
            'description' => Sanitizer::stripHtml($input['description'] ?? ''),
            'icon' => Sanitizer::string($input['icon'] ?? 'folder'),
            'color' => Sanitizer::string($input['color'] ?? '#6366F1'),
        ]);

        Response::success(Category::findById($id), 'Category updated');
    }

    public function destroy(int $id): void
    {
        AuthMiddleware::requireAdmin();
        if (!Category::delete($id)) {
            Response::error('Cannot delete category with skills', 400);
        }
        Response::success(null, 'Category deleted');
    }
}
