# Nurse Pages

Thư mục này chứa tất cả các trang của phần Nurse trong hệ thống School Medical Management System.

## Cấu trúc thư mục

- `Dashboard_co`: Trang chính (dashboard) cho y tá
- `Consultation_co`: Trang quản lý tư vấn
- `HealthCheckups_co`: Trang quản lý khám sức khỏe định kỳ
- `Inventory_co`: Trang quản lý kho
- `MedicalEvents_co`: Trang quản lý sự kiện y tế
- `StudentRecords_co`: Trang quản lý hồ sơ học sinh
- `Vaccination_co`: Trang quản lý tiêm chủng

## Quy ước đặt tên

Mỗi thư mục trang nên có hậu tố `_co` (viết tắt của "component") để tuân theo quy ước đặt tên như ở phần Parent.

Mỗi trang nên có các file:
- `index.jsx`: Thành phần React chính của trang
- `index.css`: Các style riêng của trang
- `index.js`: File export mặc định cho thành phần React

## Sử dụng

Để import tất cả các trang:

```jsx
import { Dashboard, Consultation, HealthCheckupsPage, ... } from '../Pages/Nurse/pages';
```

Để import một trang riêng lẻ:

```jsx
import Dashboard from '../Pages/Nurse/pages/Dashboard_co';
```
