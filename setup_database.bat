@echo off
REM Batch file to set up Rentala database
echo Setting up Rentala database...
echo.

set MYSQL_PATH="C:\Program Files\MySQL\MySQL Server 9.5\bin\mysql.exe"
set SQL_FILE=setup_tenants.sql

echo Step 1: Creating rentala database...
%MYSQL_PATH% -u root -p -e "CREATE DATABASE IF NOT EXISTS rentala;"

echo.
echo Step 2: Running tenant setup script...
%MYSQL_PATH% -u root -p rentala < %SQL_FILE%

if %errorlevel% equ 0 (
    echo.
    echo ✅ Database setup complete!
    echo.
    echo To verify, run:
    echo %MYSQL_PATH% -u root -p rentala -e "SHOW TABLES; SELECT * FROM tenants LIMIT 3;"
) else (
    echo.
    echo ❌ Database setup failed.
    echo Check your MySQL password and try again.
)

echo.
pause
