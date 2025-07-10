# Hướng Dẫn Module Admin

## Quy Tắc CSS

1. **Luôn sử dụng tiền tố `admin-` cho mọi class CSS**

   ```css
   .admin-header {
     ...;
   }
   .admin-sidebar {
     ...;
   }
   .admin-content {
     ...;
   }
   ```

2. **Sử dụng namespace-manager.js để tạo class name**

   ```jsx
   import { adminNS } from '../../styles/namespace-manager';

   <div className={adminNS.cls('header')}>...</div>
   <button className={adminNS.clsWithState('button', 'active')}>...</button>
   ```

3. **Tổ chức file CSS theo cấu trúc**

   - Mỗi component nên có file CSS riêng
   - Đặt trong thư mục cùng tên với component
   - Ví dụ: `Admin/components/Dashboard/Dashboard.css`

4. **Khi sử dụng thư viện bên ngoài**

   - Wrap component trong container có tiền tố admin-

   ```jsx
   <div className="admin-antd-wrapper">
     <AntdComponent />
   </div>
   ```

5. **Sử dụng CSS Variables từ global.css**
   ```css
   .admin-button {
     color: var(--primary-color);
     border-radius: var(--border-radius-small);
   }
   ```

## Cấu Trúc Module

```
Admin/
  ├── components/     # Các components dùng chung trong admin
  │   ├── Header/
  │   │   ├── Header.jsx
  │   │   └── Header.css  # Sử dụng prefix .admin-header-*
  │   ├── Sidebar/
  │   │   ├── Sidebar.jsx
  │   │   └── Sidebar.css # Sử dụng prefix .admin-sidebar-*
  │   └── ...
  ├── Layout/
  │   ├── AdminLayout.jsx
  │   └── AdminLayout.css # Sử dụng prefix .admin-layout-*
  ├── pages/          # Các trang cụ thể của admin
  │   ├── Dashboard/
  │   │   ├── Dashboard.jsx
  │   │   └── Dashboard.css # Sử dụng prefix .admin-dashboard-*
  │   └── ...
  └── index.js        # Export entry point
```

## Checklist Trước Khi Merge Code

1. ✅ Tất cả các class CSS đều có tiền tố `admin-`
2. ✅ Không sử dụng các class name chung như `.container`, `.header`, etc.
3. ✅ CSS chỉ ảnh hưởng đến elements trong module Admin
4. ✅ Không có hardcoded values - sử dụng CSS variables
5. ✅ Kiểm tra xem layout có hiển thị đúng trên các kích thước màn hình

## Lưu Ý Khi Làm Việc Với Các Module Khác

- Module Admin không nên override CSS của Parent hoặc Nurse
- Nếu cần tái sử dụng component, hãy wrap trong container có tiền tố admin-
- Khi cần xử lý conflicts, update file `layout-fixes.css` và thêm comment giải thích

## Liên Hệ

Nếu có thắc mắc hoặc phát hiện xung đột CSS, vui lòng liên hệ team leader hoặc xem thêm tài liệu tại `src/styles/CSS_GUIDE.md`
