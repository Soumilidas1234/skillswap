<?php

declare(strict_types=1);

namespace App\Config;

class App
{
    public static function loadEnv(): void
    {
        $envPath = dirname(__DIR__) . '/.env';
        if (file_exists($envPath)) {
            $dotenv = \Dotenv\Dotenv::createImmutable(dirname(__DIR__));
            $dotenv->load();
        }
    }

    public static function config(string $key, mixed $default = null): mixed
    {
        return $_ENV[$key] ?? $default;
    }

    public static function isDebug(): bool
    {
        return filter_var(self::config('APP_DEBUG', false), FILTER_VALIDATE_BOOLEAN);
    }
}
