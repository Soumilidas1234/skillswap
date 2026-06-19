@echo off
set "PATH=C:\Users\soumi\AppData\Local\skillswap-tools\node;C:\Users\soumi\AppData\Local\skillswap-tools\php;%PATH%"
cd /d "%~dp0backend"
echo Starting backend at http://localhost:8000
echo Test: http://localhost:8000/api/categories
php -S localhost:8000 -t .
pause
