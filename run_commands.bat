@echo off
echo ========================================
echo    Запуск создания базы данных shop_lunev
echo ========================================

REM Установка кодировки UTF-8 для корректной работы с кириллицей
chcp 65001

REM ВАЖНО: Укажите правильный путь к psql.exe
SET PSQL_PATH="C:\Program Files\PostgreSQL\17\bin\psql.exe"

REM Подключаемся к Postgres (пользователь postgres, пароль 123) и выполняем скрипт
%PSQL_PATH% -U postgres -W -d postgres -f "create_database.sql"
 
echo.
echo ========================================
echo ✅ База данных создана!
echo ========================================
echo.
pause