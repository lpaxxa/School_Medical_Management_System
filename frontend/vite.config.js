import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],  server: {
    proxy: {
      // Cấu hình proxy cho tất cả các API calls
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    },
    // Hiển thị thông báo lỗi đầy đủ hơn
    hmr: {
      overlay: true
    }
  }
});
