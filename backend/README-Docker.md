# Docker Setup for Medically Backend

This document provides instructions for running the Medical Management System backend using Docker.

## Prerequisites

- Docker Engine 20.10+ installed
- Docker Compose 2.0+ installed
- At least 2GB of free RAM
- Port 8080 and 3306 available on your host machine

## Quick Start

### 1. Build and Run with Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

### 2. Using Dockerfile Only

```bash
# Build the Docker image
docker build -t medically-backend .

# Run with external MySQL (replace with your database URL)
docker run -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:mysql://host.docker.internal:3306/medically_db \
  -e SPRING_DATASOURCE_USERNAME=your_username \
  -e SPRING_DATASOURCE_PASSWORD=your_password \
  medically-backend
```

## Environment Variables

### Database Configuration
- `SPRING_DATASOURCE_URL` - Database connection URL
- `SPRING_DATASOURCE_USERNAME` - Database username
- `SPRING_DATASOURCE_PASSWORD` - Database password

### JWT Configuration
- `JWT_SECRET` - JWT signing secret (default: mySecretKey)
- `JWT_EXPIRATION` - JWT expiration time in milliseconds (default: 86400000)

### Email Configuration
- `MAIL_HOST` - SMTP server host (default: smtp.gmail.com)
- `MAIL_PORT` - SMTP server port (default: 587)
- `MAIL_USERNAME` - Email username
- `MAIL_PASSWORD` - Email password or app password

## Services

### Application (medically_app)
- **Port**: 8080
- **Health Check**: http://localhost:8080/actuator/health
- **API Documentation**: http://localhost:8080/swagger-ui.html

### MySQL Database (medically_mysql)
- **Port**: 3306
- **Database**: medically_db
- **Username**: medically_user
- **Password**: medically_password
- **Root Password**: root

## Useful Commands

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f mysql
```

### Stop services
```bash
docker-compose down

# Stop and remove volumes (WARNING: This will delete all data)
docker-compose down -v
```

### Restart services
```bash
docker-compose restart
docker-compose restart app
```

### Access MySQL directly
```bash
docker-compose exec mysql mysql -u medically_user -p medically_db
# Password: medically_password
```

### Execute commands in app container
```bash
docker-compose exec app bash
```

## Health Checks

The application includes health checks that monitor:
- Application startup status
- Database connectivity
- Overall application health

Access health information at: http://localhost:8080/actuator/health

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Check what's using the port
   netstat -an | grep :8080
   netstat -an | grep :3306
   
   # Change ports in docker-compose.yml if needed
   ```

2. **Database connection issues**
   ```bash
   # Check if MySQL is healthy
   docker-compose ps
   
   # View MySQL logs
   docker-compose logs mysql
   ```

3. **Application won't start**
   ```bash
   # Check application logs
   docker-compose logs app
   
   # Restart the application
   docker-compose restart app
   ```

4. **Out of memory errors**
   ```bash
   # Adjust JVM memory in docker-compose.yml
   environment:
     JAVA_OPTS: "-Xmx1g -Xms512m"
   ```

### Clean Start
```bash
# Stop everything and clean up
docker-compose down -v
docker system prune -f

# Rebuild and start fresh
docker-compose up --build
```

## Development vs Production

### Development Setup
- Uses volume mounts for live reloading
- Enables debug logging
- Includes development tools

### Production Setup
- Multi-stage build for optimized image size
- Non-root user for security
- Production-ready JVM settings
- Health checks enabled

## Security Considerations

1. **Environment Variables**: Store sensitive data in environment variables, not in configuration files
2. **Non-root User**: The application runs as a non-root user (`spring`) inside the container
3. **Network**: Services communicate through a dedicated Docker network
4. **Secrets**: Use Docker secrets or external secret management for production

## Performance Tuning

### JVM Options
Adjust `JAVA_OPTS` in docker-compose.yml:
```yaml
environment:
  JAVA_OPTS: "-Xmx1g -Xms512m -XX:+UseG1GC -XX:MaxGCPauseMillis=200"
```

### Database Connection Pool
Configured in `application-docker.properties`:
- Maximum pool size: 10
- Minimum idle: 5
- Connection timeout: 20s

## Monitoring

Access application metrics and health:
- Health: http://localhost:8080/actuator/health
- Info: http://localhost:8080/actuator/info

For production, consider adding:
- Prometheus metrics
- Log aggregation
- Application Performance Monitoring (APM) 