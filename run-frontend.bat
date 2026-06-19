@echo off
set "PATH=C:\Users\soumi\AppData\Local\skillswap-tools\node;C:\Users\soumi\AppData\Local\skillswap-tools\php;%PATH%"
cd /d "%~dp0frontend"
if not exist node_modules (
    echo Installing npm packages...
    call npm.cmd install
)
echo Starting frontend at http://localhost:5173
call npm.cmd run dev
pause
