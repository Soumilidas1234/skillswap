<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Helpers\Response;
use App\Middleware\AuthMiddleware;
use App\Models\Certificate;
use App\Models\User;

class LeaderboardController
{
    public function index(): void
    {
        $users = User::getLeaderboard(100);

        $ranked = array_map(function ($user, $index) {
            $user['rank'] = $index + 1;
            return $user;
        }, $users, array_keys($users));

        Response::success($ranked);
    }

    public function preview(): void
    {
        Response::success(User::getLeaderboard(5));
    }
}
