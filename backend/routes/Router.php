<?php

declare(strict_types=1);

namespace App\Routes;

use App\Controllers\AchievementController;
use App\Controllers\AdminController;
use App\Controllers\AuthController;
use App\Controllers\CategoryController;
use App\Controllers\CertificateController;
use App\Controllers\LeaderboardController;
use App\Controllers\NotificationController;
use App\Controllers\RequestController;
use App\Controllers\SkillController;
use App\Controllers\StatsController;
use App\Controllers\UploadController;
use App\Controllers\UserController;

class Router
{
    private array $routes = [];

    public function __construct()
    {
        $this->defineRoutes();
    }

    private function defineRoutes(): void
    {
        $auth = new AuthController();
        $user = new UserController();
        $skill = new SkillController();
        $request = new RequestController();
        $notification = new NotificationController();
        $category = new CategoryController();
        $leaderboard = new LeaderboardController();
        $certificate = new CertificateController();
        $achievement = new AchievementController();
        $admin = new AdminController();
        $stats = new StatsController();
        $upload = new UploadController();

        // Auth
        $this->add('POST', '/auth/register', [$auth, 'register']);
        $this->add('POST', '/auth/login', [$auth, 'login']);
        $this->add('POST', '/auth/logout', [$auth, 'logout']);
        $this->add('GET', '/auth/me', [$auth, 'me']);
        $this->add('POST', '/auth/forgot-password', [$auth, 'forgotPassword']);

        // Users
        $this->add('GET', '/users/profile', [$user, 'profile']);
        $this->add('PUT', '/users/profile', [$user, 'updateProfile']);
        $this->add('GET', '/users/dashboard', [$user, 'dashboard']);
        $this->add('GET', '/users/{uuid}', [$user, 'publicProfile']);

        // Skills
        $this->add('GET', '/skills', [$skill, 'index']);
        $this->add('GET', '/skills/popular', [$skill, 'popular']);
        $this->add('GET', '/skills/my', [$skill, 'mySkills']);
        $this->add('GET', '/skills/{id}', [$skill, 'show']);
        $this->add('POST', '/skills', [$skill, 'store']);
        $this->add('PUT', '/skills/{id}', [$skill, 'update']);
        $this->add('DELETE', '/skills/{id}', [$skill, 'destroy']);

        // Requests
        $this->add('GET', '/requests', [$request, 'index']);
        $this->add('POST', '/requests', [$request, 'store']);
        $this->add('POST', '/requests/{id}/accept', [$request, 'accept']);
        $this->add('POST', '/requests/{id}/reject', [$request, 'reject']);
        $this->add('POST', '/requests/{id}/complete', [$request, 'complete']);
        $this->add('POST', '/requests/{id}/cancel', [$request, 'cancel']);

        // Notifications
        $this->add('GET', '/notifications', [$notification, 'index']);
        $this->add('GET', '/notifications/unread-count', [$notification, 'unreadCount']);
        $this->add('PUT', '/notifications/{id}/read', [$notification, 'markRead']);
        $this->add('PUT', '/notifications/read-all', [$notification, 'markAllRead']);

        // Categories
        $this->add('GET', '/categories', [$category, 'index']);
        $this->add('GET', '/categories/top', [$category, 'top']);
        $this->add('POST', '/categories', [$category, 'store']);
        $this->add('PUT', '/categories/{id}', [$category, 'update']);
        $this->add('DELETE', '/categories/{id}', [$category, 'destroy']);

        // Leaderboard
        $this->add('GET', '/leaderboard', [$leaderboard, 'index']);
        $this->add('GET', '/leaderboard/preview', [$leaderboard, 'preview']);

        // Certificates
        $this->add('GET', '/certificates/milestones', [$certificate, 'milestones']);
        $this->add('GET', '/certificates', [$certificate, 'index']);
        $this->add('GET', '/certificates/{certId}', [$certificate, 'show']);
        $this->add('GET', '/certificates/verify/{certId}', [$certificate, 'verify']);

        // Achievements
        $this->add('GET', '/achievements', [$achievement, 'index']);
        $this->add('GET', '/achievements/my', [$achievement, 'myAchievements']);

        // Stats
        $this->add('GET', '/stats', [$stats, 'publicStats']);

        // Upload
        $this->add('POST', '/upload/avatar', [$upload, 'avatar']);
        $this->add('POST', '/upload/thumbnail', [$upload, 'skillThumbnail']);

        // Admin
        $this->add('GET', '/admin/dashboard', [$admin, 'dashboard']);
        $this->add('GET', '/admin/users', [$admin, 'users']);
        $this->add('POST', '/admin/users/{id}/suspend', [$admin, 'suspendUser']);
        $this->add('POST', '/admin/users/{id}/unsuspend', [$admin, 'unsuspendUser']);
        $this->add('DELETE', '/admin/users/{id}', [$admin, 'deleteUser']);
        $this->add('GET', '/admin/skills', [$admin, 'skills']);
        $this->add('DELETE', '/admin/skills/{id}', [$admin, 'deleteSkill']);
        $this->add('GET', '/admin/requests', [$admin, 'requests']);
    }

    private function add(string $method, string $path, callable $handler): void
    {
        $this->routes[] = compact('method', 'path', 'handler');
    }

    public function dispatch(string $method, string $uri): void
    {
        $uri = '/' . trim(parse_url($uri, PHP_URL_PATH) ?? '', '/');
        $uri = preg_replace('#^/api#', '', $uri) ?? $uri;

        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }

            $pattern = preg_replace('/\{(\w+)\}/', '([^/]+)', $route['path']);
            $pattern = '#^' . $pattern . '$#';

            if (preg_match($pattern, $uri, $matches)) {
                array_shift($matches);
                call_user_func_array($route['handler'], array_map(function ($m) {
                    return is_numeric($m) ? (int) $m : $m;
                }, $matches));
                return;
            }
        }

        \App\Helpers\Response::error('Endpoint not found', 404);
    }
}
