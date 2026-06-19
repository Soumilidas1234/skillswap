$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
. "$PSScriptRoot\bootstrap-path.ps1"
Set-Location "$root\backend"

if (-not (Get-Command php -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: PHP not found. Install XAMPP or PHP 8.3+ and add to PATH." -ForegroundColor Red
    Write-Host "See docs/LOCAL_SETUP.md for instructions."
    exit 1
}

if (-not (Test-Path "vendor")) {
    Write-Host "Installing Composer dependencies..."
    if (-not (Test-Path "composer.phar")) {
        php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
        php composer-setup.php --install-dir=. --filename=composer.phar
        Remove-Item composer-setup.php -ErrorAction SilentlyContinue
    }
    $env:COMPOSER_HOME = "$env:LOCALAPPDATA\Composer"
    php composer.phar install --no-interaction --prefer-source
}

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Created .env from .env.example"
}

Write-Host "Starting SkillSwap AI API at http://localhost:8000" -ForegroundColor Green
Write-Host "Test: http://localhost:8000/api/categories"
php -S localhost:8000 -t .
