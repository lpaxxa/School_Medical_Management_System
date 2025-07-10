// Google OAuth2 Configuration
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id';
const GOOGLE_REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/oauth2/callback';
const BACKEND_OAUTH_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

class GoogleAuthService {
  /**
   * Khởi tạo đăng nhập Google bằng cách redirect đến backend OAuth2 endpoint
   */
  initiateGoogleLogin() {
    try {
      // Redirect đến backend OAuth2 authorization endpoint
      const oauthUrl = `${BACKEND_OAUTH_URL}/oauth2/authorization/google`;
      console.log('🔄 Redirecting to Google OAuth:', oauthUrl);
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
      // Lưu token vào localStorage
      localStorage.setItem('authToken', token);
      
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

      // Lưu thông tin user
      localStorage.setItem('userData', JSON.stringify(user));
      
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
      // Xóa thông tin đăng nhập
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      
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