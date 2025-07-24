import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    // Add proxy configuration to route API requests through same origin
    server: {
      proxy: {
        '/api': {
          target: env.VITE_BACKEND_URL || 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
          // You can add any additional headers or rewrite path logic here
        }
      }
    },
    // Define environment variables that will be available to your app
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    },
    // Build configuration
    build: {
      // Generate source maps for production debugging
      sourcemap: mode === 'development',
      // Optimize bundle size
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            utils: ['axios', 'lodash']
          }
        }
      }
    }
  }
})
