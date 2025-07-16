# Environment Configuration Guide

This guide explains how to configure your frontend application to connect to different backend environments (local development, staging, production).

## Environment Files

### `.env.local` - Local Development
- Used for local development
- Contains localhost URLs for backend services
- Not committed to version control

### `.env.production` - Production Deployment
- Used for production builds
- Contains production URLs for backend services
- Should be configured with your deployed backend URLs

### `.env.example` - Example Configuration
- Template file showing required environment variables
- Copy this file to create your own environment configuration

## Setup Instructions

### For Local Development:

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your local backend URL:
   ```env
   VITE_API_BASE_URL=http://localhost:8080/api/v1
   VITE_BACKEND_URL=http://localhost:8080
   ```

### For Production Deployment:

1. Update `.env.production` with your deployed backend URLs:
   ```env
   VITE_API_BASE_URL=https://your-backend-domain.com/api/v1
   VITE_BACKEND_URL=https://your-backend-domain.com
   ```

2. Configure Google OAuth (if using):
   ```env
   VITE_GOOGLE_CLIENT_ID=your-production-google-client-id
   VITE_GOOGLE_REDIRECT_URI=https://your-frontend-domain.com/auth/oauth2/callback
   ```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `https://api.yourapp.com/api/v1` |
| `VITE_BACKEND_URL` | Backend root URL | `https://api.yourapp.com` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID | `your-google-client-id` |
| `VITE_GOOGLE_REDIRECT_URI` | OAuth redirect URI | `https://yourapp.com/auth/oauth2/callback` |
| `NODE_ENV` | Environment mode | `development` or `production` |

## API Configuration

The application uses a centralized API configuration file located at `src/config/apiConfig.js`. This file:

- Reads environment variables to determine API URLs
- Provides centralized endpoint definitions
- Includes helper functions for authentication headers
- Maintains backward compatibility with existing code

## Usage in Code

### Import the API configuration:
```javascript
import { API_ENDPOINTS, getAuthHeaders } from '../config/apiConfig';
```

### Use predefined endpoints:
```javascript
// Instead of hardcoded URLs
const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/students');

// Use the configuration
const response = await fetch(API_ENDPOINTS.STUDENTS.GET_ALL, {
  headers: getAuthHeaders()
});
```

### Dynamic endpoints:
```javascript
// Get user by ID
const userId = 123;
const response = await fetch(API_ENDPOINTS.USERS.GET_BY_ID(userId), {
  headers: getAuthHeaders()
});
```

## Build Commands

### Development Build:
```bash
npm run dev
```
Uses `.env.local` if present, otherwise falls back to `.env.development`

### Production Build:
```bash
npm run build
```
Uses `.env.production` for production builds

## Vite Proxy Configuration

The `vite.config.js` file includes proxy configuration for development:

```javascript
server: {
  proxy: {
    '/api': {
      target: `${import.meta.env.VITE_BACKEND_URL}',
      changeOrigin: true,
    }
  }
}
```

This allows API calls to `/api/*` to be proxied to your backend during development, avoiding CORS issues.

## Common Deployment Scenarios

### 1. Local Development
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`
- Configuration: Use `.env.local`

### 2. Staging Environment
- Frontend: `https://staging.yourapp.com`
- Backend: `https://staging-api.yourapp.com`
- Configuration: Create `.env.staging`

### 3. Production Environment
- Frontend: `https://yourapp.com`
- Backend: `https://api.yourapp.com`
- Configuration: Use `.env.production`

## Security Notes

1. **Never commit sensitive data** like API keys to version control
2. **Use different OAuth credentials** for different environments
3. **Enable HTTPS** in production environments
4. **Configure CORS** properly on your backend
5. **Set appropriate timeout values** for production

## Troubleshooting

### Common Issues:

1. **API calls failing**: Check if `VITE_API_BASE_URL` is correct
2. **OAuth not working**: Verify `VITE_GOOGLE_CLIENT_ID` and redirect URI
3. **CORS errors**: Ensure backend CORS configuration allows your frontend domain
4. **404 errors**: Check if API endpoints match backend routes

### Debug Tips:

1. Check browser console for error messages
2. Verify environment variables are loaded: `console.log(import.meta.env)`
3. Test API endpoints directly with tools like Postman
4. Check backend logs for server-side errors

## Migration Guide

If you're updating from hardcoded URLs to environment variables:

1. Install the new configuration files
2. Update your service files to use `API_ENDPOINTS`
3. Replace hardcoded URLs with environment-based URLs
4. Test all API functionality
5. Update deployment processes to use environment files

## Support

For additional help:
- Check the `src/config/apiConfig.js` file for all available endpoints
- Review existing service files for usage examples
- Consult the backend API documentation for endpoint details
