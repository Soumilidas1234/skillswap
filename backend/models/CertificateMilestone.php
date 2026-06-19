<?php

declare(strict_types=1);

namespace App\Models;

class CertificateMilestone extends BaseModel
{
    public static function getAll(): array
    {
        return self::db()->query(
            'SELECT m.*, c.name as category_name, c.slug as category_slug, c.color as category_color
             FROM certificate_milestones m
             JOIN categories c ON m.category_id = c.id
             ORDER BY c.name ASC, m.min_points ASC'
        )->fetchAll();
    }

    public static function getByCategory(int $categoryId): array
    {
        $stmt = self::db()->prepare(
            'SELECT m.*, c.name as category_name, c.slug as category_slug
             FROM certificate_milestones m
             JOIN categories c ON m.category_id = c.id
             WHERE m.category_id = ? ORDER BY m.min_points ASC'
        );
        $stmt->execute([$categoryId]);
        return $stmt->fetchAll();
    }

    public static function addCategoryPoints(int $userId, int $categoryId, int $points): void
    {
        $stmt = self::db()->prepare(
            'INSERT INTO user_category_points (user_id, category_id, points) VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE points = points + VALUES(points)'
        );
        $stmt->execute([$userId, $categoryId, $points]);
    }

    public static function getCategoryPoints(int $userId, int $categoryId): int
    {
        $stmt = self::db()->prepare(
            'SELECT points FROM user_category_points WHERE user_id = ? AND category_id = ?'
        );
        $stmt->execute([$userId, $categoryId]);
        return (int) ($stmt->fetch()['points'] ?? 0);
    }

    public static function getUserCategoryPoints(int $userId): array
    {
        $stmt = self::db()->prepare(
            'SELECT ucp.*, c.name as category_name, c.slug as category_slug, c.color as category_color
             FROM user_category_points ucp
             JOIN categories c ON ucp.category_id = c.id
             WHERE ucp.user_id = ? ORDER BY ucp.points DESC'
        );
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    public static function checkAndAward(int $userId, int $categoryId): void
    {
        $categoryPoints = self::getCategoryPoints($userId, $categoryId);
        if ($categoryPoints < 10) {
            return;
        }

        $stmt = self::db()->prepare(
            'SELECT m.*, c.name as category_name FROM certificate_milestones m
             JOIN categories c ON m.category_id = c.id
             WHERE m.category_id = ? AND m.min_points <= ?
             ORDER BY m.min_points ASC'
        );
        $stmt->execute([$categoryId, $categoryPoints]);
        $milestones = $stmt->fetchAll();

        $user = User::findById($userId);
        if (!$user) {
            return;
        }

        foreach ($milestones as $milestone) {
            if (self::hasEarned($userId, (int) $milestone['id'])) {
                continue;
            }
            Certificate::createMilestone($userId, $milestone, $user);
        }
    }

    public static function syncCategoryPointsFromHistory(int $userId): void
    {
        $db = self::db();

        $db->prepare(
            'UPDATE points_history ph
             JOIN requests r ON ph.reference_id = r.id
             JOIN skills s ON r.skill_id = s.id
             SET ph.category_id = s.category_id
             WHERE ph.user_id = ? AND ph.category_id IS NULL
             AND ph.action IN ("accept_request", "complete_session", "learn_complete")'
        )->execute([$userId]);

        $stmt = $db->prepare(
            'SELECT category_id, SUM(points) as total FROM points_history
             WHERE user_id = ? AND category_id IS NOT NULL
             GROUP BY category_id'
        );
        $stmt->execute([$userId]);

        foreach ($stmt->fetchAll() as $row) {
            $db->prepare(
                'INSERT INTO user_category_points (user_id, category_id, points) VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE points = VALUES(points)'
            )->execute([$userId, (int) $row['category_id'], (int) $row['total']]);
        }
    }

    public static function checkAllCategories(int $userId): void
    {
        self::syncCategoryPointsFromHistory($userId);

        $stmt = self::db()->prepare(
            'SELECT DISTINCT category_id FROM (
                SELECT category_id FROM user_category_points WHERE user_id = ?
                UNION
                SELECT category_id FROM skills WHERE user_id = ? AND status != "archived"
            ) AS cats'
        );
        $stmt->execute([$userId, $userId]);

        foreach ($stmt->fetchAll() as $row) {
            self::checkAndAward($userId, (int) $row['category_id']);
        }
    }

    private static function hasEarned(int $userId, int $milestoneId): bool
    {
        $stmt = self::db()->prepare(
            'SELECT id FROM certificates WHERE learner_id = ? AND milestone_id = ? AND cert_type = "milestone"'
        );
        $stmt->execute([$userId, $milestoneId]);
        return (bool) $stmt->fetch();
    }
}
