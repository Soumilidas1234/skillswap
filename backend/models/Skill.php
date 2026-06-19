<?php

declare(strict_types=1);

namespace App\Models;

class Skill extends BaseModel
{
    public static function findById(int $id): ?array
    {
        $stmt = self::db()->prepare(
            'SELECT s.*, u.name as teacher_name, u.avatar as teacher_avatar, u.uuid as teacher_uuid,
                    c.name as category_name, c.slug as category_slug, c.icon as category_icon, c.color as category_color
             FROM skills s
             JOIN users u ON s.user_id = u.id
             JOIN categories c ON s.category_id = c.id
             WHERE s.id = ?'
        );
        $stmt->execute([$id]);
        $skill = $stmt->fetch();
        if ($skill && $skill['tags']) {
            $skill['tags'] = json_decode($skill['tags'], true);
        }
        return $skill ?: null;
    }

    public static function create(array $data): int
    {
        $stmt = self::db()->prepare(
            'INSERT INTO skills (user_id, category_id, title, slug, description, level, tags, thumbnail, availability, experience_years, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $data['user_id'],
            $data['category_id'],
            $data['title'],
            $data['slug'],
            $data['description'],
            $data['level'] ?? 'intermediate',
            json_encode($data['tags'] ?? []),
            $data['thumbnail'] ?? null,
            $data['availability'] ?? 'available',
            $data['experience_years'] ?? 0,
            $data['status'] ?? 'active',
        ]);

        $id = (int) self::db()->lastInsertId();
        self::db()->prepare('UPDATE categories SET skill_count = skill_count + 1 WHERE id = ?')
            ->execute([$data['category_id']]);
        self::db()->prepare('UPDATE site_stats SET stat_value = stat_value + 1 WHERE stat_key = "total_skills"')
            ->execute();

        return $id;
    }

    public static function update(int $id, int $userId, array $data): bool
    {
        $fields = [];
        $values = [];
        $allowed = ['category_id', 'title', 'slug', 'description', 'level', 'thumbnail', 'availability', 'experience_years', 'status'];

        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "{$field} = ?";
                $values[] = $field === 'tags' ? json_encode($data[$field]) : $data[$field];
            }
        }

        if (array_key_exists('tags', $data)) {
            $fields[] = 'tags = ?';
            $values[] = json_encode($data['tags']);
        }

        if (empty($fields)) {
            return false;
        }

        $values[] = $id;
        $values[] = $userId;
        $sql = 'UPDATE skills SET ' . implode(', ', $fields) . ' WHERE id = ? AND user_id = ?';
        return self::db()->prepare($sql)->execute($values);
    }

    public static function delete(int $id, int $userId): bool
    {
        $skill = self::findById($id);
        if (!$skill || (int) $skill['user_id'] !== $userId) {
            return false;
        }

        $result = self::db()->prepare('DELETE FROM skills WHERE id = ? AND user_id = ?')
            ->execute([$id, $userId]);

        if ($result) {
            self::db()->prepare('UPDATE categories SET skill_count = GREATEST(0, skill_count - 1) WHERE id = ?')
                ->execute([$skill['category_id']]);
        }

        return $result;
    }

    public static function browse(array $filters = [], int $page = 1, int $perPage = 12): array
    {
        $where = ['s.status = "active"'];
        $params = [];

        if (!empty($filters['category_id'])) {
            $where[] = 's.category_id = ?';
            $params[] = $filters['category_id'];
        }

        if (!empty($filters['search'])) {
            $where[] = '(s.title LIKE ? OR s.description LIKE ? OR u.name LIKE ?)';
            $search = '%' . $filters['search'] . '%';
            $params[] = $search;
            $params[] = $search;
            $params[] = $search;
        }

        if (!empty($filters['level'])) {
            $where[] = 's.level = ?';
            $params[] = $filters['level'];
        }

        if (!empty($filters['availability'])) {
            $where[] = 's.availability = ?';
            $params[] = $filters['availability'];
        }

        $whereClause = implode(' AND ', $where);
        $orderBy = match ($filters['sort'] ?? 'newest') {
            'popular' => 's.views DESC',
            'rating' => 's.rating DESC',
            'title' => 's.title ASC',
            default => 's.created_at DESC',
        };

        $offset = ($page - 1) * $perPage;

        $countSql = "SELECT COUNT(*) as total FROM skills s JOIN users u ON s.user_id = u.id WHERE {$whereClause}";
        $countStmt = self::db()->prepare($countSql);
        $countStmt->execute($params);
        $total = (int) $countStmt->fetch()['total'];

        $params[] = $perPage;
        $params[] = $offset;

        $sql = "SELECT s.*, u.name as teacher_name, u.avatar as teacher_avatar, u.uuid as teacher_uuid,
                       c.name as category_name, c.slug as category_slug, c.icon as category_icon
                FROM skills s
                JOIN users u ON s.user_id = u.id
                JOIN categories c ON s.category_id = c.id
                WHERE {$whereClause}
                ORDER BY {$orderBy}
                LIMIT ? OFFSET ?";

        $stmt = self::db()->prepare($sql);
        $stmt->execute($params);
        $items = $stmt->fetchAll();

        foreach ($items as &$item) {
            if ($item['tags']) {
                $item['tags'] = json_decode($item['tags'], true);
            }
        }

        return ['items' => $items, 'total' => $total];
    }

    public static function getByUser(int $userId): array
    {
        $stmt = self::db()->prepare(
            'SELECT s.*, c.name as category_name, c.slug as category_slug
             FROM skills s JOIN categories c ON s.category_id = c.id
             WHERE s.user_id = ? ORDER BY s.created_at DESC'
        );
        $stmt->execute([$userId]);
        $items = $stmt->fetchAll();
        foreach ($items as &$item) {
            if ($item['tags']) {
                $item['tags'] = json_decode($item['tags'], true);
            }
        }
        return $items;
    }

    public static function incrementViews(int $id): void
    {
        self::db()->prepare('UPDATE skills SET views = views + 1 WHERE id = ?')->execute([$id]);
    }

    public static function getPopular(int $limit = 8): array
    {
        $stmt = self::db()->prepare(
            'SELECT s.*, u.name as teacher_name, u.avatar as teacher_avatar,
                    c.name as category_name, c.slug as category_slug
             FROM skills s JOIN users u ON s.user_id = u.id JOIN categories c ON s.category_id = c.id
             WHERE s.status = "active" ORDER BY s.views DESC, s.request_count DESC LIMIT ?'
        );
        $stmt->execute([$limit]);
        return $stmt->fetchAll();
    }

    public static function count(): int
    {
        return (int) self::db()->query('SELECT COUNT(*) as c FROM skills WHERE status = "active"')->fetch()['c'];
    }

    public static function getAllAdmin(int $page = 1, int $perPage = 20): array
    {
        $offset = ($page - 1) * $perPage;
        $total = (int) self::db()->query('SELECT COUNT(*) as c FROM skills')->fetch()['c'];

        $stmt = self::db()->prepare(
            'SELECT s.*, u.name as teacher_name, c.name as category_name
             FROM skills s JOIN users u ON s.user_id = u.id JOIN categories c ON s.category_id = c.id
             ORDER BY s.created_at DESC LIMIT ? OFFSET ?'
        );
        $stmt->execute([$perPage, $offset]);

        return ['items' => $stmt->fetchAll(), 'total' => $total];
    }
}
