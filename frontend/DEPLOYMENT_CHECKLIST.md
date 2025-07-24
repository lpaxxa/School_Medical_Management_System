# 🚀 Deployment Checklist - API Configuration

## ✅ **Đã hoàn thành:**

### 1. **Environment Variables Configuration**
- ✅ `.env` - Production URLs (sẽ được sử dụng khi deploy)
- ✅ `.env.production` - Production URLs backup
- ✅ `.env.local` - Local development URLs
- ✅ `.env.example` - Template file (đã sửa syntax error)

### 2. **API Configuration Files**
- ✅ `src/config/apiConfig.js` - Centralized API endpoints với fallback đúng
- ✅ `src/services/api.js` - Base API service với environment variables
- ✅ `src/services/notificationService.js` - Sử dụng environment variables
- ✅ `vite.config.js` - Proxy configuration với fallback đúng

### 3. **Source Code Files**
- ✅ Tất cả files trong `src/` đã sử dụng `import.meta.env.VITE_BACKEND_URL`
- ✅ Không còn hardcode localhost trong source code
- ✅ HealthDeclaration.jsx đã sửa lỗi API endpoint

### 4. **Deployment Configuration**
- ✅ `vercel.json` - API rewrites cho production backend
- ✅ `LocalhostRedirectHandler.jsx` - Handle OAuth redirects

## 🔧 **Environment Variables Summary:**

### Development (.env.local):
```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_BACKEND_URL=http://localhost:8080
```

### Production (.env):
```env
VITE_API_BASE_URL=https://medically-backend.southeastasia.cloudapp.azure.com/api/v1
VITE_BACKEND_URL=https://medically-backend.southeastasia.cloudapp.azure.com
```

## 🎯 **Khi deploy lên web:**

1. **Vite sẽ tự động sử dụng `.env` file** (production URLs)
2. **Tất cả API calls sẽ trỏ đến production backend**
3. **Vercel rewrites sẽ proxy API requests đúng cách**
4. **Không có lỗi localhost trong production build**

## 🧪 **Test Commands:**

### Local Development:
```bash
npm run dev
# Sử dụng .env.local (localhost URLs)
```

### Production Build:
```bash
npm run build
# Sử dụng .env (production URLs)
```

### Preview Production Build:
```bash
npm run preview
# Test production build locally
```

## 🔍 **Verification Steps:**

1. ✅ Build thành công không có lỗi
2. ✅ Không có hardcode localhost trong dist/
3. ✅ API calls sử dụng production URLs
4. ✅ Environment variables được load đúng

## 🚨 **Important Notes:**

- **Vite sẽ tự động chọn file .env phù hợp** dựa trên build mode
- **Production build sẽ sử dụng .env (production URLs)**
- **Development sẽ sử dụng .env.local (localhost URLs)**
- **Vercel rewrites đảm bảo API calls hoạt động trên production**

## ✅ **Ready for Deployment!**

Codebase đã sẵn sàng để deploy lên web mà không gặp lỗi API localhost! 🎉
