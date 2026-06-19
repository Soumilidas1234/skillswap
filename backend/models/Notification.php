<?php

declare(strict_types=1);

namespace App\Models;

class Notification extends BaseModel
{
    public static function create(int $userId, string $type, string $title, string $message, ?array $data = null): int
    {
        $stmt = self::db()->prepare(
            'INSERT INTO notifications (user_id, type, title, message, data) VALUES (?, ?, ?, ?, ?)'
        );
        $stmt->execute([$userId, $type, $title, $message, $data ? json_encode($data) : null]);
        return (int) self::db()->lastInsertId();
    }

    public static function getByUser(int $userId, int $page = 1, int $perPage = 20): array
    {
        $offset = ($page - 1) * $perPage;

        $countStmt = self::db()->prepare('SELECT COUNT(*) as total FROM notifications WHERE user_id = ?');
        $countStmt->execute([$userId]);
        $total = (int) $countStmt->fetch()['total'];

        $stmt = self::db()->prepare(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?'
        );
        $stmt->execute([$userId, $perPage, $offset]);
        $items = $stmt->fetchAll();

        foreach ($items as &$item) {
            if ($item['data']) {
                $item['data'] = json_decode($item['data'], true);
            }
        }

        return ['items' => $items, 'total' => $total];
    }

    public static function markAsRead(int $id, int $userId): bool
    {
        return self::db()->prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?')
            ->execute([$id, $userId]);
    }

    public static function markAllAsRead(int $userId): bool
    {
        return self::db()->prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0')
            ->execute([$userId]);
    }

    public static function getUnreadCount(int $userId): int
    {
        $stmt = self::db()->prepare(
            'SELECT COUNT(*) as c FROM notifications WHERE user_id = ? AND is_read = 0'
        );
        $stmt->execute([$userId]);
        return (int) $stmt->fetch()['c'];
    }
}
