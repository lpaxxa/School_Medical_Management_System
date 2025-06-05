#!/bin/bash

echo "=========================================="
echo " Medical Management System - Quick Setup"
echo "=========================================="
echo

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
echo "[1/4] Checking Docker..."
if ! docker version >/dev/null 2>&1; then
    echo -e "${RED}ERROR: Docker is not running or not installed.${NC}"
    echo "Please install Docker Desktop and make sure it's running."
    echo "Download: https://www.docker.com/products/docker-desktop/"
    exit 1
fi
echo -e "${GREEN}✓ Docker is running${NC}"

# Check if ports are available
echo "[2/4] Checking port availability..."
if lsof -Pi :8081 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}WARNING: Port 8081 might be in use${NC}"
fi
if lsof -Pi :1434 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}WARNING: Port 1434 might be in use${NC}"
fi
echo -e "${GREEN}✓ Port check complete${NC}"

# Create Docker network if it doesn't exist
echo "[3/4] Setting up Docker network..."
if ! docker network ls | grep -q "medically_network"; then
    docker network create medically_network
    echo -e "${GREEN}✓ Created medically_network${NC}"
else
    echo -e "${GREEN}✓ Network already exists${NC}"
fi

# Start the application
echo "[4/4] Starting services..."
if docker-compose up -d; then
    echo
    echo "=========================================="
    echo -e " ${GREEN}🎉 Setup Complete!${NC}"
    echo "=========================================="
    echo
    echo "Services starting up... Please wait 30-60 seconds."
    echo
    echo "Application will be available at:"
    echo "  📱 Health Check: http://localhost:8081/actuator/health"
    echo "  🌐 API Base URL: http://localhost:8081"
    echo
    echo "Useful commands:"
    echo "  📊 Check status: docker ps"
    echo "  📋 View logs:    docker logs medically_app -f"
    echo "  ⏹️  Stop all:     docker-compose down"
    echo
    echo "Press Enter to check application status..."
    read -r
    
    # Wait and check status
    echo "Checking application status..."
    sleep 10
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo
    echo "If services are running, try accessing:"
    echo "http://localhost:8081/actuator/health"
else
    echo
    echo -e "${RED}❌ Setup failed. Please check the error messages above.${NC}"
    echo
    echo "Common solutions:"
    echo "  1. Make sure Docker Desktop is running"
    echo "  2. Check if ports 8081 and 1434 are free"
    echo "  3. Run 'docker-compose down' and try again"
fi

echo
echo "Press Enter to exit..."
read -r 