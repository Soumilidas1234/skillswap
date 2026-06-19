<?php

declare(strict_types=1);

namespace App\Models;

class Certificate extends BaseModel
{
    public static function create(array $data): int
    {
        $certId = 'SSA-' . strtoupper(bin2hex(random_bytes(6)));
        $qrData = json_encode([
            'id' => $certId,
            'type' => 'session',
            'learner' => $data['learner_name'],
            'skill' => $data['skill_name'],
            'date' => $data['completion_date'],
            'verify_url' => ($_ENV['APP_URL'] ?? '') . '/api/certificates/verify/' . $certId,
        ]);

        $stmt = self::db()->prepare(
            'INSERT INTO certificates (certificate_id, cert_type, request_id, learner_id, teacher_id, skill_id, skill_name, learner_name, teacher_name, completion_date, qr_data)
             VALUES (?, "session", ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $certId,
            $data['request_id'],
            $data['learner_id'],
            $data['teacher_id'],
            $data['skill_id'],
            $data['skill_name'],
            $data['learner_name'],
            $data['teacher_name'],
            $data['completion_date'],
            $qrData,
        ]);

        Notification::create(
            $data['learner_id'],
            'certificate_generated',
            'Certificate Generated!',
            "Your certificate for {$data['skill_name']} is ready to download.",
            ['certificate_id' => $certId]
        );

        return (int) self::db()->lastInsertId();
    }

    public static function createMilestone(int $userId, array $milestone, array $user): int
    {
        $certId = 'SSM-' . strtoupper(bin2hex(random_bytes(6)));
        $skillName = "{$milestone['category_name']} — {$milestone['name']} (Level {$milestone['level']})";
        $completionDate = date('Y-m-d');

        $qrData = json_encode([
            'id' => $certId,
            'type' => 'milestone',
            'learner' => $user['name'],
            'category' => $milestone['category_name'],
            'level' => $milestone['level'],
            'tier' => $milestone['tier'],
            'points' => $milestone['min_points'],
            'date' => $completionDate,
            'verify_url' => ($_ENV['APP_URL'] ?? '') . '/api/certificates/verify/' . $certId,
        ]);

        $stmt = self::db()->prepare(
            'INSERT INTO certificates (certificate_id, cert_type, learner_id, category_id, milestone_id, user_level, skill_name, learner_name, teacher_name, completion_date, qr_data)
             VALUES (?, "milestone", ?, ?, ?, ?, ?, ?, "SkillSwap Platform", ?, ?)'
        );
        $stmt->execute([
            $certId,
            $userId,
            $milestone['category_id'],
            $milestone['id'],
            $milestone['level'],
            $skillName,
            $user['name'],
            $completionDate,
            $qrData,
        ]);

        Notification::create(
            $userId,
            'milestone_certificate',
            'Milestone Certificate Earned!',
            "You earned the {$milestone['name']} certificate in {$milestone['category_name']} at {$milestone['min_points']} points!",
            ['certificate_id' => $certId, 'category_id' => $milestone['category_id']]
        );

        return (int) self::db()->lastInsertId();
    }

    public static function findByCertId(string $certId): ?array
    {
        $stmt = self::db()->prepare(
            'SELECT c.*, cat.name as category_name, m.tier as milestone_tier, m.level_min, m.level_max
             FROM certificates c
             LEFT JOIN categories cat ON c.category_id = cat.id
             LEFT JOIN certificate_milestones m ON c.milestone_id = m.id
             WHERE c.certificate_id = ?'
        );
        $stmt->execute([$certId]);
        $cert = $stmt->fetch();
        if ($cert && $cert['qr_data']) {
            $cert['qr_data'] = json_decode($cert['qr_data'], true);
        }
        return $cert ?: null;
    }

    public static function getByUser(int $userId): array
    {
        $stmt = self::db()->prepare(
            'SELECT c.*, cat.name as category_name, cat.slug as category_slug, cat.color as category_color,
                    m.tier as milestone_tier, m.level as milestone_level, m.min_points as milestone_points,
                    m.level_min, m.level_max
             FROM certificates c
             LEFT JOIN categories cat ON c.category_id = cat.id
             LEFT JOIN certificate_milestones m ON c.milestone_id = m.id
             WHERE c.learner_id = ? OR (c.teacher_id = ? AND c.cert_type = "session")
             ORDER BY c.created_at DESC'
        );
        $stmt->execute([$userId, $userId]);
        $items = $stmt->fetchAll();
        foreach ($items as &$item) {
            if ($item['qr_data']) {
                $item['qr_data'] = json_decode($item['qr_data'], true);
            }
        }
        return $items;
    }
}
