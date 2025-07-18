# Google OAuth Redirect Fixes

## Vấn đề đã được sửa

Khi đăng nhập Google thành công, hệ thống chuyển hướng về localhost thay vì URL thực tế của website đã deploy.

## Nguyên nhân

1. **Cấu hình Environment Variables sai**: Các file `.env` vẫn đang trỏ về `localhost:8080` thay vì URL backend thực tế
2. **Redirect URI không đúng**: Backend được cấu hình để redirect về localhost thay vì frontend URL thực tế
3. **Thiếu truyền redirect_uri parameter**: Frontend không truyền redirect URI cho backend

## Các thay đổi đã thực hiện

### 1. Cập nhật Environment Variables

**File: `.env`**
```env
VITE_API_BASE_URL=https://medically-backend.southeastasia.cloudapp.azure.com/api/v1
VITE_BACKEND_URL=https://medically-backend.southeastasia.cloudapp.azure.com
VITE_GOOGLE_REDIRECT_URI=https://school-medical-management-system-red.vercel.app/auth/oauth2/callback
```

**File: `.env.production`**
```env
VITE_API_BASE_URL=https://medically-backend.southeastasia.cloudapp.azure.com/api/v1
VITE_BACKEND_URL=https://medically-backend.southeastasia.cloudapp.azure.com
VITE_GOOGLE_REDIRECT_URI=https://school-medical-management-system-red.vercel.app/auth/oauth2/callback
```

**File: `.env.local`**
```env
VITE_API_BASE_URL=https://medically-backend.southeastasia.cloudapp.azure.com/api/v1
VITE_BACKEND_URL=https://medically-backend.southeastasia.cloudapp.azure.com
VITE_GOOGLE_REDIRECT_URI=https://medically-backend.southeastasia.cloudapp.azure.com/auth/oauth2/callback
```

### 2. Cập nhật Google Auth Service

**File: `src/services/googleAuthService.js`**
- Thêm redirect_uri parameter khi redirect đến backend OAuth endpoint
- Thêm logging để debug redirect URI

### 3. Cập nhật API Config

**File: `src/config/apiConfig.js`**
- Cập nhật default redirect URI từ localhost sang production URL

## OAuth Flow đã được sửa

1. **Frontend**: User click "Đăng nhập với Google"
2. **Frontend**: Redirect đến `${BACKEND_URL}/oauth2/authorization/google?redirect_uri=${FRONTEND_CALLBACK_URL}`
3. **Backend**: Redirect đến Google OAuth với backend callback URL
4. **Google**: User authorize và redirect về backend callback
5. **Backend**: Xử lý authorization code và redirect về frontend với token
6. **Frontend**: `OAuthCallback.jsx` nhận token và redirect đến dashboard

## Cần làm thêm ở Backend

Backend cần được cấu hình để:

1. **Nhận redirect_uri parameter** từ frontend
2. **Sử dụng redirect_uri** để redirect về frontend sau khi xử lý OAuth
3. **Đảm bảo CORS** cho phép frontend domain

### Cấu hình Spring Security OAuth2 (Backend)

```java
// application.yml hoặc application.properties
spring:
  security:
    oauth2:
      client:
        registration:
          google:
            redirect-uri: "{baseUrl}/auth/oauth2/callback"
            # Hoặc dynamic redirect URI handling
```

## Cách Deploy

1. **Commit và push** các thay đổi
2. **Redeploy frontend** trên Vercel
3. **Kiểm tra backend** có nhận redirect_uri parameter không
4. **Test Google OAuth** với URL thực tế

## Kiểm tra sau khi deploy

1. Mở Developer Tools → Network tab
2. Click "Đăng nhập với Google"
3. Kiểm tra redirect URL có đúng không
4. Kiểm tra backend có nhận được redirect_uri parameter không
5. Kiểm tra sau khi OAuth thành công có redirect về frontend URL đúng không

## Lưu ý quan trọng

- **Google OAuth Console**: Cần thêm frontend URL vào Authorized redirect URIs
- **Backend Configuration**: Cần cấu hình để accept dynamic redirect URI
- **Environment Variables**: Đảm bảo production build sử dụng đúng env variables
