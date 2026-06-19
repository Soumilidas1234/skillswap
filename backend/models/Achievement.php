<?php

declare(strict_types=1);

namespace App\Models;

class Achievement extends BaseModel
{
    public static function getAll(): array
    {
        return self::db()->query('SELECT * FROM achievements ORDER BY min_points ASC')->fetchAll();
    }

    public static function getByUser(int $userId): array
    {
        $stmt = self::db()->prepare(
            'SELECT a.*, ua.unlocked_at FROM achievements a
             JOIN user_achievements ua ON a.id = ua.achievement_id
             WHERE ua.user_id = ? ORDER BY ua.unlocked_at DESC'
        );
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    public static function unlock(int $userId, int $achievementId): bool
    {
        try {
            $stmt = self::db()->prepare(
                'INSERT IGNORE INTO user_achievements (user_id, achievement_id) VALUES (?, ?)'
            );
            $result = $stmt->execute([$userId, $achievementId]);

            if ($stmt->rowCount() > 0) {
                Points::add($userId, Points::BADGE_BONUS, 'badge_bonus', 'Achievement unlocked bonus');
                $achievement = self::db()->prepare('SELECT name FROM achievements WHERE id = ?');
                $achievement->execute([$achievementId]);
                $name = $achievement->fetch()['name'] ?? 'Achievement';

                Notification::create(
                    $userId,
                    'achievement_unlocked',
                    'Achievement Unlocked!',
                    "Congratulations! You earned the {$name} badge.",
                    ['achievement_id' => $achievementId]
                );
            }

            return $result;
        } catch (\Exception) {
            return false;
        }
    }

    public static function checkAndUnlock(int $userId): void
    {
        $user = User::findById($userId);
        if (!$user) {
            return;
        }

        $stmt = self::db()->prepare(
            'SELECT COUNT(*) as c FROM requests WHERE teacher_id = ? AND status = "completed"'
        );
        $stmt->execute([$userId]);
        $completedSessions = (int) $stmt->fetch()['c'];

        $achievements = self::getAll();
        $unlocked = array_column(self::getByUser($userId), 'id');

        foreach ($achievements as $achievement) {
            if (in_array($achievement['id'], $unlocked, true)) {
                continue;
            }

            if ($user['points'] >= $achievement['min_points'] && $completedSessions >= $achievement['min_sessions']) {
                self::unlock($userId, (int) $achievement['id']);
            }
        }
    }
}
