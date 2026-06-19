<?php

declare(strict_types=1);

namespace App\Helpers;

class UserLevel
{
    /** @var array<int, array{level: int, name: string, min: int, max: int, cert_at: int|null}> */
    public const LEVELS = [
        0 => ['level' => 0, 'name' => 'Newcomer', 'min' => 0, 'max' => 9, 'cert_at' => null],
        1 => ['level' => 1, 'name' => 'Starter', 'min' => 10, 'max' => 99, 'cert_at' => 10],
        2 => ['level' => 2, 'name' => 'Bronze', 'min' => 100, 'max' => 299, 'cert_at' => 100],
        3 => ['level' => 3, 'name' => 'Silver', 'min' => 300, 'max' => 699, 'cert_at' => 300],
        4 => ['level' => 4, 'name' => 'Gold', 'min' => 700, 'max' => 1499, 'cert_at' => 700],
        5 => ['level' => 5, 'name' => 'Platinum', 'min' => 1500, 'max' => 4999, 'cert_at' => 1500],
        6 => ['level' => 6, 'name' => 'Diamond', 'min' => 5000, 'max' => 9999, 'cert_at' => 5000],
        7 => ['level' => 7, 'name' => 'Legend', 'min' => 10000, 'max' => PHP_INT_MAX, 'cert_at' => 10000],
    ];

    public static function fromPoints(int $points): array
    {
        foreach (array_reverse(self::LEVELS, true) as $level) {
            if ($points >= $level['min']) {
                $next = self::LEVELS[$level['level'] + 1] ?? null;
                $progressMax = $next ? $next['min'] - 1 : $level['max'];
                $range = max(1, $progressMax - $level['min'] + 1);
                $progress = min(100, (int) round((($points - $level['min']) / $range) * 100));

                return [
                    'level' => $level['level'],
                    'name' => $level['name'],
                    'min_points' => $level['min'],
                    'max_points' => $level['max'] === PHP_INT_MAX ? null : $level['max'],
                    'cert_at' => $level['cert_at'],
                    'progress' => $progress,
                    'next_level_at' => $next['min'] ?? null,
                ];
            }
        }

        return self::formatLevel(self::LEVELS[0], 0);
    }

    private static function formatLevel(array $level, int $points): array
    {
        return [
            'level' => $level['level'],
            'name' => $level['name'],
            'min_points' => $level['min'],
            'max_points' => $level['max'] === PHP_INT_MAX ? null : $level['max'],
            'cert_at' => $level['cert_at'],
            'progress' => 0,
            'next_level_at' => self::LEVELS[1]['min'] ?? null,
        ];
    }

    public static function all(): array
    {
        return array_values(array_map(fn ($l) => [
            'level' => $l['level'],
            'name' => $l['name'],
            'min_points' => $l['min'],
            'max_points' => $l['max'] === PHP_INT_MAX ? null : $l['max'],
            'cert_at' => $l['cert_at'],
        ], array_filter(self::LEVELS, fn ($l) => $l['level'] > 0)));
    }
}
