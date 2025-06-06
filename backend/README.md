# Medical Management System Backend

A Spring Boot application for managing medical records, student health profiles, and vaccination tracking.

## Prerequisites

Before running this application, make sure you have:

- **Docker Desktop** installed on your machine
  - [Download for Windows](https://desktop.docker.com/win/stable/Docker%20Desktop%20Installer.exe)
  - [Download for Mac](https://desktop.docker.com/mac/stable/Docker.dmg)
  - [Download for Linux](https://docs.docker.com/desktop/install/linux-install/)

## Quick Start

### 1. Clone/Download the Project
```bash
# If using Git
git clone <repository-url>
cd School_Medical_Management_System/backend

# Or extract the ZIP file and navigate to the backend folder
```

### 2. Start the Application
```bash
# Start all services (database + application)
docker-compose up -d

# Wait about 30-60 seconds for startup, then check status
docker ps
```

### 3. Verify Everything is Running
```bash
# Check application health
curl http://localhost:8081/actuator/health

# Or open in browser: http://localhost:8081/actuator/health
```

### 4. Access the Application
- **API Base URL**: `http://localhost:8081`
- **Health Check**: `http://localhost:8081/actuator/health`
- **API Documentation**: `http://localhost:8081/swagger-ui.html` (if configured)

## What's Included

- **Spring Boot 3.5.0** backend application
- **SQL Server 2022** database
- **Docker containerization** for easy deployment
- **Connection retry logic** for robust database connectivity
- **Health monitoring** endpoints

## Container Services

| Service | Port | Description |
|---------|------|-------------|
| `medically_app` | 8081 | Spring Boot application |
| `medically_sqlserver` | 1434 | SQL Server database |

## Useful Commands

### Development
```bash
# View application logs
docker logs medically_app -f

# View database logs
docker logs medically_sqlserver -f

# Restart application only
docker restart medically_app

# Stop all services
docker-compose down

# Rebuild and restart everything
docker-compose down
docker-compose up -d --build
```

### Database Access
```bash
# Connect to SQL Server (password: YourStrong@Passw0rd)
docker exec -it medically_sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" -C
```

### Cleanup
```bash
# Stop and remove containers
docker-compose down

# Remove containers and volumes (WARNING: deletes data)
docker-compose down -v

# Remove all related images
docker rmi backend-app mcr.microsoft.com/mssql/server:2022-latest
```

## Troubleshooting

### Application Won't Start
1. **Check Docker is running**: `docker version`
2. **Check port availability**: Make sure ports 8081 and 1434 are free
3. **View logs**: `docker logs medically_app`
4. **Restart services**: `docker-compose restart`

### Database Connection Issues
```bash
# Check SQL Server health
docker exec medically_sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" -Q "SELECT 1" -C

# If failed, restart database
docker restart medically_sqlserver
```

### Clean Restart
If you encounter persistent issues:
```bash
docker-compose down -v
docker-compose up -d
```

## Development Notes

- The application uses **retry logic** for database connections
- **SQL Server** has a health check that ensures it's ready before the app starts
- **Database schema** is automatically created by Hibernate
- **Default profile** is set to `docker` for containerized environments

## Database Configuration

- **Database Name**: `medically_db`
- **Username**: `sa`
- **Password**: `YourStrong@Passw0rd`
- **Port**: `1434` (external), `1433` (internal)

## Project Structure

```
backend/
├── src/                     # Source code
├── Dockerfile              # Application container config
├── docker-compose.yml      # Multi-container setup
├── pom.xml                 # Maven dependencies
└── README.md               # This file
```

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Ensure Docker Desktop is running
3. Verify port availability
4. Check container logs for specific errors

## Technology Stack

- **Java 21**
- **Spring Boot 3.5.0**
- **Spring Data JPA**
- **Hibernate**
- **SQL Server 2022**
- **Docker & Docker Compose**
- **Maven** 