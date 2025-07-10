# Hướng Dẫn Module Parent

## Quy Tắc CSS

1. **Luôn sử dụng tiền tố `parent-` cho mọi class CSS**

   ```css
   .parent-header {
     ...;
   }
   .parent-navigation {
     ...;
   }
   .parent-content {
     ...;
   }
   ```

2. **Sử dụng namespace-manager.js để tạo class name**

   ```jsx
   import { parentNS } from '../../styles/namespace-manager';

   <div className={parentNS.cls('header')}>...</div>
   <button className={parentNS.clsWithState('button', 'active')}>...</button>
   ```

3. **Tổ chức file CSS theo cấu trúc**

   - Mỗi component nên có file CSS riêng
   - Đặt trong thư mục cùng tên với component
   - Ví dụ: `Parent/components/Header/Header.css`

4. **Khi sử dụng thư viện bên ngoài**

   - Wrap component trong container có tiền tố parent-

   ```jsx
   <div className="parent-bootstrap-wrapper">
     <BootstrapComponent />
   </div>
   ```

5. **Sử dụng CSS Variables từ global.css**
   ```css
   .parent-button {
     color: var(--primary-color);
     border-radius: var(--border-radius-small);
   }
   ```

## Cấu Trúc Module

```
Parent/
  ├── components/     # Các components dùng chung trong parent
  │   ├── Header/
  │   │   ├── Header.jsx
  │   │   └── Header.css  # Sử dụng prefix .parent-header-*
  │   ├── Navigation/
  │   │   ├── Navigation.jsx
  │   │   └── Navigation.css # Sử dụng prefix .parent-navigation-*
  │   └── ...
  ├── layout/
  │   ├── ParentLayout.jsx
  │   └── ParentLayout.css # Sử dụng prefix .parent-layout-*
  ├── pages/          # Các trang cụ thể của parent
  │   ├── Home_co/
  │   │   ├── index.jsx
  │   │   └── index.css # Sử dụng prefix .parent-home-*
  │   └── ...
  └── index.js        # Export entry point
```

## Checklist Trước Khi Merge Code

1. ✅ Tất cả các class CSS đều có tiền tố `parent-`
2. ✅ Không sử dụng các class name chung như `.container`, `.header`, etc.
3. ✅ CSS chỉ ảnh hưởng đến elements trong module Parent
4. ✅ Không có hardcoded values - sử dụng CSS variables
5. ✅ Kiểm tra xem layout có hiển thị đúng trên các kích thước màn hình

## Lưu Ý Khi Làm Việc Với Các Module Khác

- Module Parent không nên override CSS của Admin hoặc Nurse
- Nếu cần tái sử dụng component, hãy wrap trong container có tiền tố parent-
- Khi cần xử lý conflicts, update file `layout-fixes.css` và thêm comment giải thích

## Phong Cách Thiết Kế Đặc Trưng

Module Parent sử dụng phong cách thiết kế riêng với tone màu:

- Primary: #1e40af (Blue-700)
- Primary Light: #3b82f6 (Blue-500)
- Primary Bg: #eff6ff (Blue-50)
- Gradient: linear-gradient(135deg, #1e40af 0%, #1d4ed8 25%, #1e3a8a 50%, #1e1b4b 100%)
- Nên sử dụng các biến CSS được định nghĩa trong global.css

## Header Structure

Header của Parent gồm 2 phần:

1. **Header Top (70px)**: Logo, navigation links, actions (notification, user, login/logout)
2. **Header Navigation (60px)**: Links cho các chức năng chính (khai báo sức khỏe, hồ sơ, etc.)

Tổng chiều cao header là 130px khi không scroll, chỉ còn 70px khi scroll.

## Liên Hệ

Nếu có thắc mắc hoặc phát hiện xung đột CSS, vui lòng liên hệ team leader hoặc xem thêm tài liệu tại `src/styles/CSS_GUIDE.md`
