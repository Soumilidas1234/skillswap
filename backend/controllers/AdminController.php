<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Config\Database;
use App\Helpers\Response;
use App\Helpers\Sanitizer;
use App\Middleware\AuthMiddleware;
use App\Models\ActivityLog;
use App\Models\Category;
use App\Models\LearningRequest;
use App\Models\Skill;
use App\Models\User;

class AdminController
{
    public function dashboard(): void
    {
        AuthMiddleware::requireAdmin();
        $db = Database::getConnection();

        $stats = $db->query('SELECT stat_key, stat_value FROM site_stats')->fetchAll();
        $statsMap = array_column($stats, 'stat_value', 'stat_key');

        Response::success([
            'total_users' => User::count(),
            'total_skills' => Skill::count(),
            'total_requests' => (int) ($statsMap['total_requests'] ?? 0),
            'accepted_requests' => LearningRequest::countByStatus('accepted') + LearningRequest::countByStatus('completed'),
            'rejected_requests' => LearningRequest::countByStatus('rejected'),
            'pending_requests' => LearningRequest::countByStatus('pending'),
            'top_teachers' => User::getLeaderboard(5),
            'top_categories' => Category::getTop(5),
            'recent_activity' => ActivityLog::getRecent(15),
            'monthly_growth' => self::getMonthlyGrowth(),
        ]);
    }

    public function users(): void
    {
        AuthMiddleware::requireAdmin();
        $page = Sanitizer::int($_GET['page'] ?? 1, 1);
        $search = Sanitizer::string($_GET['search'] ?? '');
        $result = User::getAll($page, 20, $search ?: null);
        Response::paginated($result['items'], $result['total'], $page, 20);
    }

    public function suspendUser(int $id): void
    {
        AuthMiddleware::requireAdmin();
        User::suspend($id, true);
        ActivityLog::log(null, 'user_suspended', 'user', $id);
        Response::success(null, 'User suspended');
    }

    public function unsuspendUser(int $id): void
    {
        AuthMiddleware::requireAdmin();
        User::suspend($id, false);
        Response::success(null, 'User unsuspended');
    }

    public function deleteUser(int $id): void
    {
        AuthMiddleware::requireAdmin();
        if (!User::delete($id)) {
            Response::error('Cannot delete user', 400);
        }
        Response::success(null, 'User deleted');
    }

    public function skills(): void
    {
        AuthMiddleware::requireAdmin();
        $page = Sanitizer::int($_GET['page'] ?? 1, 1);
        $result = Skill::getAllAdmin($page);
        Response::paginated($result['items'], $result['total'], $page, 20);
    }

    public function deleteSkill(int $id): void
    {
        AuthMiddleware::requireAdmin();
        Database::getConnection()->prepare('DELETE FROM skills WHERE id = ?')->execute([$id]);
        Response::success(null, 'Skill deleted');
    }

    public function requests(): void
    {
        AuthMiddleware::requireAdmin();
        $page = Sanitizer::int($_GET['page'] ?? 1, 1);
        $result = LearningRequest::getAllAdmin($page);
        Response::paginated($result['items'], $result['total'], $page, 20);
    }

    private static function getMonthlyGrowth(): array
    {
        $db = Database::getConnection();
        $stmt = $db->query(
            "SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count
             FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
             GROUP BY month ORDER BY month ASC"
        );
        return $stmt->fetchAll();
    }
}
