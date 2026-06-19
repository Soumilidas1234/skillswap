@echo off
REM SkillSwap AI - Install all local dependencies (Windows)
echo ============================================
echo  SkillSwap AI - Local Setup
echo ============================================

cd /d "%~dp0.."

REM Refresh PATH
for /f "tokens=2*" %%a in ('reg query "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v Path 2^>nul') do set "SYSPATH=%%b"
for /f "tokens=2*" %%a in ('reg query "HKCU\Environment" /v Path 2^>nul') do set "USERPATH=%%b"
set "PATH=%SYSPATH%;%USERPATH%;C:\Program Files\MySQL\MySQL Server 8.0\bin"

echo.
echo [1/4] Checking Node.js...
node -v || (echo ERROR: Install Node.js from https://nodejs.org & exit /b 1)

echo.
echo [2/4] Installing frontend dependencies...
cd frontend
call npm install
if errorlevel 1 exit /b 1
cd ..

echo.
echo [3/4] Installing backend dependencies...
cd backend
if not exist composer.phar (
    echo Downloading Composer...
    php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
    php composer-setup.php --install-dir=. --filename=composer.phar
    del composer-setup.php
)
php composer.phar install --no-interaction
if errorlevel 1 exit /b 1
cd ..

echo.
echo [4/4] Database setup...
echo.
set /p MYSQL_PASS="Enter MySQL root password (press Enter if none): "
set MYSQL_BIN=C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe

if "%MYSQL_PASS%"=="" (
    "%MYSQL_BIN%" -u root < database\schema.sql
    "%MYSQL_BIN%" -u root < database\seed.sql
) else (
    "%MYSQL_BIN%" -u root -p%MYSQL_PASS% < database\schema.sql
    "%MYSQL_BIN%" -u root -p%MYSQL_PASS% < database\seed.sql
)

if errorlevel 1 (
    echo.
    echo WARNING: Database import failed. Import manually via MySQL Workbench:
    echo   - database\schema.sql
    echo   - database\seed.sql
    echo Update backend\.env with your MySQL password.
) else (
    echo Database imported successfully!
)

echo.
echo ============================================
echo  Setup complete!
echo ============================================
echo.
echo Start backend:  scripts\start-backend.ps1
echo Start frontend: scripts\start-frontend.ps1
echo.
echo Open http://localhost:5173
echo Admin login: admin@skillswap.ai / password
pause
