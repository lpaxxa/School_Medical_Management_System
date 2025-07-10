# Hướng dẫn CSS cho dự án School Medical Management System

## Nguyên tắc tổ chức CSS

Để đảm bảo không có xung đột CSS giữa các module (Parent, Nurse, Admin), chúng ta sử dụng các nguyên tắc sau:

### 1. Sử dụng namespace cho các class CSS

Mỗi module sẽ có một tiền tố riêng:

- Module Parent: `parent-*`
- Module Nurse: `nurse-*`
- Module Admin: `admin-*`
- Shared components: `shared-*`

Ví dụ:

```css
/* CSS cho module Parent */
.parent-header {
  ...;
}
.parent-container {
  ...;
}

/* CSS cho module Nurse */
.nurse-header {
  ...;
}
.nurse-container {
  ...;
}

/* CSS cho module Admin */
.admin-header {
  ...;
}
.admin-container {
  ...;
}
```

### 2. Sử dụng namespace-manager.js

Để đảm bảo việc áp dụng namespace một cách nhất quán, chúng ta sử dụng file `namespace-manager.js`:

```jsx
// Import namespace manager
import { parentNS } from "../../styles/namespace-manager";

function MyComponent() {
  return (
    <div className={parentNS.cls("container")}>
      <header className={parentNS.cls("header")}>
        <h1 className={parentNS.cls("title")}>Title</h1>
      </header>
    </div>
  );
}
```

Kết quả:

```html
<div class="parent-container">
  <header class="parent-header">
    <h1 class="parent-title">Title</h1>
  </header>
</div>
```

### 3. Cấu trúc thư mục CSS

```
src/
├── styles/
│   ├── global.css            # CSS toàn cục
│   ├── reset.css             # CSS reset
│   ├── layout-fixes.css      # Sửa lỗi layout
│   ├── namespace-manager.js  # Quản lý namespace
│   └── CSS_GUIDE.md          # Tài liệu này
├── Pages/
│   ├── Parent/
│   │   ├── components/
│   │   │   └── ComponentName/
│   │   │       └── ComponentName.css
│   │   └── pages/
│   │       └── PageName/
│   │           └── PageName.css
│   ├── Nurse/
│   │   └── ...
│   └── Admin/
│       └── ...
└── components/
    └── SharedComponent/
        └── SharedComponent.css
```

### 4. Thứ tự import CSS

Thứ tự import CSS trong file `App.jsx`:

1. `reset.css` - Reset các style mặc định của trình duyệt
2. `global.css` - Định nghĩa biến CSS và style toàn cục
3. `layout-fixes.css` - Sửa lỗi layout và xung đột CSS

## Quy tắc viết CSS

### 1. Sử dụng CSS Variables

Sử dụng CSS Variables để đảm bảo tính nhất quán:

```css
:root {
  --primary-color: #1e40af;
  --primary-hover: #1d4ed8;
  --text-dark: #1f2937;
  --border-radius: 12px;
}

.parent-button {
  background-color: var(--primary-color);
  border-radius: var(--border-radius);
}
```

### 2. Mobile-first Responsive Design

```css
/* Mobile first */
.parent-container {
  padding: 1rem;
}

/* Tablet và desktop */
@media (min-width: 768px) {
  .parent-container {
    padding: 2rem;
  }
}

@media (min-width: 1024px) {
  .parent-container {
    padding: 3rem;
  }
}
```

### 3. Tránh CSS quá cụ thể

```css
/* Không nên */
.parent-header .parent-nav .parent-nav-list .parent-nav-item .parent-nav-link {
  ...;
}

/* Nên */
.parent-nav-link {
  ...;
}
```

### 4. Sử dụng BEM cho các component phức tạp

```css
.parent-card {
  ...;
}
.parent-card__header {
  ...;
}
.parent-card__body {
  ...;
}
.parent-card__footer {
  ...;
}
.parent-card--featured {
  ...;
}
```

### 5. Xử lý xung đột CSS

Nếu có xung đột CSS:

1. Kiểm tra và đảm bảo sử dụng đúng namespace
2. Sử dụng `layout-fixes.css` để ghi đè các style xung đột
3. Tránh sử dụng `!important` trừ khi thực sự cần thiết

## Các vấn đề thường gặp và cách giải quyết

### 1. Layout bị vỡ khi scroll

```css
/* Trong layout-fixes.css */
.parent-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  will-change: transform;
}

.parent-layout {
  padding-top: 130px; /* Chiều cao của header */
}
```

### 2. Container bị tràn ngang

```css
/* Trong layout-fixes.css */
html,
body {
  overflow-x: hidden;
  max-width: 100%;
}

.parent-container {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
}
```

### 3. Xung đột giữa các module

Nếu có xung đột giữa các module, hãy đảm bảo:

1. Mỗi module sử dụng đúng namespace của mình
2. Không sử dụng selector toàn cục (như `body`, `html`) trong CSS của module
3. Sử dụng `layout-fixes.css` để ghi đè các style xung đột

## Tối ưu hóa hiệu suất CSS

1. Tránh sử dụng quá nhiều animation và transition
2. Sử dụng `will-change` cho các element cần animation
3. Tránh sử dụng shadow DOM và các selector phức tạp
4. Sử dụng `transform` và `opacity` cho animation thay vì `top`, `left`, `width`, `height`

## Kiểm tra và sửa lỗi CSS

1. Sử dụng DevTools để kiểm tra các style được áp dụng
2. Kiểm tra xem có style nào bị ghi đè không
3. Sử dụng CSS Validator để kiểm tra lỗi cú pháp
4. Kiểm tra trên nhiều trình duyệt và thiết bị khác nhau
