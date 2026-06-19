<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Helpers\Response;
use App\Helpers\Sanitizer;
use App\Helpers\Validator;
use App\Middleware\AuthMiddleware;
use App\Models\Achievement;
use App\Models\ActivityLog;
use App\Models\Certificate;
use App\Models\LearningRequest;
use App\Models\Notification;
use App\Models\Points;
use App\Models\Skill;

class RequestController
{
    public function index(): void
    {
        $user = AuthMiddleware::handle(true);
        $type = Sanitizer::string($_GET['type'] ?? 'all');
        $status = Sanitizer::string($_GET['status'] ?? '');

        $incoming = in_array($type, ['all', 'incoming'], true)
            ? LearningRequest::getByTeacher((int) $user['id'], $status ?: null)
            : [];
        $outgoing = in_array($type, ['all', 'outgoing'], true)
            ? LearningRequest::getByLearner((int) $user['id'], $status ?: null)
            : [];

        Response::success(['incoming' => $incoming, 'outgoing' => $outgoing]);
    }

    public function store(): void
    {
        $user = AuthMiddleware::handle(true);
        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $validator = new Validator();
        if (!$validator->validate($input, [
            'skill_id' => 'required|integer',
            'message' => 'required|min:10',
        ])) {
            Response::error('Validation failed', 422, $validator->errors());
        }

        $skill = Skill::findById((int) $input['skill_id']);
        if (!$skill) {
            Response::error('Skill not found', 404);
        }

        if ((int) $skill['user_id'] === (int) $user['id']) {
            Response::error('Cannot request your own skill', 400);
        }

        $id = LearningRequest::create([
            'skill_id' => (int) $input['skill_id'],
            'learner_id' => (int) $user['id'],
            'teacher_id' => (int) $skill['user_id'],
            'message' => Sanitizer::stripHtml($input['message']),
            'preferred_timing' => Sanitizer::string($input['preferred_timing'] ?? ''),
        ]);

        Notification::create(
            (int) $skill['user_id'],
            'new_request',
            'New Learning Request',
            "{$user['name']} wants to learn {$skill['title']}",
            ['request_id' => $id, 'skill_id' => $skill['id']]
        );

        ActivityLog::log((int) $user['id'], 'request_sent', 'request', $id);
        Response::success(LearningRequest::findById($id), 'Request sent', 201);
    }

    public function accept(int $id): void
    {
        $user = AuthMiddleware::handle(true);
        $request = LearningRequest::findById($id);

        if (!$request || (int) $request['teacher_id'] !== (int) $user['id']) {
            Response::error('Request not found', 404);
        }

        if ($request['status'] !== 'pending') {
            Response::error('Request already processed', 400);
        }

        LearningRequest::updateStatus($id, 'accepted');
        $categoryId = (int) $request['category_id'];
        Points::add((int) $user['id'], Points::ACCEPT_REQUEST, 'accept_request', 'Accepted learning request', $id, $categoryId);

        Notification::create(
            (int) $request['learner_id'],
            'request_accepted',
            'Request Accepted!',
            "Your request for {$request['skill_title']} was accepted.",
            ['request_id' => $id]
        );

        Notification::create(
            (int) $user['id'],
            'points_earned',
            'Points Earned!',
            'You earned ' . Points::ACCEPT_REQUEST . ' points for accepting a request.',
            ['points' => Points::ACCEPT_REQUEST]
        );

        Achievement::checkAndUnlock((int) $user['id']);
        ActivityLog::log((int) $user['id'], 'request_accepted', 'request', $id);

        Response::success(LearningRequest::findById($id), 'Request accepted');
    }

    public function reject(int $id): void
    {
        $user = AuthMiddleware::handle(true);
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $request = LearningRequest::findById($id);

        if (!$request || (int) $request['teacher_id'] !== (int) $user['id']) {
            Response::error('Request not found', 404);
        }

        LearningRequest::updateStatus($id, 'rejected', Sanitizer::string($input['response'] ?? ''));
        \App\Config\Database::getConnection()
            ->prepare('UPDATE site_stats SET stat_value = stat_value + 1 WHERE stat_key = "rejected_requests"')
            ->execute();

        Notification::create(
            (int) $request['learner_id'],
            'request_rejected',
            'Request Declined',
            "Your request for {$request['skill_title']} was declined.",
            ['request_id' => $id]
        );

        Response::success(LearningRequest::findById($id), 'Request rejected');
    }

    public function complete(int $id): void
    {
        $user = AuthMiddleware::handle(true);
        $request = LearningRequest::findById($id);

        if (!$request || (int) $request['teacher_id'] !== (int) $user['id']) {
            Response::error('Request not found', 404);
        }

        if ($request['status'] !== 'accepted') {
            Response::error('Request must be accepted first', 400);
        }

        LearningRequest::updateStatus($id, 'completed');
        $categoryId = (int) $request['category_id'];
        Points::add((int) $user['id'], Points::COMPLETE_SESSION, 'complete_session', 'Completed teaching session', $id, $categoryId);
        Points::add((int) $request['learner_id'], 10, 'learn_complete', 'Completed learning session', $id, $categoryId);

        \App\Config\Database::getConnection()
            ->prepare('UPDATE site_stats SET stat_value = stat_value + 1 WHERE stat_key = "accepted_requests"')
            ->execute();

        Certificate::create([
            'request_id' => $id,
            'learner_id' => (int) $request['learner_id'],
            'teacher_id' => (int) $request['teacher_id'],
            'skill_id' => (int) $request['skill_id'],
            'skill_name' => $request['skill_title'],
            'learner_name' => $request['learner_name'],
            'teacher_name' => $request['teacher_name'],
            'completion_date' => date('Y-m-d'),
        ]);

        Achievement::checkAndUnlock((int) $user['id']);
        ActivityLog::log((int) $user['id'], 'session_completed', 'request', $id);

        Response::success(LearningRequest::findById($id), 'Session completed');
    }

    public function cancel(int $id): void
    {
        $user = AuthMiddleware::handle(true);
        $request = LearningRequest::findById($id);

        if (!$request || (int) $request['learner_id'] !== (int) $user['id']) {
            Response::error('Request not found', 404);
        }

        LearningRequest::updateStatus($id, 'cancelled');
        Response::success(null, 'Request cancelled');
    }
}
