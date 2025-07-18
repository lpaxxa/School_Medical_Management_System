import React, { useEffect } from 'react';

/**
 * Component để handle redirect từ localhost về production URL
 * Sử dụng khi backend redirect về localhost thay vì production URL
 */
const LocalhostRedirectHandler = () => {
  useEffect(() => {
    const handleLocalhostRedirect = () => {
      const currentUrl = window.location.href;
      const currentOrigin = window.location.origin;
      
      // Kiểm tra nếu đang ở localhost và có OAuth parameters
      const isLocalhost = currentOrigin.includes('localhost') || currentOrigin.includes('127.0.0.1');
      const hasOAuthParams = currentUrl.includes('token=') || currentUrl.includes('code=') || currentUrl.includes('error=');
      
      if (isLocalhost && hasOAuthParams) {
        console.log('🔄 Detected localhost OAuth redirect, fixing URL...');
        console.log('Current URL:', currentUrl);
        
        // Production URL
        const productionOrigin = 'https://school-medical-management-system-red.vercel.app';
        
        // Replace localhost với production URL
        const fixedUrl = currentUrl.replace(currentOrigin, productionOrigin);
        
        console.log('🔄 Redirecting to production URL:', fixedUrl);
        
        // Redirect về production URL
        window.location.href = fixedUrl;
        return true;
      }
      
      return false;
    };

    // Check ngay lập tức
    const redirected = handleLocalhostRedirect();
    
    if (!redirected) {
      // Setup interval để check liên tục (trong trường hợp URL thay đổi)
      const intervalId = setInterval(() => {
        const redirected = handleLocalhostRedirect();
        if (redirected) {
          clearInterval(intervalId);
        }
      }, 1000);
      
      // Clear interval sau 30 giây
      setTimeout(() => {
        clearInterval(intervalId);
      }, 30000);
      
      return () => clearInterval(intervalId);
    }
  }, []);

  return null; // Component này không render gì
};

export default LocalhostRedirectHandler;
