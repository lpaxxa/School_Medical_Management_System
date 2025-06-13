# Frontend - Medical School Management System

This is the frontend application for the Medical School Management System, built with React and Vite.

## JWT Authentication Setup

The frontend is now configured to use JWT authentication with the backend API.

### Environment Configuration

Create a `.env` file in the frontend directory with the following content:

```env
# Backend API Configuration
VITE_API_URL=http://localhost:8080/api/v1

# Development settings
VITE_NODE_ENV=development
```

### Authentication Features

- ✅ JWT token storage in localStorage
- ✅ Automatic token attachment to API requests
- ✅ Token expiration handling with automatic logout
- ✅ Role-based routing protection
- ✅ Real backend authentication integration

### Test Accounts

Default test accounts (configure these in your backend):
- **Admin:** admin / 123456
- **Nurse:** nurse / 123456  
- **Parent:** parent / 123456

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with backend URL (see above)

3. Make sure backend is running on `http://localhost:8080`

4. Start development server:
```bash
npm run dev
```

## API Integration

The frontend communicates with the Spring Boot backend using:
- **Login endpoint:** `POST /api/v1/auth/login`
- **JWT tokens** for authentication
- **Automatic token refresh** on 401 errors

Make sure your backend is running before starting the frontend application.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
