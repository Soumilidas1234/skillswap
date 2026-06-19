<?php

declare(strict_types=1);

namespace App\Models;

class ActivityLog extends BaseModel
{
    public static function log(?int $userId, string $action, ?string $entityType = null, ?int $entityId = null, ?array $metadata = null): void
    {
        $stmt = self::db()->prepare(
            'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, ip_address, user_agent, metadata)
             VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $userId,
            $action,
            $entityType,
            $entityId,
            $_SERVER['REMOTE_ADDR'] ?? null,
            substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 500),
            $metadata ? json_encode($metadata) : null,
        ]);
    }

    public static function getRecent(int $limit = 20): array
    {
        $stmt = self::db()->prepare(
            'SELECT al.*, u.name as user_name, u.avatar as user_avatar
             FROM activity_logs al LEFT JOIN users u ON al.user_id = u.id
             ORDER BY al.created_at DESC LIMIT ?'
        );
        $stmt->execute([$limit]);
        return $stmt->fetchAll();
    }

    public static function getByUser(int $userId, int $limit = 20): array
    {
        $stmt = self::db()->prepare(
            'SELECT * FROM activity_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?'
        );
        $stmt->execute([$userId, $limit]);
        return $stmt->fetchAll();
    }
}
