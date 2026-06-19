<?php

declare(strict_types=1);

namespace App\Helpers;

use App\Config\App;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JWTAuth
{
    public static function generate(array $payload, ?int $expiry = null): string
    {
        $expiry = $expiry ?? (int) App::config('JWT_EXPIRY', 86400);
        $payload['iat'] = time();
        $payload['exp'] = time() + $expiry;

        return JWT::encode($payload, App::config('JWT_SECRET'), 'HS256');
    }

    public static function verify(string $token): ?array
    {
        try {
            $decoded = JWT::decode($token, new Key(App::config('JWT_SECRET'), 'HS256'));
            return (array) $decoded;
        } catch (\Exception) {
            return null;
        }
    }

    public static function getBearerToken(): ?string
    {
        $headers = getallheaders();
        $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';

        if (preg_match('/Bearer\s+(.+)/i', $auth, $matches)) {
            return $matches[1];
        }
        return null;
    }
}
