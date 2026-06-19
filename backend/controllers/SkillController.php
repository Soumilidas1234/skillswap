<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Helpers\Response;
use App\Helpers\Sanitizer;
use App\Helpers\Validator;
use App\Middleware\AuthMiddleware;
use App\Models\ActivityLog;
use App\Models\Skill;

class SkillController
{
    public function index(): void
    {
        $page = Sanitizer::int($_GET['page'] ?? 1, 1);
        $perPage = min(Sanitizer::int($_GET['per_page'] ?? 12, 12), 50);

        $filters = [
            'search' => Sanitizer::string($_GET['search'] ?? ''),
            'category_id' => Sanitizer::int($_GET['category_id'] ?? 0) ?: null,
            'level' => Sanitizer::string($_GET['level'] ?? ''),
            'availability' => Sanitizer::string($_GET['availability'] ?? ''),
            'sort' => Sanitizer::string($_GET['sort'] ?? 'newest'),
        ];

        $result = Skill::browse($filters, $page, $perPage);
        Response::paginated($result['items'], $result['total'], $page, $perPage);
    }

    public function show(int $id): void
    {
        $skill = Skill::findById($id);
        if (!$skill) {
            Response::error('Skill not found', 404);
        }

        Skill::incrementViews($id);

        $user = AuthMiddleware::handle(false);
        if ($user) {
            $db = \App\Config\Database::getConnection();
            $db->prepare(
                'INSERT INTO recently_viewed (user_id, skill_id) VALUES (?, ?)
                 ON DUPLICATE KEY UPDATE viewed_at = NOW()'
            )->execute([(int) $user['id'], $id]);
        }

        Response::success($skill);
    }

    public function popular(): void
    {
        Response::success(Skill::getPopular(8));
    }

    public function mySkills(): void
    {
        $user = AuthMiddleware::handle(true);
        Response::success(Skill::getByUser((int) $user['id']));
    }

    public function store(): void
    {
        $user = AuthMiddleware::handle(true);
        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $validator = new Validator();
        if (!$validator->validate($input, [
            'title' => 'required|min:3|max:200',
            'category_id' => 'required|integer',
            'description' => 'required|min:20',
        ])) {
            Response::error('Validation failed', 422, $validator->errors());
        }

        $title = Sanitizer::string($input['title']);
        $slug = Sanitizer::slug($title) . '-' . time();

        $id = Skill::create([
            'user_id' => (int) $user['id'],
            'category_id' => (int) $input['category_id'],
            'title' => $title,
            'slug' => $slug,
            'description' => Sanitizer::stripHtml($input['description']),
            'level' => $input['level'] ?? 'intermediate',
            'tags' => Sanitizer::array($input['tags'] ?? []),
            'availability' => $input['availability'] ?? 'available',
            'experience_years' => Sanitizer::int($input['experience_years'] ?? 0),
            'status' => $input['status'] ?? 'active',
        ]);

        ActivityLog::log((int) $user['id'], 'skill_created', 'skill', $id);
        Response::success(Skill::findById($id), 'Skill created', 201);
    }

    public function update(int $id): void
    {
        $user = AuthMiddleware::handle(true);
        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $data = [];
        if (isset($input['title'])) {
            $data['title'] = Sanitizer::string($input['title']);
            $data['slug'] = Sanitizer::slug($data['title']) . '-' . $id;
        }
        if (isset($input['category_id'])) $data['category_id'] = (int) $input['category_id'];
        if (isset($input['description'])) $data['description'] = Sanitizer::stripHtml($input['description']);
        if (isset($input['level'])) $data['level'] = $input['level'];
        if (isset($input['tags'])) $data['tags'] = Sanitizer::array($input['tags']);
        if (isset($input['availability'])) $data['availability'] = $input['availability'];
        if (isset($input['experience_years'])) $data['experience_years'] = (int) $input['experience_years'];
        if (isset($input['status'])) $data['status'] = $input['status'];

        if (!Skill::update($id, (int) $user['id'], $data)) {
            Response::error('Skill not found or unauthorized', 404);
        }

        ActivityLog::log((int) $user['id'], 'skill_updated', 'skill', $id);
        Response::success(Skill::findById($id), 'Skill updated');
    }

    public function destroy(int $id): void
    {
        $user = AuthMiddleware::handle(true);

        if (!Skill::delete($id, (int) $user['id'])) {
            Response::error('Skill not found or unauthorized', 404);
        }

        ActivityLog::log((int) $user['id'], 'skill_deleted', 'skill', $id);
        Response::success(null, 'Skill deleted');
    }
}
