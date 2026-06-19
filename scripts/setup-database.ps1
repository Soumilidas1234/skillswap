param(
    [string]$Password = ""
)

# SkillSwap AI — Setup Database (Windows)
$ErrorActionPreference = "Continue"
. "$PSScriptRoot\bootstrap-path.ps1"

$mysqlBin = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
if (-not (Test-Path $mysqlBin)) {
    $mysqlBin = "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe"
}

if (-not (Test-Path $mysqlBin)) {
    Write-Host "ERROR: mysql.exe not found. Install MySQL first." -ForegroundColor Red
    exit 1
}

$root = Split-Path -Parent $PSScriptRoot
$schema = Join-Path $root "database\schema.sql"
$seed = Join-Path $root "database\seed.sql"
$envFile = Join-Path $root "backend\.env"
$cnfFile = Join-Path $env:TEMP "skillswap-mysql.cnf"

Write-Host "SkillSwap AI - Database Setup" -ForegroundColor Cyan
Write-Host ""

if ($Password) {
    $passPlain = $Password
    Write-Host "Using password from parameter."
} else {
    $pass = Read-Host "Enter MySQL root password" -AsSecureString
    $passPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($pass)
    )
}

# Use config file so special characters (@ # etc.) work correctly
Set-Content $cnfFile "[client]`nuser=root`npassword=$passPlain" -Encoding ASCII

Write-Host "Testing connection..."
$test = & $mysqlBin --defaults-extra-file=$cnfFile -e "SELECT 1;" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Cannot connect to MySQL. Wrong password?" -ForegroundColor Red
    Write-Host $test
    Write-Host ""
    Write-Host "To reset password, run as Administrator:" -ForegroundColor Yellow
    Write-Host "  .\scripts\reset-mysql-password.ps1"
    Remove-Item $cnfFile -Force -ErrorAction SilentlyContinue
    exit 1
}
Write-Host "Connected!" -ForegroundColor Green

function Import-SqlFile {
    param([string]$File, [string]$Label)
    Write-Host "Importing $Label..."
    $content = Get-Content $File -Raw -Encoding UTF8
    $result = $content | & $mysqlBin --defaults-extra-file=$cnfFile --default-character-set=utf8mb4 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "FAILED: $Label" -ForegroundColor Red
        Write-Host $result
        return $false
    }
    Write-Host "OK: $Label" -ForegroundColor Green
    return $true
}

$schemaOk = Import-SqlFile -File $schema -Label "schema.sql"
if (-not $schemaOk) { Remove-Item $cnfFile -Force; exit 1 }

$seedOk = Import-SqlFile -File $seed -Label "seed.sql"
if (-not $seedOk) { Remove-Item $cnfFile -Force; exit 1 }

$migration = Join-Path $root "database\migrations\002_milestone_certificates.sql"
if (Test-Path $migration) {
    $migrationOk = Import-SqlFile -File $migration -Label "002_milestone_certificates.sql"
    if (-not $migrationOk) { Remove-Item $cnfFile -Force; exit 1 }
}

Remove-Item $cnfFile -Force -ErrorAction SilentlyContinue

# Update .env — quote password if it contains special chars
if (Test-Path $envFile) {
    $envPass = if ($passPlain -match '[#\s]') { "`"$passPlain`"" } else { $passPlain }
    $lines = Get-Content $envFile
    $updated = $lines | ForEach-Object {
        if ($_ -match '^DB_PASS=') { "DB_PASS=$envPass" } else { $_ }
    }
    Set-Content $envFile $updated -Encoding UTF8
    Write-Host "Updated backend\.env" -ForegroundColor Green
}

Write-Host ""
Write-Host "Database setup complete!" -ForegroundColor Green
Write-Host "Restart backend: .\scripts\start-backend.ps1"
Write-Host "Open: http://localhost:5173"
Write-Host "Admin: admin@skillswap.ai / password"
