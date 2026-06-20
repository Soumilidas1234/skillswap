<?php

declare(strict_types=1);

header('Content-Type: application/json');
echo json_encode([
    'success' => true,
    'message' => 'SkillSwap API is running',
    'endpoints' => [
        'categories' => '/api/categories',
        'stats' => '/api/stats',
    ],
]);
