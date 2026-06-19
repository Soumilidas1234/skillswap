<?php

declare(strict_types=1);

namespace App\Middleware;

use App\Helpers\JWTAuth;
use App\Helpers\Response;
use App\Models\User;

class AuthMiddleware
{
    public static ?array $user = null;

    public static function handle(bool $required = true): ?array
    {
        $token = JWTAuth::getBearerToken();

        if (!$token) {
            if ($required) {
                Response::error('Authentication required', 401);
            }
            return null;
        }

        $payload = JWTAuth::verify($token);
        if (!$payload || !isset($payload['user_id'])) {
            if ($required) {
                Response::error('Invalid or expired token', 401);
            }
            return null;
        }

        $user = User::findById((int) $payload['user_id']);
        if (!$user || $user['is_suspended']) {
            Response::error('Account suspended or not found', 403);
        }

        self::$user = $user;
        return $user;
    }

    public static function requireAdmin(): array
    {
        $user = self::handle(true);
        if ($user['role'] !== 'admin') {
            Response::error('Admin access required', 403);
        }
        return $user;
    }
}
