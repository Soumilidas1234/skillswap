<?php

declare(strict_types=1);

namespace App\Middleware;

use App\Config\Database;
use App\Config\App;
use App\Helpers\Response;

class RateLimitMiddleware
{
    public static function handle(string $endpoint): void
    {
        $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
        $maxRequests = (int) App::config('RATE_LIMIT_REQUESTS', 100);
        $window = (int) App::config('RATE_LIMIT_WINDOW', 60);

        $db = Database::getConnection();
        $windowStart = date('Y-m-d H:i:s', time() - $window);

        $stmt = $db->prepare(
            'SELECT id, attempts FROM rate_limits WHERE ip_address = ? AND endpoint = ? AND window_start > ?'
        );
        $stmt->execute([$ip, $endpoint, $windowStart]);
        $record = $stmt->fetch();

        if ($record && (int) $record['attempts'] >= $maxRequests) {
            Response::error('Too many requests. Please try again later.', 429);
        }

        if ($record) {
            $db->prepare('UPDATE rate_limits SET attempts = attempts + 1 WHERE id = ?')
                ->execute([$record['id']]);
        } else {
            $db->prepare('INSERT INTO rate_limits (ip_address, endpoint) VALUES (?, ?)')
                ->execute([$ip, $endpoint]);
        }
    }
}
