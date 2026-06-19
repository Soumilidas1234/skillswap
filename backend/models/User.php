<?php

declare(strict_types=1);

namespace App\Models;

class User extends BaseModel
{
    public static function findById(int $id): ?array
    {
        $stmt = self::db()->prepare('SELECT * FROM users WHERE id = ?');
        $stmt->execute([$id]);
        $user = $stmt->fetch();
        return $user ? self::sanitize($user) : null;
    }

    public static function findByEmail(string $email): ?array
    {
        $stmt = self::db()->prepare('SELECT * FROM users WHERE email = ?');
        $stmt->execute([$email]);
        return $stmt->fetch() ?: null;
    }

    public static function findByUuid(string $uuid): ?array
    {
        $stmt = self::db()->prepare('SELECT * FROM users WHERE uuid = ?');
        $stmt->execute([$uuid]);
        $user = $stmt->fetch();
        return $user ? self::sanitize($user) : null;
    }

    public static function create(array $data): int
    {
        $uuid = $data['uuid'] ?? self::generateUuid();
        $stmt = self::db()->prepare(
            'INSERT INTO users (uuid, name, email, password, role) VALUES (?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $uuid,
            $data['name'],
            $data['email'],
            $data['password'],
            $data['role'] ?? 'user',
        ]);
        return (int) self::db()->lastInsertId();
    }

    public static function update(int $id, array $data): bool
    {
        $fields = [];
        $values = [];
        $allowed = ['name', 'bio', 'location', 'website', 'twitter', 'linkedin', 'github', 'avatar'];

        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "{$field} = ?";
                $values[] = $data[$field];
            }
        }

        if (empty($fields)) {
            return false;
        }

        $values[] = $id;
        $sql = 'UPDATE users SET ' . implode(', ', $fields) . ' WHERE id = ?';
        return self::db()->prepare($sql)->execute($values);
    }

    public static function updatePassword(int $id, string $hash): bool
    {
        return self::db()->prepare('UPDATE users SET password = ? WHERE id = ?')
            ->execute([$hash, $id]);
    }

    public static function addPoints(int $id, int $points): void
    {
        self::db()->prepare('UPDATE users SET points = points + ? WHERE id = ?')
            ->execute([$points, $id]);
    }

    public static function updateLastLogin(int $id): void
    {
        self::db()->prepare('UPDATE users SET last_login_at = NOW() WHERE id = ?')
            ->execute([$id]);
    }

    public static function getLeaderboard(int $limit = 100): array
    {
        $stmt = self::db()->prepare(
            'SELECT id, uuid, name, avatar, points, role FROM users 
             WHERE is_suspended = 0 AND role = "user" 
             ORDER BY points DESC LIMIT ?'
        );
        $stmt->execute([$limit]);
        return $stmt->fetchAll();
    }

    public static function getRank(int $userId): int
    {
        $stmt = self::db()->prepare(
            'SELECT COUNT(*) + 1 AS user_rank FROM users 
             WHERE points > (SELECT points FROM users WHERE id = ?) AND is_suspended = 0'
        );
        $stmt->execute([$userId]);
        return (int) ($stmt->fetch()['user_rank'] ?? 1);
    }

    public static function getAll(int $page = 1, int $perPage = 20, ?string $search = null): array
    {
        $offset = ($page - 1) * $perPage;
        $params = [];
        $where = 'WHERE 1=1';

        if ($search) {
            $where .= ' AND (name LIKE ? OR email LIKE ?)';
            $params[] = "%{$search}%";
            $params[] = "%{$search}%";
        }

        $countStmt = self::db()->prepare("SELECT COUNT(*) as total FROM users {$where}");
        $countStmt->execute($params);
        $total = (int) $countStmt->fetch()['total'];

        $params[] = $perPage;
        $params[] = $offset;
        $stmt = self::db()->prepare(
            "SELECT id, uuid, name, email, role, avatar, points, is_suspended, is_verified, created_at 
             FROM users {$where} ORDER BY created_at DESC LIMIT ? OFFSET ?"
        );
        $stmt->execute($params);

        return ['items' => $stmt->fetchAll(), 'total' => $total];
    }

    public static function suspend(int $id, bool $suspend = true): bool
    {
        return self::db()->prepare('UPDATE users SET is_suspended = ? WHERE id = ?')
            ->execute([$suspend ? 1 : 0, $id]);
    }

    public static function delete(int $id): bool
    {
        return self::db()->prepare('DELETE FROM users WHERE id = ? AND role != "admin"')
            ->execute([$id]);
    }

    public static function count(): int
    {
        return (int) self::db()->query('SELECT COUNT(*) as c FROM users')->fetch()['c'];
    }

    private static function sanitize(array $user): array
    {
        unset($user['password'], $user['remember_token']);
        return $user;
    }

    private static function generateUuid(): string
    {
        return sprintf(
            '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }
}
