<?php

declare(strict_types=1);

namespace App\Middleware;

use App\Config\App;

class CorsMiddleware
{
    public static function handle(): void
    {
        $origins = explode(',', App::config('CORS_ORIGINS', App::config('CORS_ORIGIN', '*')));
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

        if (in_array($origin, $origins, true) || in_array('*', $origins, true)) {
            header('Access-Control-Allow-Origin: ' . ($origin ?: $origins[0]));
        }

        header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400');

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }
}
