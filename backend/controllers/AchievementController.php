<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Helpers\Response;
use App\Middleware\AuthMiddleware;
use App\Models\Achievement;

class AchievementController
{
    public function index(): void
    {
        Response::success(Achievement::getAll());
    }

    public function myAchievements(): void
    {
        $user = AuthMiddleware::handle(true);
        Response::success(Achievement::getByUser((int) $user['id']));
    }
}
