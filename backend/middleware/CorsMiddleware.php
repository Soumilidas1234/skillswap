<?php

declare(strict_types=1);

namespace App\Middleware;

use App\Config\App;

class CorsMiddleware
{
    public static function handle(): void
    {
        $originsConfig = (string) App::config('CORS_ORIGINS', App::config('CORS_ORIGIN', '*'));
        $origins = array_values(array_filter(array_map('trim', explode(',', $originsConfig))));
        $origin = trim($_SERVER['HTTP_ORIGIN'] ?? '');

        if (self::isAllowedOrigin($origin, $origins)) {
            header('Access-Control-Allow-Origin: ' . ($origin ?: ($origins[0] ?? '*')));
        }

        header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400');

        if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }

    private static function isAllowedOrigin(string $origin, array $origins): bool
    {
        if ($origin === '') {
            return in_array('*', $origins, true);
        }

        if (in_array('*', $origins, true)) {
            return true;
        }

        if (in_array($origin, $origins, true)) {
            return true;
        }

        foreach ($origins as $allowed) {
            if ($allowed === '*.vercel.app' && preg_match('#^https://[\w.-]+\.vercel\.app$#', $origin)) {
                return true;
            }
        }

        // If any configured origin is on Vercel, allow all *.vercel.app (preview + production URLs)
        foreach ($origins as $allowed) {
            if (str_contains($allowed, 'vercel.app') && preg_match('#^https://[\w.-]+\.vercel\.app$#', $origin)) {
                return true;
            }
        }

        return false;
    }
}
