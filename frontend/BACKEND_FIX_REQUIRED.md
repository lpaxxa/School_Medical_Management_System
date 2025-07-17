# 🔧 Backend Fix Required - AuthController

## ❌ Root Cause Found

Trong `AuthController.java`, `frontendUrl` đang được hardcode:

```java
String frontendUrl = "http://localhost:5173/auth/oauth2/callback";
```

Đây chính là nguyên nhân gây ra redirect về localhost!

## ✅ Backend Fix Required

### 1. Update AuthController.java

**File**: `src/main/java/com/fpt/medically_be/controller/AuthController.java`

**Current Code (Lines ~85-86):**
```java
@GetMapping("/oauth2/success")
public RedirectView oauth2Success(
        @RequestParam(required = false) String code, 
        @RequestParam(required = false) String state, 
        @RequestParam(required = false) String error) {
    
    String frontendUrl = "http://localhost:5173/auth/oauth2/callback";  // ❌ HARDCODED
```

**Fixed Code:**
```java
@GetMapping("/oauth2/success")
public RedirectView oauth2Success(
        @RequestParam(required = false) String code, 
        @RequestParam(required = false) String state, 
        @RequestParam(required = false) String error,
        @RequestParam(required = false) String redirect_uri) {  // ✅ Accept redirect_uri
    
    // Use redirect_uri from frontend, fallback to environment variable
    String frontendUrl = redirect_uri != null ? redirect_uri : 
                        System.getenv("FRONTEND_CALLBACK_URL") != null ? 
                        System.getenv("FRONTEND_CALLBACK_URL") : 
                        "https://school-medical-management-system-red.vercel.app/auth/oauth2/callback";  // ✅ PRODUCTION DEFAULT
```

### 2. Also fix oauth2Failure method

**Current Code:**
```java
@GetMapping("/oauth2/failure")
public RedirectView oauth2Failure() {
    String frontendUrl = "http://localhost:5173/auth/oauth2/callback";  // ❌ HARDCODED
```

**Fixed Code:**
```java
@GetMapping("/oauth2/failure")
public RedirectView oauth2Failure(@RequestParam(required = false) String redirect_uri) {
    String frontendUrl = redirect_uri != null ? redirect_uri : 
                        System.getenv("FRONTEND_CALLBACK_URL") != null ? 
                        System.getenv("FRONTEND_CALLBACK_URL") : 
                        "https://school-medical-management-system-red.vercel.app/auth/oauth2/callback";  // ✅ PRODUCTION DEFAULT
```

### 3. Environment Variable Setup

**Add to application.properties or environment:**
```properties
FRONTEND_CALLBACK_URL=https://school-medical-management-system-red.vercel.app/auth/oauth2/callback
```

**Or set environment variable:**
```bash
export FRONTEND_CALLBACK_URL=https://school-medical-management-system-red.vercel.app/auth/oauth2/callback
```

## 🔄 Complete Fixed AuthController Methods

```java
@GetMapping("/oauth2/success")
public RedirectView oauth2Success(
        @RequestParam(required = false) String code, 
        @RequestParam(required = false) String state, 
        @RequestParam(required = false) String error,
        @RequestParam(required = false) String redirect_uri) {
    
    // Use redirect_uri from frontend, fallback to environment variable, then production default
    String frontendUrl = redirect_uri != null ? redirect_uri : 
                        System.getenv("FRONTEND_CALLBACK_URL") != null ? 
                        System.getenv("FRONTEND_CALLBACK_URL") : 
                        "https://school-medical-management-system-red.vercel.app/auth/oauth2/callback";
    
    if (error != null) {
        logger.warning("OAuth2 login failed: " + error);
        return new RedirectView(frontendUrl + "?error=" + URLEncoder.encode(error, StandardCharsets.UTF_8));
    }

    try {
        AccountMember accountMember = authService.processOAuth2Callback(code, state);
        if (accountMember == null) {
            logger.warning("OAuth2 login failed: No account found. User must be created by admin first.");
            String errorMessage = "Your Google account is not registered. Please contact admin to create your account.";
            return new RedirectView(frontendUrl + "?error=" + URLEncoder.encode(errorMessage, StandardCharsets.UTF_8));
        }

        // Generate JWT token
        String token = jwtService.generateToken(
                accountMember.getId(),
                accountMember.getEmail(),
                accountMember.getPhoneNumber(),
                accountMember.getRole()
        );

        // Redirect to frontend with user data
        String redirectUrl = String.format(
            "%s?token=%s&memberId=%s&email=%s&role=%s&phoneNumber=%s",
            frontendUrl,
            URLEncoder.encode(token, StandardCharsets.UTF_8),
            URLEncoder.encode(accountMember.getId(), StandardCharsets.UTF_8),
            URLEncoder.encode(accountMember.getEmail(), StandardCharsets.UTF_8),
            URLEncoder.encode(accountMember.getRole().name(), StandardCharsets.UTF_8),
            URLEncoder.encode(accountMember.getPhoneNumber() != null ? accountMember.getPhoneNumber() : "", StandardCharsets.UTF_8)
        );
        
        logger.info("OAuth2 login successful, redirecting to: " + redirectUrl);
        return new RedirectView(redirectUrl);
        
    } catch (Exception e) {
        logger.warning("OAuth2 processing error: " + e.getMessage());
        String errorMessage = "OAuth2 authentication failed: " + e.getMessage();
        return new RedirectView(frontendUrl + "?error=" + URLEncoder.encode(errorMessage, StandardCharsets.UTF_8));
    }
}

@GetMapping("/oauth2/failure")
public RedirectView oauth2Failure(@RequestParam(required = false) String redirect_uri) {
    String frontendUrl = redirect_uri != null ? redirect_uri : 
                        System.getenv("FRONTEND_CALLBACK_URL") != null ? 
                        System.getenv("FRONTEND_CALLBACK_URL") : 
                        "https://school-medical-management-system-red.vercel.app/auth/oauth2/callback";
    
    String errorMessage = "OAuth2 authentication failed";
    logger.warning("OAuth2 authentication failed, redirecting to frontend");
    return new RedirectView(frontendUrl + "?error=" + URLEncoder.encode(errorMessage, StandardCharsets.UTF_8));
}
```

## 🚀 Deployment Steps

### 1. Update Backend Code
- Fix `AuthController.java` với code trên
- Set environment variable `FRONTEND_CALLBACK_URL`
- Build và deploy backend

### 2. Test Flow
1. Frontend gửi request với `redirect_uri` parameter
2. Backend sử dụng `redirect_uri` thay vì hardcoded localhost
3. OAuth success → redirect về production URL
4. Frontend xử lý token thành công

## 🔍 Verification

**Before Fix:**
```
OAuth success → http://localhost:5173/auth/oauth2/callback?token=...
```

**After Fix:**
```
OAuth success → https://school-medical-management-system-red.vercel.app/auth/oauth2/callback?token=...
```

## ⚡ Quick Fix Alternative

Nếu không thể update backend ngay, frontend solution (LocalhostRedirectHandler) vẫn sẽ hoạt động như một workaround tạm thời.

## 📋 Priority

1. **High Priority**: Fix backend để có solution lâu dài
2. **Immediate**: Frontend solution đã sẵn sàng để deploy ngay

---

**Root cause**: Hardcoded localhost URL trong backend  
**Solution**: Dynamic redirect_uri handling + environment variable fallback
