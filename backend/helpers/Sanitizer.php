<?php

declare(strict_types=1);

namespace App\Helpers;

class Sanitizer
{
    public static function string(?string $value): string
    {
        if ($value === null) {
            return '';
        }
        return htmlspecialchars(strip_tags(trim($value)), ENT_QUOTES, 'UTF-8');
    }

    public static function email(?string $value): string
    {
        return filter_var(trim($value ?? ''), FILTER_SANITIZE_EMAIL) ?: '';
    }

    public static function int(mixed $value, int $default = 0): int
    {
        return filter_var($value, FILTER_VALIDATE_INT) !== false
            ? (int) $value
            : $default;
    }

    public static function array(mixed $data): array
    {
        return is_array($data) ? $data : [];
    }

    public static function slug(string $text): string
    {
        $text = strtolower(trim($text));
        $text = preg_replace('/[^a-z0-9-]/', '-', $text) ?? '';
        $text = preg_replace('/-+/', '-', $text) ?? '';
        return trim($text, '-');
    }

    public static function stripHtml(?string $value): string
    {
        return strip_tags(trim($value ?? ''));
    }
}
