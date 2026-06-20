# Build skillswap-backend-htdocs.zip for InfinityFree htdocs upload
$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$backend = Join-Path $root "backend"
$staging = Join-Path $root "skillswap-zip-staging"
$zipPath = Join-Path $root "skillswap-backend-htdocs.zip"

if (-not (Test-Path (Join-Path $backend "vendor\autoload.php"))) {
    Write-Error "Run 'composer install --no-dev' in backend/ first (vendor/ missing)."
}

if (Test-Path $staging) { Remove-Item $staging -Recurse -Force }
Copy-Item $backend $staging -Recurse -Force

$vendorFiles = (Get-ChildItem (Join-Path $staging "vendor") -Recurse -File).Count
if ($vendorFiles -lt 400) {
    Write-Error "vendor/ incomplete ($vendorFiles files). Run 'composer install --no-dev' in backend/ and retry."
}

Remove-Item (Join-Path $staging ".env.example") -ErrorAction SilentlyContinue

$envContent = @'
APP_NAME="SkillSwap"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://skillswapp.infinityfreeapp.com

DB_HOST=sql305.infinityfree.com
DB_PORT=3306
DB_NAME=if0_42226923_skillswap
DB_USER=if0_42226923
DB_PASS=PUT_YOUR_MYSQL_PASSWORD_HERE

JWT_SECRET=change-this-to-a-long-random-string-min-32-chars
JWT_EXPIRY=86400
JWT_REFRESH_EXPIRY=604800

CORS_ORIGIN=https://skillswap.vercel.app
CORS_ORIGINS=https://skillswap.vercel.app

UPLOAD_MAX_SIZE=5242880
ALLOWED_EXTENSIONS=jpg,jpeg,png,gif,webp

RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60

ADMIN_EMAIL=admin@skillswap.ai
'@
[System.IO.File]::WriteAllText((Join-Path $staging ".env"), $envContent, (New-Object System.Text.UTF8Encoding $false))

@'
SKILLSWAP BACKEND - UPLOAD INSTRUCTIONS
1. InfinityFree File Manager -> open htdocs (NOT Home root)
2. Upload & Unzip this file INSIDE htdocs
3. After extract you must see: htdocs/api/index.php (NOT htdocs/backend/api/)
4. Edit htdocs/.env -> set DB_PASS to your InfinityFree MySQL password
5. Test: https://skillswapp.infinityfreeapp.com/api/categories

TIP: If web extract misses folders, use FileZilla FTP and upload all files/folders into htdocs.
'@ | Set-Content (Join-Path $staging "UPLOAD-README.txt") -Encoding UTF8

if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
tar -a -cf $zipPath -C $staging .

Remove-Item $staging -Recurse -Force

$sizeMB = [math]::Round((Get-Item $zipPath).Length / 1MB, 2)
Write-Host "Created: $zipPath ($sizeMB MB)"
Write-Host "Contents check - extract and verify api/, vendor/, .htaccess, .env exist."
