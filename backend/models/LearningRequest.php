<?php

declare(strict_types=1);

namespace App\Models;

class LearningRequest extends BaseModel
{
    public static function create(array $data): int
    {
        $uuid = sprintf(
            '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );

        $stmt = self::db()->prepare(
            'INSERT INTO requests (uuid, skill_id, learner_id, teacher_id, message, preferred_timing)
             VALUES (?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $uuid,
            $data['skill_id'],
            $data['learner_id'],
            $data['teacher_id'],
            $data['message'],
            $data['preferred_timing'] ?? null,
        ]);

        self::db()->prepare('UPDATE skills SET request_count = request_count + 1 WHERE id = ?')
            ->execute([$data['skill_id']]);
        self::db()->prepare('UPDATE site_stats SET stat_value = stat_value + 1 WHERE stat_key = "total_requests"')
            ->execute();

        return (int) self::db()->lastInsertId();
    }

    public static function findById(int $id): ?array
    {
        $stmt = self::db()->prepare(
            'SELECT r.*, s.title as skill_title, s.thumbnail as skill_thumbnail, s.category_id,
                    cat.name as category_name,
                    learner.name as learner_name, learner.avatar as learner_avatar, learner.uuid as learner_uuid,
                    teacher.name as teacher_name, teacher.avatar as teacher_avatar, teacher.uuid as teacher_uuid
             FROM requests r
             JOIN skills s ON r.skill_id = s.id
             JOIN categories cat ON s.category_id = cat.id
             JOIN users learner ON r.learner_id = learner.id
             JOIN users teacher ON r.teacher_id = teacher.id
             WHERE r.id = ?'
        );
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public static function getByLearner(int $userId, ?string $status = null): array
    {
        $sql = 'SELECT r.*, s.title as skill_title, s.thumbnail as skill_thumbnail,
                       teacher.name as teacher_name, teacher.avatar as teacher_avatar
                FROM requests r
                JOIN skills s ON r.skill_id = s.id
                JOIN users teacher ON r.teacher_id = teacher.id
                WHERE r.learner_id = ?';
        $params = [$userId];

        if ($status) {
            $sql .= ' AND r.status = ?';
            $params[] = $status;
        }

        $sql .= ' ORDER BY r.created_at DESC';
        $stmt = self::db()->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public static function getByTeacher(int $userId, ?string $status = null): array
    {
        $sql = 'SELECT r.*, s.title as skill_title, s.thumbnail as skill_thumbnail,
                       learner.name as learner_name, learner.avatar as learner_avatar, learner.uuid as learner_uuid
                FROM requests r
                JOIN skills s ON r.skill_id = s.id
                JOIN users learner ON r.learner_id = learner.id
                WHERE r.teacher_id = ?';
        $params = [$userId];

        if ($status) {
            $sql .= ' AND r.status = ?';
            $params[] = $status;
        }

        $sql .= ' ORDER BY r.created_at DESC';
        $stmt = self::db()->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public static function updateStatus(int $id, string $status, ?string $response = null): bool
    {
        $completed = $status === 'completed' ? ', completed_at = NOW()' : '';
        $sql = "UPDATE requests SET status = ?, teacher_response = ?{$completed} WHERE id = ?";
        return self::db()->prepare($sql)->execute([$status, $response, $id]);
    }

    public static function countByStatus(string $status): int
    {
        $stmt = self::db()->prepare('SELECT COUNT(*) as c FROM requests WHERE status = ?');
        $stmt->execute([$status]);
        return (int) $stmt->fetch()['c'];
    }

    public static function getAllAdmin(int $page = 1, int $perPage = 20): array
    {
        $offset = ($page - 1) * $perPage;
        $total = (int) self::db()->query('SELECT COUNT(*) as c FROM requests')->fetch()['c'];

        $stmt = self::db()->prepare(
            'SELECT r.*, s.title as skill_title, learner.name as learner_name, teacher.name as teacher_name
             FROM requests r
             JOIN skills s ON r.skill_id = s.id
             JOIN users learner ON r.learner_id = learner.id
             JOIN users teacher ON r.teacher_id = teacher.id
             ORDER BY r.created_at DESC LIMIT ? OFFSET ?'
        );
        $stmt->execute([$perPage, $offset]);

        return ['items' => $stmt->fetchAll(), 'total' => $total];
    }

    public static function countIncoming(int $userId): int
    {
        $stmt = self::db()->prepare(
            'SELECT COUNT(*) as c FROM requests WHERE teacher_id = ? AND status = "pending"'
        );
        $stmt->execute([$userId]);
        return (int) $stmt->fetch()['c'];
    }

    public static function countOutgoing(int $userId): int
    {
        $stmt = self::db()->prepare(
            'SELECT COUNT(*) as c FROM requests WHERE learner_id = ? AND status = "pending"'
        );
        $stmt->execute([$userId]);
        return (int) $stmt->fetch()['c'];
    }
}
