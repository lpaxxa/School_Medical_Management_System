# **Frontend Project Rules**

## **Thông tin dự án**

- **Framework**: ReactJS
- **Ngôn ngữ**: JavaScript/JSX
- **Package Manager**: npm
- **Build Tool**: Vite
- **CSS Framework**: Bootstrap
- **Tone màu chủ đạo cho page Admin**: linear-gradient(135deg, #1e293b 0%, #334155 100%)

---

## **1. Cấu trúc thư mục**

### **Quy tắc tổ chức file**

```
src/
├── components/          # Shared components
├── Pages/              # Page components theo role
│   ├── Admin/         # Admin pages và components
│   ├── Nurse/         # Nurse pages và components
│   └── Parent/        # Parent pages và components
├── context/           # React Context providers
├── services/          # API calls và external services
├── routes/           # Route configurations
├── styles/           # Global styles
├── assets/           # Static assets
└── mockData/         # Mock data cho development
```

### **Naming Convention**

- **Files**: PascalCase cho components (VaccinationPlan.jsx)
- **Folders**: camelCase cho utility, PascalCase cho components
- **Variables**: camelCase (vaccinationPlan, isLoading)
- **Constants**: UPPER_SNAKE_CASE (API_BASE_URL)
- **CSS Classes**: kebab-case (vaccination-plan, btn-primary)

---

## **2. Component Guidelines**

### **Component Structure**

```jsx
// imports
import React, { useState, useEffect } from "react";
import "./ComponentName.css";

// component
const ComponentName = ({ prop1, prop2 }) => {
  // hooks
  const [state, setState] = useState();

  // effects
  useEffect(() => {
    // logic
  }, []);

  // handlers
  const handleAction = () => {
    // logic
  };

  // render
  return <div className="component-name">{/* JSX */}</div>;
};

export default ComponentName;
```

### **Props Validation**

- Sử dụng PropTypes hoặc TypeScript để validate props
- Luôn có defaultProps cho optional props

### **File Organization**

- Mỗi major component có folder riêng
- Include component file + CSS file + index.js (nếu cần)
- Tên file component trùng với tên component

---

## **3. CSS & Styling Guidelines**

### **CSS Framework**

- **Primary**: Bootstrap 5.x
- **Custom CSS**: Chỉ khi Bootstrap không đáp ứng được

### **Color Palette - Admin Theme**

```css
/* Admin Primary Colors */
--admin-primary: linear-gradient(135deg, #1e293b 0%, #334155 100%);
--admin-dark: #1e293b;
--admin-light: #334155;
--admin-accent: #3b82f6;
--admin-success: #10b981;
--admin-warning: #f59e0b;
--admin-danger: #ef4444;

/* Text Colors */
--admin-text-primary: #f8fafc;
--admin-text-secondary: #cbd5e1;
--admin-text-muted: #94a3b8;
```

### **CSS Best Practices**

- Sử dụng CSS Variables cho colors và spacing
- Prefer Bootstrap utilities trước khi viết custom CSS
- BEM methodology cho custom CSS classes
- Responsive design với Bootstrap breakpoints
- Component-scoped CSS files

### **CSS File Naming**

- Component CSS: `ComponentName.css`
- Global styles: `global.css`
- Theme-specific: `admin-theme.css`, `nurse-theme.css`

---

## **4. API Integration**

### **Service Layer Structure**

```
services/
├── api.js              # Base axios configuration
├── APINurse/          # Nurse-specific APIs
├── APIAdmin/          # Admin-specific APIs
└── APIParent/         # Parent-specific APIs
```

### **API Service Template**

```javascript
import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Service functions
export const createResource = async (data) => {
  try {
    const response = await apiClient.post("/endpoint", data);
    return response.data;
  } catch (error) {
    console.error("Error creating resource:", error);
    throw error;
  }
};
```

### **Error Handling**

- Consistent error handling across all API calls
- User-friendly error messages
- Console logging cho development
- Loading states cho tất cả async operations

---

## **5. State Management**

### **Context Usage**

- Mỗi major feature có Context riêng
- Global state chỉ cho authentication và notifications
- Local state cho component-specific data

### **Hook Guidelines**

- Custom hooks cho reusable logic
- Prefix custom hooks với "use" (useVaccinationPlan)
- Keep hooks focused và single-purpose

---

## **6. Route Management**

### **Route Structure**

```
routes/
├── index.jsx          # Main router
├── AdminRoutes.jsx    # Admin-specific routes
├── NurseRoutes.jsx    # Nurse-specific routes
└── ParentRoutes.jsx   # Parent-specific routes
```

### **Route Protection**

- ProtectedRoute component cho authenticated routes
- Role-based access control
- Redirect logic cho unauthorized access

---

## **7. Development Guidelines**

### **Code Quality**

- ESLint configuration cho code consistency
- Prettier cho code formatting
- Meaningful variable và function names
- Comments cho complex logic

### **Performance**

- Lazy loading cho routes
- Optimize re-renders với useMemo, useCallback
- Image optimization
- Bundle splitting

### **Testing**

- Unit tests cho utility functions
- Component testing với React Testing Library
- API mocking cho tests

---

## **8. Git Guidelines**

### **Branch Naming**

- `feature/[feature-name]` cho new features
- `bugfix/[bug-description]` cho bug fixes
- `hotfix/[urgent-fix]` cho production fixes

### **Commit Messages**

```
type(scope): description

feat(admin): add vaccination plan management
fix(nurse): resolve consultation date picker issue
style(global): update admin theme colors
```

---

## **9. Environment Configuration**

### **Environment Variables**

```
REACT_APP_API_BASE_URL=http://localhost:8080/api/v1
REACT_APP_ENV=development
REACT_APP_DEBUG=true
```

### **Build Scripts**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src/",
    "format": "prettier --write src/"
  }
}
```

---

## **10. Documentation**

### **Component Documentation**

- JSDoc comments cho complex components
- README files cho major features
- API documentation trong service files

### **Changelog**

- Maintain CHANGELOG.md cho project updates
- Version numbering theo Semantic Versioning

---

## **11. Security Guidelines**

- Sanitize user inputs
- Validate data từ API responses
- Secure token storage
- Environment-specific configurations
- No hardcoded sensitive data

---

## **12. Browser Support**

- **Primary**: Chrome, Firefox, Safari (latest 2 versions)
- **Secondary**: Edge (latest version)
- **Mobile**: iOS Safari, Chrome Mobile
- **Polyfills**: Include necessary polyfills cho older browsers

---

_Last Updated: 2024_
_Version: 1.0_
