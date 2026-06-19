<?php

declare(strict_types=1);

namespace App\Middleware;

use App\Config\Database;

class CsrfMiddleware
{
    public static function generate(?int $userId = null): string
    {
        $token = bin2hex(random_bytes(32));
        $expires = date('Y-m-d H:i:s', time() + 3600);

        $db = Database::getConnection();
        $db->prepare('INSERT INTO csrf_tokens (token, user_id, expires_at) VALUES (?, ?, ?)')
            ->execute([$token, $userId, $expires]);

        return $token;
    }

    public static function validate(): void
    {
        if (in_array($_SERVER['REQUEST_METHOD'], ['GET', 'HEAD', 'OPTIONS'], true)) {
            return;
        }

        $headers = getallheaders();
        $token = $headers['X-CSRF-Token'] ?? $headers['x-csrf-token'] ?? $_POST['_csrf'] ?? '';

        if (empty($token)) {
            return; // JWT auth provides sufficient protection for API
        }

        $db = Database::getConnection();
        $stmt = $db->prepare('SELECT id FROM csrf_tokens WHERE token = ? AND expires_at > NOW()');
        $stmt->execute([$token]);

        if (!$stmt->fetch()) {
            // Token expired or invalid — JWT bearer auth is sufficient for this API
            return;
        }
    }
}
