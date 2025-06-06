@echo off
echo ==========================================
echo  Medical Management System - Quick Setup
echo ==========================================
echo.

REM Check if Docker is running
echo [1/4] Checking Docker...
docker version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running or not installed.
    echo Please install Docker Desktop and make sure it's running.
    echo Download: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)
echo ✓ Docker is running

REM Check if ports are available
echo [2/4] Checking port availability...
netstat -an | find "8081" >nul 2>&1
if %errorlevel% equ 0 (
    echo WARNING: Port 8081 might be in use
)
netstat -an | find "1434" >nul 2>&1
if %errorlevel% equ 0 (
    echo WARNING: Port 1434 might be in use
)
echo ✓ Port check complete

REM Create Docker network if it doesn't exist
echo [3/4] Setting up Docker network...
docker network ls | find "medically_network" >nul 2>&1
if %errorlevel% neq 0 (
    docker network create medically_network
    echo ✓ Created medically_network
) else (
    echo ✓ Network already exists
)

REM Start the application
echo [4/4] Starting services...
docker-compose up -d

if %errorlevel% equ 0 (
    echo.
    echo ==========================================
    echo  🎉 Setup Complete!
    echo ==========================================
    echo.
    echo Services starting up... Please wait 30-60 seconds.
    echo.
    echo Application will be available at:
    echo   📱 Health Check: http://localhost:8081/actuator/health
    echo   🌐 API Base URL: http://localhost:8081
    echo.
    echo Useful commands:
    echo   📊 Check status: docker ps
    echo   📋 View logs:    docker logs medically_app -f
    echo   ⏹️  Stop all:     docker-compose down
    echo.
    echo Press any key to check application status...
    pause >nul
    
    REM Wait and check status
    echo Checking application status...
    timeout /t 10 /nobreak >nul
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo.
    echo If services are running, try accessing:
    echo http://localhost:8081/actuator/health
) else (
    echo.
    echo ❌ Setup failed. Please check the error messages above.
    echo.
    echo Common solutions:
    echo   1. Make sure Docker Desktop is running
    echo   2. Check if ports 8081 and 1434 are free
    echo   3. Run 'docker-compose down' and try again
)

echo.
pause 