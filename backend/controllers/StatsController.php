<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Config\App;
use App\Helpers\Response;
use App\Middleware\AuthMiddleware;
use App\Models\Skill;
use App\Models\User;

class StatsController
{
    public function publicStats(): void
    {
        Response::success([
            'total_users' => User::count(),
            'total_skills' => Skill::count(),
            'total_requests' => (int) (\App\Config\Database::getConnection()
                ->query('SELECT stat_value FROM site_stats WHERE stat_key = "total_requests"')
                ->fetch()['stat_value'] ?? 0),
        ]);
    }
}

class UploadController
{
    public function avatar(): void
    {
        $user = AuthMiddleware::handle(true);

        if (!isset($_FILES['avatar']) || $_FILES['avatar']['error'] !== UPLOAD_ERR_OK) {
            Response::error('No file uploaded', 400);
        }

        $file = $_FILES['avatar'];
        $maxSize = (int) App::config('UPLOAD_MAX_SIZE', 5242880);
        $allowed = explode(',', App::config('ALLOWED_EXTENSIONS', 'jpg,jpeg,png,gif,webp'));

        if ($file['size'] > $maxSize) {
            Response::error('File too large', 400);
        }

        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($ext, $allowed, true)) {
            Response::error('Invalid file type', 400);
        }

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        $allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!in_array($mime, $allowedMimes, true)) {
            Response::error('Invalid file content', 400);
        }

        $filename = 'avatar_' . $user['id'] . '_' . time() . '.' . $ext;
        $uploadDir = dirname(__DIR__) . '/uploads/avatars/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $path = $uploadDir . $filename;
        if (!move_uploaded_file($file['tmp_name'], $path)) {
            Response::error('Upload failed', 500);
        }

        $url = App::config('APP_URL') . '/uploads/avatars/' . $filename;
        User::update((int) $user['id'], ['avatar' => $url]);

        Response::success(['avatar' => $url], 'Avatar uploaded');
    }

    public function skillThumbnail(): void
    {
        $user = AuthMiddleware::handle(true);

        if (!isset($_FILES['thumbnail']) || $_FILES['thumbnail']['error'] !== UPLOAD_ERR_OK) {
            Response::error('No file uploaded', 400);
        }

        $file = $_FILES['thumbnail'];
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

        if (!in_array($ext, $allowed, true) || $file['size'] > 5242880) {
            Response::error('Invalid file', 400);
        }

        $filename = 'skill_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
        $uploadDir = dirname(__DIR__) . '/uploads/skills/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        move_uploaded_file($file['tmp_name'], $uploadDir . $filename);
        $url = App::config('APP_URL') . '/uploads/skills/' . $filename;

        Response::success(['thumbnail' => $url], 'Thumbnail uploaded');
    }
}
