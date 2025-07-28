// Google OAuth2 Configuration
import sessionService from './sessionService';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id';
const GOOGLE_REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI || 'https://school-medical-management-system-red.vercel.app/auth/oauth2/callback';
const BACKEND_OAUTH_URL = import.meta.env.VITE_BACKEND_URL || `${import.meta.env.VITE_BACKEND_URL}`;

class GoogleAuthService {
  /**
   * Khởi tạo đăng nhập Google bằng cách redirect đến backend OAuth2 endpoint
   */
  initiateGoogleLogin() {
    try {
      // Redirect đến backend OAuth2 authorization endpoint với redirect_uri parameter
      const oauthUrl = `${BACKEND_OAUTH_URL}/oauth2/authorization/google?redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}`;
      console.log('🔄 Redirecting to Google OAuth:', oauthUrl);
      console.log('🔄 Redirect URI:', GOOGLE_REDIRECT_URI);
      window.location.href = oauthUrl;
    } catch (error) {
      console.error('❌ Error initiating Google login:', error);
      throw new Error('Không thể khởi tạo đăng nhập Google');
    }
  }

  /**
   * Xử lý phản hồi từ Google OAuth callback
   * @param {string} token - JWT token từ backend
   * @param {object} userInfo - Thông tin user từ backend
   */
  handleOAuthCallback(token, userInfo) {
    try {
      // Tạo user object với format phù hợp
      const user = {
        id: userInfo.id || userInfo.memberId,
        email: userInfo.email,
        role: userInfo.role?.toLowerCase() || 'parent',
        fullName: userInfo.name || userInfo.fullName,
        phoneNumber: userInfo.phoneNumber || '',
        avatar: userInfo.picture || userInfo.avatar,
        provider: 'google'
      };

      // Lưu token và user data sử dụng sessionService
      const success = sessionService.setAuthData(
        token,
        user,
        false, // rememberMe = false for OAuth
        null   // no refresh token from OAuth
      );

      if (!success) {
        throw new Error('Failed to store OAuth session data');
      }
      
      console.log('✅ Google OAuth callback processed successfully:', user);
      return user;
    } catch (error) {
      console.error('❌ Error processing OAuth callback:', error);
      throw new Error('Lỗi xử lý phản hồi đăng nhập Google');
    }
  }

  /**
   * Đăng xuất và xóa thông tin Google OAuth
   */
  logout() {
    try {
      // Xóa thông tin đăng nhập sử dụng sessionService
      sessionService.clearSession();

      console.log('✅ Google OAuth logout completed');
    } catch (error) {
      console.error('❌ Error during Google logout:', error);
    }
  }

  /**
   * Kiểm tra xem có đang trong quá trình OAuth callback không
   */
  isOAuthCallback() {
    return window.location.pathname === '/auth/oauth2/callback';
  }

  /**
   * Lấy thông tin lỗi từ URL parameters (nếu có)
   */
  getOAuthError() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('error');
  }
}

// Export singleton instance
const googleAuthService = new GoogleAuthService();
export default googleAuthService; 