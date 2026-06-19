<?php

declare(strict_types=1);

namespace App\Helpers;

class Validator
{
    private array $errors = [];

    public function validate(array $data, array $rules): bool
    {
        $this->errors = [];

        foreach ($rules as $field => $ruleSet) {
            $value = $data[$field] ?? null;
            $rulesList = explode('|', $ruleSet);

            foreach ($rulesList as $rule) {
                $this->applyRule($field, $value, $rule, $data);
            }
        }

        return empty($this->errors);
    }

    public function errors(): array
    {
        return $this->errors;
    }

    private function applyRule(string $field, mixed $value, string $rule, array $data): void
    {
        if (str_starts_with($rule, 'min:')) {
            $min = (int) substr($rule, 4);
            if (is_string($value) && strlen($value) < $min) {
                $this->errors[$field][] = "{$field} must be at least {$min} characters";
            }
            return;
        }

        if (str_starts_with($rule, 'max:')) {
            $max = (int) substr($rule, 4);
            if (is_string($value) && strlen($value) > $max) {
                $this->errors[$field][] = "{$field} must not exceed {$max} characters";
            }
            return;
        }

        match ($rule) {
            'required' => empty($value) && $value !== '0' && $value !== 0
                ? $this->errors[$field][] = "{$field} is required"
                : null,
            'email' => !empty($value) && !filter_var($value, FILTER_VALIDATE_EMAIL)
                ? $this->errors[$field][] = "{$field} must be a valid email"
                : null,
            'numeric' => !empty($value) && !is_numeric($value)
                ? $this->errors[$field][] = "{$field} must be numeric"
                : null,
            'integer' => !empty($value) && filter_var($value, FILTER_VALIDATE_INT) === false
                ? $this->errors[$field][] = "{$field} must be an integer"
                : null,
            default => null,
        };
    }
}
