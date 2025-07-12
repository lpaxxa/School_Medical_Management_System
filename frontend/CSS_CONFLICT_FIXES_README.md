# CSS Conflict Fixes - Summary

## Vấn đề đã được giải quyết

Đã phát hiện và sửa các xung đột CSS gây ảnh hưởng đến Pages/Parent:

### 1. Xung đột Class `.container`

**Vấn đề**:

- `src/styles/global.css` định nghĩa `.container` với `max-width: 1920px`
- `src/Pages/Parent/pages/MedicalRecords_co/styles/main.css` định nghĩa `.container` với `max-width: 1200px`

**Giải pháp**:

- Đổi tên `.container` trong global.css thành `.global-container`
- Cập nhật tất cả references tương ứng

### 2. Xung đột Class `.btn` và `.card`

**Vấn đề**:

- Global CSS và module-specific CSS đều sử dụng các class chung như `.btn`, `.card`
- Gây ra override styles không mong muốn

**Giải pháp**:

- Đổi tên các class chung trong global.css thành `.global-btn`, `.global-card`
- Thêm prefix để tránh xung đột

### 3. Xung đột Utility Classes

**Vấn đề**:

- Các utility classes như `.text-primary`, `.bg-primary` có thể xung đột

**Giải pháp**:

- Đổi tên thành `.global-text-primary`, `.global-bg-primary`
- Đảm bảo chỉ sử dụng cho global components

### 4. Xung đột Student Selection Dropdown (Mới)

**Vấn đề**:

- Các page khác nhau sử dụng class `chonhocsinhtabparent-select` chung
- Gây ra xung đột styling giữa StudentProfile, MedicalRecords, và SendMedicine
- Dropdown chọn học sinh bị lỗi hiển thị

**Giải pháp**:

- Tạo class mới `.selectstudentfix` thay thế cho các dropdown chọn học sinh
- Cập nhật CSS để hỗ trợ cả class cũ và mới
- Đảm bảo styling nhất quán trên tất cả các trang

## Các file đã được sửa đổi

### 1. `src/App.jsx`

- Thêm import CSS conflict fixes file
- Đảm bảo thứ tự import CSS đúng

### 2. `src/styles/global.css`

- Đổi tên `.container` → `.global-container`
- Đổi tên `.btn`, `.btn-primary`, `.btn-secondary` → `.global-btn`, `.global-btn-primary`, `.global-btn-secondary`
- Đổi tên `.card` → `.global-card`
- Đổi tên utility classes với prefix `.global-`

### 3. `src/styles/css-conflict-fixes.css` (Mới)

- File chuyên dụng để xử lý xung đột CSS
- Chứa các override rules để đảm bảo Parent pages hoạt động đúng
- Z-index management cho modals và overlays
- Responsive fixes cho containers

## Kết quả

✅ Xóa bỏ xung đột CSS giữa global styles và Parent module styles
✅ Đảm bảo Parent pages sử dụng đúng CSS styles
✅ Tránh override không mong muốn từ global CSS
✅ Cải thiện maintainability của codebase
✅ Đảm bảo responsive layout hoạt động đúng

## Thứ tự import CSS mới

```javascript
import "./styles/reset.css"; // Reset browser defaults
import "./styles/global.css"; // Global variables & utilities
import "./styles/layout-fixes.css"; // Layout & overflow fixes
import "./styles/css-conflict-fixes.css"; // Conflict resolution
import "./App.css"; // App-specific styles
```

## Lưu ý cho Developer

1. **Sử dụng namespace**: Luôn sử dụng prefix cho CSS classes để tránh xung đột
2. **Tránh global classes**: Không sử dụng tên class chung như `.container`, `.btn`, `.card`
3. **Kiểm tra CSS order**: Đảm bảo thứ tự import CSS đúng
4. **Testing**: Test trên các pages khác nhau để đảm bảo không gây lỗi mới

## Migration Guide

Nếu có component nào sử dụng các class cũ từ global.css:

- `.container` → `.global-container`
- `.btn` → `.global-btn`
- `.btn-primary` → `.global-btn-primary`
- `.btn-secondary` → `.global-btn-secondary`
- `.card` → `.global-card`
- `.text-*` → `.global-text-*`
- `.bg-*` → `.global-bg-*`
- `.border-*` → `.global-border-*`
