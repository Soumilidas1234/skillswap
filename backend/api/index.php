<?php

declare(strict_types=1);

// Early CORS for InfinityFree (runs before autoload/DB — fixes OPTIONS preflight)
$origin = trim($_SERVER['HTTP_ORIGIN'] ?? '');
$allowedOrigin = (
    preg_match('#^https://[\w.-]+\.vercel\.app$#', $origin)
    || $origin === 'http://localhost:5173'
) ? $origin : '';

if ($allowedOrigin !== '') {
    header('Access-Control-Allow-Origin: ' . $allowedOrigin);
    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token');
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');
}

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once dirname(__DIR__) . '/vendor/autoload.php';

use App\Config\App;
use App\Middleware\CorsMiddleware;
use App\Middleware\CsrfMiddleware;
use App\Middleware\RateLimitMiddleware;
use App\Routes\Router;

try {
    App::loadEnv();

    CorsMiddleware::handle();
    CsrfMiddleware::validate();
    RateLimitMiddleware::handle($_SERVER['REQUEST_URI'] ?? '/');

    $router = new Router();
    $router->dispatch($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);
} catch (Throwable $e) {
    header('Content-Type: application/json; charset=utf-8');
    http_response_code(500);

    $message = 'Server error — check htdocs/.env and database import';
    if (App::isDebug() || $e instanceof \PDOException) {
        $message = $e->getMessage();
    }

    echo json_encode([
        'success' => false,
        'message' => $message,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}
