@echo off
REM Batch file to connect to MySQL for Rentala
echo Connecting to MySQL for Rentala Platform...
echo.

REM Set MySQL path
set MYSQL_PATH="C:\Program Files\MySQL\MySQL Server 9.5\bin\mysql.exe"

REM Check if MySQL is running
sc query mysql | find "RUNNING"
if errorlevel 1 (
    echo MySQL service is not running.
    echo Starting MySQL service...
    net start mysql
)

REM Connect to MySQL
%MYSQL_PATH% -u root -p rentala

echo.
echo To set up tenant database manually:
echo 1. CREATE DATABASE IF NOT EXISTS rentala;
echo 2. USE rentala;
echo 3. Copy/paste SQL from setup_tenants.sql
echo.
pause
