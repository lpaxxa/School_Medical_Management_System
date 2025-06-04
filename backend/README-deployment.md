# Deployment Guide

This application can be run in two modes: **Local Development** and **Docker**.

## 🖥️ Local Development Mode

### Prerequisites:
- Java 21 installed
- Local MySQL server running on `localhost:3306`
- Database: `student_db`
- User: `root` / Password: `123456`

### Run locally:
```bash
# Using Maven wrapper
./mvnw spring-boot:run

# Or using your IDE
# Just run the main class: MedicallyBeApplication
```

**Configuration used:** `application.properties`
- Database: `jdbc:mysql://localhost:3306/student_db`
- Credentials: `root/123456`

---

## 🐳 Docker Mode

### Prerequisites:
- Docker and Docker Compose installed

### Run with Docker:
```bash
# Clean start (removes all containers and volumes)
docker-compose down -v

# Build and start both MySQL and app
docker-compose up --build

# Run in background
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

**Configuration used:** `application-docker.properties` + environment variables
- Database: `jdbc:mysql://mysql:3306/medically_db` 
- Credentials: `medically_user/medically_password`
- MySQL runs in container with persistent volume

---

## 🔄 Switching Between Modes

### Local → Docker:
1. Stop your local Spring Boot app
2. Your local MySQL can keep running (different port mapping)
3. Run: `docker-compose up --build`

### Docker → Local:
1. Stop Docker: `docker-compose down`
2. Make sure local MySQL is running
3. Run locally: `./mvnw spring-boot:run`

---

## 🗄️ Database Differences

| Mode | Database Name | User | Password | Host |
|------|---------------|------|----------|------|
| **Local** | `student_db` | `root` | `123456` | `localhost:3306` |
| **Docker** | `medically_db` | `medically_user` | `medically_password` | `mysql:3306` (container) |

---

## 🐛 Troubleshooting

### Docker Issues:
```bash
# Clean everything and restart
docker-compose down -v
docker system prune -f
docker-compose up --build

# Check logs
docker-compose logs mysql
docker-compose logs app
```

### Local Issues:
- Make sure MySQL is running: `brew services start mysql` (macOS) or `sudo systemctl start mysql` (Linux)
- Check connection: `mysql -u root -p123456 -h localhost`

---

## 📝 Development Tips

- **Local development**: Faster startup, easier debugging
- **Docker**: Test production-like environment, database isolation
- Both modes can run simultaneously on different ports if needed 