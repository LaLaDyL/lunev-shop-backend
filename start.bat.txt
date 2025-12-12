@echo off
echo ========================================
echo    Запуск сервера L-U-N-E-V
echo ========================================
echo.

REM Проверяем Node.js
echo Проверяем Node.js...
node --version
if errorlevel 1 (
    echo ❌ Node.js не найден!
    echo Установите Node.js с сайта: https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo ✅ Node.js установлен

REM Проверяем файлы
echo.
echo Проверяем файлы...
if not exist "server.js" (
    echo ❌ Файл server.js не найден!
    pause
    exit /b 1
)

echo ✅ Файл server.js найден

REM Запускаем сервер
echo.
echo ========================================
echo    Запускаем сервер...
echo ========================================
echo.

node server.js

pause