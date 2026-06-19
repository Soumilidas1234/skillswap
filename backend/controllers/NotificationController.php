<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Helpers\Response;
use App\Helpers\Sanitizer;
use App\Middleware\AuthMiddleware;
use App\Models\Achievement;
use App\Models\Category;
use App\Models\Certificate;
use App\Models\LearningRequest;
use App\Models\Notification;
use App\Models\Skill;
use App\Models\User;

class NotificationController
{
    public function index(): void
    {
        $user = AuthMiddleware::handle(true);
        $page = Sanitizer::int($_GET['page'] ?? 1, 1);
        $result = Notification::getByUser((int) $user['id'], $page);
        Response::paginated($result['items'], $result['total'], $page, 20);
    }

    public function unreadCount(): void
    {
        $user = AuthMiddleware::handle(true);
        Response::success(['count' => Notification::getUnreadCount((int) $user['id'])]);
    }

    public function markRead(int $id): void
    {
        $user = AuthMiddleware::handle(true);
        Notification::markAsRead($id, (int) $user['id']);
        Response::success(null, 'Marked as read');
    }

    public function markAllRead(): void
    {
        $user = AuthMiddleware::handle(true);
        Notification::markAllAsRead((int) $user['id']);
        Response::success(null, 'All marked as read');
    }
}
