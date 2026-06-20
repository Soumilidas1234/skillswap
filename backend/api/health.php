<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$result = [
    'success' => true,
    'php_version' => PHP_VERSION,
    'checks' => [],
];

try {
    require_once dirname(__DIR__) . '/vendor/autoload.php';
    $result['checks']['autoload'] = 'ok';

    $envPath = dirname(__DIR__) . '/.env';
    $result['checks']['env_file'] = file_exists($envPath) ? 'ok' : 'missing';

    \App\Config\App::loadEnv();
    $result['checks']['db_host'] = $_ENV['DB_HOST'] ?? '(not set)';
    $result['checks']['db_name'] = $_ENV['DB_NAME'] ?? '(not set)';

    $pass = $_ENV['DB_PASS'] ?? '';
    if ($pass === '' || $pass === 'PUT_YOUR_MYSQL_PASSWORD_HERE') {
        throw new RuntimeException('DB_PASS is not set in .env — edit htdocs/.env on the server');
    }

    $db = \App\Config\Database::getConnection();
    $count = (int) $db->query('SELECT COUNT(*) FROM categories')->fetchColumn();
    $result['checks']['database'] = 'ok';
    $result['checks']['categories_count'] = $count;
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'php_version' => PHP_VERSION,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

echo json_encode($result, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
