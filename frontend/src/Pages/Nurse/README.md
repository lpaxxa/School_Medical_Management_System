# Hướng Dẫn Module Nurse

## Quy Tắc CSS

1. **Luôn sử dụng tiền tố `nurse-` cho mọi class CSS**

   ```css
   .nurse-header {
     ...;
   }
   .nurse-navigation {
     ...;
   }
   .nurse-content {
     ...;
   }
   ```

2. **Sử dụng namespace-manager.js để tạo class name**

   ```jsx
   import { nurseNS } from '../../styles/namespace-manager';

   <div className={nurseNS.cls('header')}>...</div>
   <button className={nurseNS.clsWithState('button', 'active')}>...</button>
   ```

3. **Tổ chức file CSS theo cấu trúc**

   - Mỗi component nên có file CSS riêng
   - Đặt trong thư mục cùng tên với component
   - Ví dụ: `Nurse/components/Dashboard/Dashboard.css`

4. **Khi sử dụng thư viện bên ngoài**

   - Wrap component trong container có tiền tố nurse-

   ```jsx
   <div className="nurse-antd-wrapper">
     <AntdComponent />
   </div>
   ```

5. **Sử dụng CSS Variables từ global.css**
   ```css
   .nurse-button {
     color: var(--primary-color);
     border-radius: var(--border-radius-small);
   }
   ```

## Cấu Trúc Module

```
Nurse/
  ├── components/     # Các components dùng chung trong nurse
  │   ├── Header/
  │   │   ├── Header.jsx
  │   │   └── Header.css  # Sử dụng prefix .nurse-header-*
  │   ├── Navigation/
  │   │   ├── Navigation.jsx
  │   │   └── Navigation.css # Sử dụng prefix .nurse-navigation-*
  │   └── ...
  ├── layout/
  │   ├── NurseLayout.jsx
  │   └── NurseLayout.css # Sử dụng prefix .nurse-layout-*
  ├── pages/          # Các trang cụ thể của nurse
  │   ├── Dashboard_co/
  │   │   ├── DashboardMain.jsx
  │   │   └── DashboardMain.css # Sử dụng prefix .nurse-dashboard-*
  │   └── ...
  └── index.js        # Export entry point
```

## Checklist Trước Khi Merge Code

1. ✅ Tất cả các class CSS đều có tiền tố `nurse-`
2. ✅ Không sử dụng các class name chung như `.container`, `.header`, etc.
3. ✅ CSS chỉ ảnh hưởng đến elements trong module Nurse
4. ✅ Không có hardcoded values - sử dụng CSS variables
5. ✅ Kiểm tra xem layout có hiển thị đúng trên các kích thước màn hình

## Lưu Ý Khi Làm Việc Với Các Module Khác

- Module Nurse không nên override CSS của Parent hoặc Admin
- Nếu cần tái sử dụng component, hãy wrap trong container có tiền tố nurse-
- Khi cần xử lý conflicts, update file `layout-fixes.css` và thêm comment giải thích

## Phong Cách Thiết Kế Đặc Trưng

Module Nurse sử dụng phong cách thiết kế riêng với tone màu y tế:

- Nền chính: Xanh dương nhạt (#e8f4f8)
- Accent color: Xanh y tế (#4cc1b0)
- Card backgrounds: Trắng (#ffffff)
- Nên sử dụng các biến CSS được định nghĩa trong global.css

## Liên Hệ

Nếu có thắc mắc hoặc phát hiện xung đột CSS, vui lòng liên hệ team leader hoặc xem thêm tài liệu tại `src/styles/CSS_GUIDE.md`
