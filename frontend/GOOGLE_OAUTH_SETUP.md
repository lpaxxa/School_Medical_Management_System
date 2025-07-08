# Hướng Dẫn Cấu Hình Google OAuth

## 1. Tạo Google OAuth2 Application

### Bước 1: Truy cập Google Cloud Console

1. Đến [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Đảm bảo Google+ API được bật

### Bước 2: Tạo OAuth2 Credentials

1. Vào **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Chọn **Application type**: Web application
4. Đặt tên cho OAuth client
5. Thêm **Authorized redirect URIs**:
   - `http://localhost:8080/auth/oauth2/callback` (cho backend)
   - `http://localhost:3000/auth/oauth2/callback` (cho frontend - backup)

### Bước 3: Lấy Client ID và Client Secret

- Copy **Client ID** và **Client Secret** để cấu hình backend

## 2. Cấu Hình Backend (Spring Boot)

### application.yml hoặc application.properties

```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: ${GOOGLE_CLIENT_ID}
            client-secret: ${GOOGLE_CLIENT_SECRET}
            scope:
              - email
              - profile
            redirect-uri: "{baseUrl}/auth/oauth2/callback"
        provider:
          google:
            authorization-uri: https://accounts.google.com/o/oauth2/auth
            token-uri: https://www.googleapis.com/oauth2/v3/token
            user-info-uri: https://www.googleapis.com/oauth2/v3/userinfo
```

### OAuth2 Success Handler (Java)

Tạo handler để xử lý success callback và redirect về frontend với token:

```java
@Component
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                      HttpServletResponse response,
                                      Authentication authentication) throws IOException {

        // Tạo JWT token cho user
        String token = jwtTokenProvider.generateToken(authentication);

        // Lấy thông tin user
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        String userJson = objectMapper.writeValueAsString(oauth2User.getAttributes());

        // Redirect về frontend với token và user info
        String redirectUrl = String.format(
            "http://localhost:3000/auth/oauth2/callback?token=%s&user=%s",
            token,
            URLEncoder.encode(userJson, StandardCharsets.UTF_8)
        );

        response.sendRedirect(redirectUrl);
    }
}
```

## 3. Cấu Hình Frontend

### Environment Variables

Tạo file `.env` trong root của frontend:

```env
# Backend API Configuration
VITE_BACKEND_URL=http://localhost:8080

# Google OAuth2 Configuration
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
VITE_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/oauth2/callback

# API Configuration
VITE_API_URL=http://localhost:8080/api/v1
```

**⚠️ Lưu ý:**

- Thay `your-google-client-id-here` bằng Client ID thực từ Google Cloud Console
- Trong Vite, environment variables phải có prefix `VITE_` thay vì `REACT_APP_`

## 4. Luồng Hoạt Động

1. **User click "Đăng nhập với Google"** → `googleAuthService.initiateGoogleLogin()`
2. **Redirect đến Google OAuth** → `http://localhost:8080/oauth2/authorization/google`
3. **User đăng nhập Google** → Google redirect về backend callback
4. **Backend xử lý** → Tạo JWT token và redirect về frontend
5. **Frontend xử lý callback** → `OAuthCallback` component nhận token
6. **Lưu user info** → Redirect đến trang phù hợp theo role

## 5. Cấu Trúc Files

```
src/
├── services/
│   └── googleAuthService.js      # Xử lý OAuth logic
├── components/
│   └── OAuthCallback.jsx         # Xử lý callback từ Google
├── context/
│   └── AuthContext.jsx           # Context quản lý authentication
└── Pages/
    └── Login.jsx                 # Trang đăng nhập với Google button
```

## 6. Troubleshooting

### Lỗi thường gặp:

1. **"Invalid redirect URI"**

   - Kiểm tra redirect URI trong Google Console khớp với backend
   - Đảm bảo không có trailing slash

2. **"Token not received"**

   - Kiểm tra backend có tạo và gửi token đúng format không
   - Xem console browser để debug

3. **"CORS Error"**
   - Cấu hình CORS trong backend cho phép frontend domain

### Debug:

- Mở Developer Tools → Console để xem logs chi tiết
- Kiểm tra Network tab để xem requests/responses
- Xem backend logs để debug authentication flow

## 7. Security Notes

- **Không commit** Client Secret vào Git
- Sử dụng environment variables cho production
- Cấu hình HTTPS cho production environment
- Validate và sanitize user data từ Google OAuth response
