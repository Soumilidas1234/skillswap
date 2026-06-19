<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Helpers\Response;
use App\Helpers\Sanitizer;
use App\Helpers\UserLevel;
use App\Middleware\AuthMiddleware;
use App\Models\Achievement;
use App\Models\ActivityLog;
use App\Models\CertificateMilestone;
use App\Models\LearningRequest;
use App\Models\Notification;
use App\Models\Points;
use App\Models\Skill;
use App\Models\User;

class UserController
{
    public function profile(): void
    {
        $user = AuthMiddleware::handle(true);
        $userId = (int) $user['id'];

        CertificateMilestone::checkAllCategories($userId);

        $user['rank'] = User::getRank($userId);
        $user['user_level'] = UserLevel::fromPoints((int) $user['points']);
        $user['level_ranges'] = UserLevel::all();
        $user['category_points'] = CertificateMilestone::getUserCategoryPoints($userId);
        $user['skills'] = Skill::getByUser($userId);
        $user['achievements'] = Achievement::getByUser($userId);
        $user['points_history'] = Points::getHistory($userId, 10);
        $user['activity'] = ActivityLog::getByUser($userId, 10);

        Response::success($user);
    }

    public function updateProfile(): void
    {
        $user = AuthMiddleware::handle(true);
        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        User::update((int) $user['id'], [
            'name' => Sanitizer::string($input['name'] ?? $user['name']),
            'bio' => Sanitizer::stripHtml($input['bio'] ?? $user['bio']),
            'location' => Sanitizer::string($input['location'] ?? ''),
            'website' => Sanitizer::string($input['website'] ?? ''),
            'twitter' => Sanitizer::string($input['twitter'] ?? ''),
            'linkedin' => Sanitizer::string($input['linkedin'] ?? ''),
            'github' => Sanitizer::string($input['github'] ?? ''),
        ]);

        ActivityLog::log((int) $user['id'], 'profile_updated', 'user', (int) $user['id']);
        Response::success(User::findById((int) $user['id']), 'Profile updated');
    }

    public function publicProfile(string $uuid): void
    {
        $user = User::findByUuid($uuid);
        if (!$user) {
            Response::error('User not found', 404);
        }

        $user['skills'] = Skill::getByUser((int) $user['id']);
        $user['achievements'] = Achievement::getByUser((int) $user['id']);
        $user['rank'] = User::getRank((int) $user['id']);

        Response::success($user);
    }

    public function dashboard(): void
    {
        $user = AuthMiddleware::handle(true);
        $userId = (int) $user['id'];

        Response::success([
            'user' => User::findById($userId),
            'rank' => User::getRank($userId),
            'user_level' => UserLevel::fromPoints((int) $user['points']),
            'level_ranges' => UserLevel::all(),
            'category_points' => CertificateMilestone::getUserCategoryPoints($userId),
            'total_skills' => count(Skill::getByUser($userId)),
            'incoming_requests' => LearningRequest::countIncoming($userId),
            'outgoing_requests' => LearningRequest::countOutgoing($userId),
            'unread_notifications' => Notification::getUnreadCount($userId),
            'achievements' => Achievement::getByUser($userId),
            'recent_requests' => array_slice(
                array_merge(
                    LearningRequest::getByTeacher($userId),
                    LearningRequest::getByLearner($userId)
                ),
                0,
                5
            ),
            'points_history' => Points::getHistory($userId, 10),
            'activity' => ActivityLog::getByUser($userId, 10),
        ]);
    }
}
