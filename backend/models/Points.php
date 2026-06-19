<?php

declare(strict_types=1);

namespace App\Models;

class Points extends BaseModel
{
    public const ACCEPT_REQUEST = 10;
    public const COMPLETE_SESSION = 20;
    public const DAILY_LOGIN = 2;
    public const BADGE_BONUS = 50;

    public static function add(int $userId, int $points, string $action, ?string $description = null, ?int $refId = null, ?int $categoryId = null): void
    {
        User::addPoints($userId, $points);

        $stmt = self::db()->prepare(
            'INSERT INTO points_history (user_id, points, action, description, reference_id, category_id) VALUES (?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([$userId, $points, $action, $description, $refId, $categoryId]);

        if ($categoryId) {
            CertificateMilestone::addCategoryPoints($userId, $categoryId, $points);
            CertificateMilestone::checkAndAward($userId, $categoryId);
        }
    }

    public static function getHistory(int $userId, int $limit = 20): array
    {
        $stmt = self::db()->prepare(
            'SELECT * FROM points_history WHERE user_id = ? ORDER BY created_at DESC LIMIT ?'
        );
        $stmt->execute([$userId, $limit]);
        return $stmt->fetchAll();
    }

    public static function hasDailyLogin(int $userId): bool
    {
        $stmt = self::db()->prepare(
            'SELECT id FROM points_history WHERE user_id = ? AND action = "daily_login" AND DATE(created_at) = CURDATE()'
        );
        $stmt->execute([$userId]);
        return (bool) $stmt->fetch();
    }
}
