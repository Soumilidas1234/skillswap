<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Helpers\JWTAuth;
use App\Helpers\Response;
use App\Helpers\Sanitizer;
use App\Helpers\UserLevel;
use App\Helpers\Validator;
use App\Middleware\AuthMiddleware;
use App\Middleware\CsrfMiddleware;
use App\Models\ActivityLog;
use App\Models\CertificateMilestone;
use App\Models\Points;
use App\Models\User;

class AuthController
{
    /** @return array<string, mixed> */
    private function parseInput(): array
    {
        if (!empty($_POST)) {
            return $_POST;
        }

        $raw = file_get_contents('php://input') ?: '';
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';

        if (str_contains($contentType, 'application/json')) {
            return json_decode($raw, true) ?? [];
        }

        parse_str($raw, $parsed);
        return $parsed;
    }

    public function register(): void
    {
        $input = $this->parseInput();

        $validator = new Validator();
        if (!$validator->validate($input, [
            'name' => 'required|min:2|max:100',
            'email' => 'required|email',
            'password' => 'required|min:8',
        ])) {
            Response::error('Validation failed', 422, $validator->errors());
        }

        $name = Sanitizer::string($input['name']);
        $email = Sanitizer::email($input['email']);
        $password = $input['password'];

        if (User::findByEmail($email)) {
            Response::error('Email already registered', 409);
        }

        $userId = User::create([
            'name' => $name,
            'email' => $email,
            'password' => password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]),
        ]);

        ActivityLog::log($userId, 'user_registered', 'user', $userId);

        $token = JWTAuth::generate(['user_id' => $userId, 'role' => 'user']);
        $csrf = CsrfMiddleware::generate($userId);
        $user = User::findById($userId);

        Response::success([
            'user' => $user,
            'token' => $token,
            'csrf_token' => $csrf,
        ], 'Registration successful', 201);
    }

    public function login(): void
    {
        $input = $this->parseInput();

        $validator = new Validator();
        if (!$validator->validate($input, [
            'email' => 'required|email',
            'password' => 'required',
        ])) {
            Response::error('Validation failed', 422, $validator->errors());
        }

        $email = Sanitizer::email($input['email']);
        $user = User::findByEmail($email);

        if (!$user || !password_verify($input['password'], $user['password'])) {
            Response::error('Invalid email or password', 401);
        }

        if ($user['is_suspended']) {
            Response::error('Account suspended. Contact support.', 403);
        }

        User::updateLastLogin((int) $user['id']);

        if (!Points::hasDailyLogin((int) $user['id'])) {
            Points::add((int) $user['id'], Points::DAILY_LOGIN, 'daily_login', 'Daily login bonus');
            $user = User::findById((int) $user['id']);
        }

        CertificateMilestone::checkAllCategories((int) $user['id']);

        $expiry = !empty($input['remember']) ? 604800 : null;
        $token = JWTAuth::generate(['user_id' => (int) $user['id'], 'role' => $user['role']], $expiry);
        $csrf = CsrfMiddleware::generate((int) $user['id']);

        ActivityLog::log((int) $user['id'], 'user_login', 'user', (int) $user['id']);
        unset($user['password']);

        Response::success([
            'user' => $user,
            'token' => $token,
            'csrf_token' => $csrf,
        ], 'Login successful');
    }

    public function me(): void
    {
        $user = AuthMiddleware::handle(true);
        $user['rank'] = User::getRank((int) $user['id']);
        $user['user_level'] = UserLevel::fromPoints((int) $user['points']);
        $user['level_ranges'] = UserLevel::all();
        $user['category_points'] = CertificateMilestone::getUserCategoryPoints((int) $user['id']);
        Response::success($user);
    }

    public function logout(): void
    {
        $user = AuthMiddleware::handle(true);
        ActivityLog::log((int) $user['id'], 'user_logout', 'user', (int) $user['id']);
        Response::success(null, 'Logged out successfully');
    }

    public function forgotPassword(): void
    {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $email = Sanitizer::email($input['email'] ?? '');

        // Placeholder for email verification flow
        Response::success(null, 'If the email exists, a reset link has been sent.');
    }
}
