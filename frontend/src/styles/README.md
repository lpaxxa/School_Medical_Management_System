# Quản Lý CSS - Hướng Dẫn Tổng Quan

## Cấu trúc thư mục

```
src/styles/
  ├── global.css              # Biến CSS và styles global
  ├── reset.css               # Reset CSS cơ bản
  ├── layout-fixes.css        # Fixes cho xung đột layout
  ├── namespace-manager.js    # Utility cho CSS namespacing
  ├── CSS_GUIDE.md            # Tài liệu chi tiết về quy tắc CSS
  └── README.md               # File này
```

## Cơ chế CSS Namespacing

Để tránh xung đột CSS giữa các module khác nhau (Admin, Nurse, Parent), hệ thống sử dụng cơ chế namespacing:

1. **Mỗi module sử dụng prefix riêng**:

   - `parent-*` cho module Parent
   - `admin-*` cho module Admin
   - `nurse-*` cho module Nurse

2. **Utility hỗ trợ đặt tên class**:

   ```javascript
   // Import
   import { parentNS } from '../../styles/namespace-manager';

   // Sử dụng
   <div className={parentNS.cls('header')}>...</div>
   <button className={parentNS.clsWithState('button', 'active')}>...</button>

   // Kết quả:
   // <div class="parent-header">...</div>
   // <button class="parent-button parent-button--active">...</button>
   ```

## Thứ tự import CSS

Import CSS theo thứ tự sau trong App.jsx để đảm bảo cascade đúng:

```javascript
import "./styles/reset.css"; // 1. Reset CSS trước
import "./styles/global.css"; // 2. Global variables và styles
import "./App.css"; // 3. App styles
import "./styles/layout-fixes.css"; // 4. Layout fixes sau cùng
```

## Cách thêm CSS mới

1. **Component mới**:

   - Tạo file CSS trong thư mục component
   - Sử dụng namespace phù hợp (admin-, nurse-, parent-)
   - Import trong component JSX

2. **Styles global mới**:

   - Thêm biến vào global.css nếu cần sử dụng nhiều lần
   - Sử dụng biến thay vì hard-coded values

3. **Fixes cho xung đột**:
   - Thêm vào layout-fixes.css
   - Comment rõ ràng mục đích của fix

## Checklist khi merge code

1. ✅ Classes đã được namespace đúng cách
2. ✅ Không có hard-coded values
3. ✅ Layout không bị vỡ ở các kích thước màn hình
4. ✅ CSS không ảnh hưởng đến modules khác

## Tài liệu chi tiết

Xem `CSS_GUIDE.md` trong thư mục này để biết chi tiết về:

- Quy tắc đặt tên BEM
- Cách xử lý thư viện bên ngoài
- Kỹ thuật xử lý xung đột CSS

## Hướng dẫn cho từng module

Mỗi module có hướng dẫn riêng:

- `src/Pages/Admin/README.md`
- `src/Pages/Nurse/README.md`
- `src/Pages/Parent/README.md`
