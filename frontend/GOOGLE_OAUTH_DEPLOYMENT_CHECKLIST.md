# Google OAuth Deployment Checklist

## ✅ Frontend Changes Completed

- [x] Cập nhật `.env` với production URLs
- [x] Cập nhật `.env.production` với production URLs  
- [x] Cập nhật `.env.local` với production URLs
- [x] Sửa `googleAuthService.js` để truyền redirect_uri parameter
- [x] Cập nhật `apiConfig.js` với default production URL
- [x] Test cấu hình với script test

## 🔧 Backend Configuration Required

### 1. Accept Dynamic Redirect URI
Backend cần được cấu hình để nhận và sử dụng `redirect_uri` parameter từ frontend.

**Spring Security Configuration Example:**
```java
@Configuration
public class OAuth2Config {
    
    @Bean
    public OAuth2AuthorizedClientService authorizedClientService() {
        // Configure to accept dynamic redirect URI
    }
    
    // Handle redirect_uri parameter in OAuth2 success handler
    @Component
    public class OAuth2AuthenticationSuccessHandler 
        implements AuthenticationSuccessHandler {
        
        @Override
        public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException {
            
            String redirectUri = request.getParameter("redirect_uri");
            if (redirectUri != null) {
                // Use this redirect URI instead of default
                response.sendRedirect(redirectUri + "?token=" + token + "&user=" + userData);
            }
        }
    }
}
```

### 2. CORS Configuration
Đảm bảo backend cho phép frontend domain:

```java
@Configuration
public class CorsConfig {
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.addAllowedOrigin("https://school-medical-management-system-red.vercel.app");
        configuration.addAllowedMethod("*");
        configuration.addAllowedHeader("*");
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

## 🌐 Google OAuth Console Configuration

### 1. Authorized Redirect URIs
Thêm các URL sau vào Google OAuth Console:

**Backend Callback (for Google):**
```
https://medically-backend.southeastasia.cloudapp.azure.com/auth/oauth2/callback
```

**Frontend Callback (for final redirect):**
```
https://school-medical-management-system-red.vercel.app/auth/oauth2/callback
```

### 2. Authorized JavaScript Origins
```
https://school-medical-management-system-red.vercel.app
https://medically-backend.southeastasia.cloudapp.azure.com
```

## 🚀 Deployment Steps

### 1. Frontend Deployment
```bash
# Commit changes
git add .
git commit -m "Fix Google OAuth redirect URLs for production"
git push origin main

# Vercel will auto-deploy
```

### 2. Backend Deployment
- Deploy backend với OAuth2 configuration mới
- Đảm bảo environment variables được set đúng
- Test OAuth endpoint manually

### 3. Environment Variables Check
Đảm bảo các biến sau được set trong production:

**Frontend (Vercel):**
```
VITE_API_BASE_URL=https://medically-backend.southeastasia.cloudapp.azure.com/api/v1
VITE_BACKEND_URL=https://medically-backend.southeastasia.cloudapp.azure.com
VITE_GOOGLE_REDIRECT_URI=https://school-medical-management-system-red.vercel.app/auth/oauth2/callback
VITE_GOOGLE_CLIENT_ID=your-actual-google-client-id
```

**Backend:**
```
GOOGLE_OAUTH_CLIENT_ID=your-actual-google-client-id
GOOGLE_OAUTH_CLIENT_SECRET=your-actual-google-client-secret
FRONTEND_URL=https://school-medical-management-system-red.vercel.app
```

## 🧪 Testing Steps

### 1. Manual Testing
1. Mở https://school-medical-management-system-red.vercel.app/login
2. Click "Đăng nhập với Google"
3. Kiểm tra URL redirect có đúng không
4. Complete Google OAuth flow
5. Kiểm tra có redirect về frontend không
6. Kiểm tra token có được nhận không

### 2. Debug Tools
- Browser Developer Tools → Network tab
- Check console logs for errors
- Verify redirect URLs in network requests

### 3. Backend Logs
- Check backend logs for OAuth requests
- Verify redirect_uri parameter is received
- Check for any CORS errors

## 🔍 Troubleshooting

### Common Issues:

1. **Still redirecting to localhost**
   - Check environment variables in production
   - Verify backend is using dynamic redirect URI
   - Clear browser cache

2. **CORS errors**
   - Update backend CORS configuration
   - Check allowed origins include frontend domain

3. **Google OAuth errors**
   - Verify redirect URIs in Google Console
   - Check client ID is correct
   - Ensure domains are authorized

4. **Token not received**
   - Check backend OAuth success handler
   - Verify token is included in redirect URL
   - Check URL parameter encoding

## 📞 Next Steps After Deployment

1. Test Google OAuth flow end-to-end
2. Monitor error logs for any issues
3. Update documentation with final URLs
4. Inform team about changes
