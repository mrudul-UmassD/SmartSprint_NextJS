@echo off
echo ======================================
echo   SmartSprint Database Setup Script
echo ======================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo X Node.js is not installed. Please install Node.js before running this script.
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo X npm is not installed. Please install npm before running this script.
    exit /b 1
)

REM Check if the required directory structure exists
if not exist "scripts" (
    echo Creating scripts directory...
    mkdir scripts
)

REM Check if MySQL is installed
where mysql >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Warning: MySQL command-line client not found.
    echo Make sure MySQL is installed and added to your PATH.
    echo You can still continue, but you'll need to provide the correct MySQL connection details.
) else (
    echo MySQL is found in the system PATH.
)

REM Install required dependencies if not already installed
echo Installing required dependencies...
call npm install --save mysql2 dotenv uuid bcrypt
call npm install --save-dev inquirer@8.2.5

REM Run the database setup script
echo Running database setup script...
node scripts/setup-database.js

REM Check if the script executed successfully
if %ERRORLEVEL% NEQ 0 (
    echo X Database setup failed. Check the error messages above.
    exit /b 1
) else (
    echo.
    echo ======================================
    echo   Setup Complete
    echo ======================================
    echo.
    echo You can now start the application with:
    echo npm run dev
    echo.
    echo Default admin credentials:
    echo Username: admin
    echo Password: admin123
) 