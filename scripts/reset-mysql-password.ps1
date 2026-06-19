# Reset MySQL root password to match backend/.env (default: SkillSwap123)
# Run PowerShell as Administrator: right-click PowerShell -> Run as administrator

#Requires -RunAsAdministrator

$ErrorActionPreference = "Stop"
. "$PSScriptRoot\bootstrap-path.ps1"

$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root "backend\.env"
$serviceName = "MySQL80"
$mysqlDir = "C:\Program Files\MySQL\MySQL Server 8.0"
$mysqlBin = Join-Path $mysqlDir "bin"
$mysqld = Join-Path $mysqlBin "mysqld.exe"
$mysql = Join-Path $mysqlBin "mysql.exe"
$myIni = "C:\ProgramData\MySQL\MySQL Server 8.0\my.ini"

if (-not (Test-Path $mysqld)) {
    $mysqlDir = "C:\Program Files\MySQL\MySQL Server 8.4"
    $mysqlBin = Join-Path $mysqlDir "bin"
    $mysqld = Join-Path $mysqlBin "mysqld.exe"
    $mysql = Join-Path $mysqlBin "mysql.exe"
    $myIni = "C:\ProgramData\MySQL\MySQL Server 8.4\my.ini"
}

if (-not (Test-Path $envFile)) {
    Write-Host "ERROR: backend/.env not found." -ForegroundColor Red
    exit 1
}

$newPassword = "SkillSwap123"
foreach ($line in Get-Content $envFile) {
    if ($line -match '^DB_PASS=(.*)$') {
        $newPassword = $Matches[1].Trim().Trim('"')
        break
    }
}

Write-Host "SkillSwap AI - Reset MySQL root password" -ForegroundColor Cyan
Write-Host "Target password (from backend/.env): $newPassword" -ForegroundColor Yellow
Write-Host ""

$initSql = Join-Path $env:TEMP "skillswap-mysql-reset.sql"
Set-Content $initSql @"
ALTER USER 'root'@'localhost' IDENTIFIED BY '$newPassword';
FLUSH PRIVILEGES;
"@ -Encoding ASCII

Write-Host "Stopping MySQL service ($serviceName)..."
Stop-Service -Name $serviceName -Force -ErrorAction Stop
Start-Sleep -Seconds 3

Write-Host "Starting MySQL with password reset init file..."
$proc = Start-Process -FilePath $mysqld `
    -ArgumentList @("--defaults-file=$myIni", "--init-file=$initSql", "--console") `
    -PassThru -WindowStyle Hidden

$ready = $false
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 1
    $test = & $mysql -u root -e "SELECT 1;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        $ready = $true
        break
    }
}

if (-not $ready) {
    if (-not $proc.HasExited) { Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue }
    Start-Service -Name $serviceName -ErrorAction SilentlyContinue
    Remove-Item $initSql -Force -ErrorAction SilentlyContinue
    Write-Host "ERROR: Timed out resetting password." -ForegroundColor Red
    exit 1
}

Write-Host "Password reset applied." -ForegroundColor Green

if (-not $proc.HasExited) {
    Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

Write-Host "Starting MySQL service..."
Start-Service -Name $serviceName
Start-Sleep -Seconds 3

Remove-Item $initSql -Force -ErrorAction SilentlyContinue

$cnf = Join-Path $env:TEMP "skillswap-mysql.cnf"
Set-Content $cnf "[client]`nuser=root`npassword=$newPassword" -Encoding ASCII
$verify = & $mysql --defaults-extra-file=$cnf -e "SELECT 'OK' AS status;" 2>&1
Remove-Item $cnf -Force -ErrorAction SilentlyContinue

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Could not verify new password." -ForegroundColor Red
    Write-Host $verify
    exit 1
}

Write-Host ""
Write-Host "MySQL root password is now: $newPassword" -ForegroundColor Green
Write-Host "Run database setup next:" -ForegroundColor Cyan
Write-Host "  .\scripts\setup-database.ps1 -Password '$newPassword'"
