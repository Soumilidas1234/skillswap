<?php

declare(strict_types=1);

namespace App\Models;

class Category extends BaseModel
{
    public static function getAll(): array
    {
        return self::db()->query(
            'SELECT * FROM categories ORDER BY skill_count DESC, name ASC'
        )->fetchAll();
    }

    public static function findById(int $id): ?array
    {
        $stmt = self::db()->prepare('SELECT * FROM categories WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public static function findBySlug(string $slug): ?array
    {
        $stmt = self::db()->prepare('SELECT * FROM categories WHERE slug = ?');
        $stmt->execute([$slug]);
        return $stmt->fetch() ?: null;
    }

    public static function create(array $data): int
    {
        $stmt = self::db()->prepare(
            'INSERT INTO categories (name, slug, description, icon, color) VALUES (?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $data['name'],
            $data['slug'],
            $data['description'] ?? null,
            $data['icon'] ?? 'folder',
            $data['color'] ?? '#6366F1',
        ]);
        return (int) self::db()->lastInsertId();
    }

    public static function update(int $id, array $data): bool
    {
        $stmt = self::db()->prepare(
            'UPDATE categories SET name = ?, slug = ?, description = ?, icon = ?, color = ? WHERE id = ?'
        );
        return $stmt->execute([
            $data['name'],
            $data['slug'],
            $data['description'] ?? null,
            $data['icon'] ?? 'folder',
            $data['color'] ?? '#6366F1',
            $id,
        ]);
    }

    public static function delete(int $id): bool
    {
        return self::db()->prepare('DELETE FROM categories WHERE id = ? AND skill_count = 0')
            ->execute([$id]);
    }

    public static function getTop(int $limit = 5): array
    {
        $stmt = self::db()->prepare(
            'SELECT * FROM categories ORDER BY skill_count DESC LIMIT ?'
        );
        $stmt->execute([$limit]);
        return $stmt->fetchAll();
    }
}
