# Developer Setup Checklist

## 🚀 Super Quick Start

### For Windows Users:
1. **Install Docker Desktop**: [Download here](https://desktop.docker.com/win/stable/Docker%20Desktop%20Installer.exe)
2. **Extract the project** to any folder
3. **Double-click `setup.bat`** and follow the prompts
4. **Done!** 🎉

### For Mac/Linux Users:
1. **Install Docker Desktop**: [Download here](https://www.docker.com/products/docker-desktop/)
2. **Extract the project** to any folder
3. **Open terminal** in the project folder
4. **Run**: `./setup.sh`
5. **Done!** 🎉

### Manual Setup (All Platforms):
```bash
# 1. Install Docker Desktop first
# 2. Open terminal/command prompt in project folder
# 3. Run these commands:

docker-compose up -d
```

## ✅ Verification

After setup, verify everything works:

1. **Check containers are running**:
   ```bash
   docker ps
   ```
   You should see `medically_app` and `medically_sqlserver`

2. **Test the application**:
   - Open browser: http://localhost:8081/actuator/health
   - Should return `{"status":"UP"}`

3. **If something's wrong**:
   ```bash
   # View logs
   docker logs medically_app
   
   # Restart everything
   docker-compose restart
   ```

## 📋 What You Need to Share

When sharing this project with other developers, include these files:

### Required Files:
- ✅ `src/` folder (all source code)
- ✅ `pom.xml` (Maven configuration)
- ✅ `Dockerfile` (container configuration)
- ✅ `docker-compose.yml` (multi-container setup)
- ✅ `README.md` (main documentation)
- ✅ `.mvn/` folder (Maven wrapper)
- ✅ `mvnw` and `mvnw.cmd` (Maven wrapper scripts)

### Helpful Files:
- ✅ `setup.bat` (Windows auto-setup)
- ✅ `setup.sh` (Mac/Linux auto-setup)
- ✅ `DEVELOPER_SETUP.md` (this file)
- ✅ `.gitignore` (exclude unnecessary files)

### DO NOT Share:
- ❌ `target/` folder (build artifacts)
- ❌ `.idea/` folder (IDE files)
- ❌ `*.log` files (logs)
- ❌ Local Docker volumes/data

## 🔧 Common Issues & Solutions

| Problem | Solution |
|---------|----------|
| "Docker not found" | Install Docker Desktop and ensure it's running |
| "Port 8081 in use" | Stop other applications or change port in docker-compose.yml |
| "Connection failed" | Wait 60 seconds after startup, then check `docker logs medically_app` |
| "Permission denied" | On Mac/Linux: `chmod +x setup.sh` |

## 🌐 Sharing Methods

### Option 1: ZIP File
1. Create a ZIP of the entire `backend/` folder
2. Include this checklist
3. Share via email/drive

### Option 2: Git Repository
```bash
# Initialize git repo
git init
git add .
git commit -m "Initial commit"

# Push to GitHub/GitLab
git remote add origin <your-repo-url>
git push -u origin main
```

### Option 3: Network Sharing
- Run on your machine
- Others access via `http://YOUR_IP:8081`
- No Docker needed on their machines

## 📞 Support

If developers encounter issues:
1. Check Docker Desktop is running
2. Verify ports 8081 and 1434 are free
3. Try `docker-compose down && docker-compose up -d`
4. Check application logs: `docker logs medically_app -f` 