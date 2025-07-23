# Nurse Routes Documentation

## Tổng quan
Tài liệu này mô tả chi tiết các routes và navigation links trong hệ thống Nurse của School Medical Management System.

## Cấu trúc Routes chính

### 1. **Vaccination Management** (Quản lý Tiêm chủng)
- **Base Route**: `/nurse/vaccination/*`
- **File chính**: `frontend/src/Pages/Nurse/pages/Vaccination_co/VaccinationMain.jsx`
- **Sub-routes**:
  - `/nurse/vaccination/create-record` - Danh sách tiêm chủng
  - `/nurse/vaccination/monitoring` - Theo dõi sau tiêm

### 2. **Health Checkups** (Quản lý Khám sức khỏe)
- **Base Route**: `/nurse/health-checkups/*`
- **File chính**: `frontend/src/Pages/Nurse/pages/HealthCheckups_co/HealthCheckupsMain.jsx`
- **Sub-routes**:
  - `/nurse/health-checkups/campaign-list` - Danh sách đợt khám
  - `/nurse/health-checkups/schedule-consultation` - Danh sách khám sức khỏe

### 3. **Receive Medicine** (Quản lý Nhận thuốc)
- **Base Route**: `/nurse/receive-medicine/*`
- **File chính**: `frontend/src/Pages/Nurse/pages/ReceiveMedicine_co/ReceiveMedicine.jsx`
- **Sub-routes**:
  - `/nurse/receive-medicine/medicine-receipts` - Đơn nhận thuốc
  - `/nurse/receive-medicine/medication-history` - Lịch sử dùng thuốc

### 4. **Blog Management** (Quản lý Blog)
- **Base Route**: `/nurse/blog-management/*`
- **File chính**: `frontend/src/Pages/Nurse/pages/Blog_co/BlogManagement.jsx`
- **Sub-routes**:
  - `/nurse/blog-management/posts` - Bài viết cộng đồng
  - `/nurse/blog-management/health-articles` - Cẩm nang y tế

### 5. **Other Routes** (Các routes khác - chưa có sub-routes)
- `/nurse/student-records` - Hồ sơ học sinh
- `/nurse/inventory` - Quản lý kho
- `/nurse/medical-events` - Sự kiện y tế

## Cấu trúc File

### Routes Configuration
- **File**: `frontend/src/routes/NurseRoutes.jsx`
- **Chức năng**: Định nghĩa tất cả routes cho nurse
- **Wildcard routes**: Các routes có `/*` để cho phép sub-routes

### Index Files
Mỗi module có file `index.js` để export component chính:
- `frontend/src/Pages/Nurse/pages/Vaccination_co/index.js`
- `frontend/src/Pages/Nurse/pages/HealthCheckups_co/index.js`
- `frontend/src/Pages/Nurse/pages/ReceiveMedicine_co/index.js`
- `frontend/src/Pages/Nurse/pages/Blog_co/index.jsx`

### Main Components
Các file component chính sử dụng React Router:
- `VaccinationMain.jsx` - Sử dụng Routes, Route, Navigate, useNavigate, useLocation
- `HealthCheckupsMain.jsx` - Sử dụng Routes, Route, Navigate, useNavigate, useLocation
- `ReceiveMedicine.jsx` - Sử dụng Routes, Route, Navigate, useNavigate, useLocation
- `BlogManagement.jsx` - Sử dụng Routes, Route, Navigate, useNavigate, useLocation

## Navigation Logic

### URL Sync
Tất cả các module đều có logic sync giữa URL và active tab:
```javascript
const getActiveTab = () => {
  const path = location.pathname;
  if (path.includes('/sub-route-name')) {
    return 'sub-route-name';
  } else {
    return 'default-route';
  }
};
```

### Navigation Handler
```javascript
const handleTabSelect = (selectedTab) => {
  setActiveTab(selectedTab);
  const basePath = '/nurse/module-name';
  navigate(`${basePath}/${selectedTab}`, { replace: true });
};
```

### Default Redirects
Mỗi module có redirect mặc định:
```javascript
<Route index element={<Navigate to="default-sub-route" replace />} />
```

## Styling

### CSS Classes
Mỗi module có prefix riêng cho CSS classes:
- **Vaccination**: `lukhang-vaccination-*`
- **Health Checkups**: `lukhang-healthcheckup-*`
- **Receive Medicine**: `lukhang-receivemedicine-*`
- **Blog**: `lukhang-blogmgmt-*`

### Routes Container
Mỗi module có container cho routes:
```css
.module-routes-container {
  background: transparent !important;
  min-height: 400px !important;
}
```

## Testing URLs

### Vaccination
- http://localhost:5173/nurse/vaccination/create-record
- http://localhost:5173/nurse/vaccination/monitoring

### Health Checkups
- http://localhost:5173/nurse/health-checkups/campaign-list
- http://localhost:5173/nurse/health-checkups/schedule-consultation

### Receive Medicine
- http://localhost:5173/nurse/receive-medicine/medicine-receipts
- http://localhost:5173/nurse/receive-medicine/medication-history

### Blog Management
- http://localhost:5173/nurse/blog-management/posts
- http://localhost:5173/nurse/blog-management/health-articles

## Maintenance Notes

### Thêm Sub-route mới
1. Thêm route vào component chính (VaccinationMain.jsx, etc.)
2. Thêm tab navigation
3. Cập nhật `getActiveTab()` function
4. Thêm CSS nếu cần

### Thêm Module mới
1. Tạo component chính với React Router
2. Tạo file `index.js`
3. Thêm route với `/*` vào `NurseRoutes.jsx`
4. Cập nhật documentation này

---
**Cập nhật lần cuối**: 2025-01-23
**Tác giả**: Augment Agent
