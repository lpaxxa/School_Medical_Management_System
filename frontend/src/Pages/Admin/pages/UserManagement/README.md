# User Management System

Hệ thống quản lý người dùng cho ứng dụng quản lý y tế trường học.

## Tính năng chính

### 1. Hiển thị danh sách người dùng

- Hiển thị thông tin chi tiết của tất cả users
- Thống kê theo vai trò (ADMIN, NURSE, PARENT)
- Thống kê theo trạng thái (Active/Inactive)

### 2. Tìm kiếm và lọc

- Tìm kiếm theo ID, username, email, số điện thoại
- Lọc theo vai trò
- Lọc theo trạng thái hoạt động

### 3. Quản lý CRUD

- **Thêm người dùng mới**: Form đầy đủ với validation
- **Xem chi tiết**: Modal hiển thị thông tin đầy đủ
- **Chỉnh sửa**: Cập nhật thông tin user
- **Xóa người dùng**: Với xác nhận (không cho phép xóa ADMIN)
- **Toggle trạng thái**: Kích hoạt/vô hiệu hóa user

## Cấu trúc API

### Endpoint chính

```
GET    /api/v1/account-members/getAll          - Lấy tất cả users
POST   /api/v1/account-members/create          - Tạo user mới
PUT    /api/v1/account-members/update/{id}     - Cập nhật user (chỉ email, password, phoneNumber)
DELETE /api/v1/account-members/{id}            - Xóa user (endpoint mới)
PATCH  /api/v1/account-members/toggle-status/{id} - Toggle trạng thái
```

### Cấu trúc dữ liệu API

```json
{
  "id": "ADMIN001",
  "email": "admin@truonghoc.edu.vn",
  "password": "12345",
  "phoneNumber": "0901234567",
  "role": "ADMIN", // ADMIN | NURSE | PARENT
  "username": "admin",
  "isActive": true
}
```

## Cấu trúc files

```
UserManagement/
├── UserManagement.jsx      # Component chính
├── UserManagement.css      # Styling chính
├── index.js               # Export
├── README.md              # Tài liệu này
├── components/
│   ├── UserTable.jsx      # Bảng hiển thị users
│   ├── UserTable.css      # Styling cho bảng
│   ├── UserModal.jsx      # Modal thêm/sửa/xem
│   └── UserModal.css      # Styling cho modal
└── services/
    └── userService.js     # API service functions
```

## Cách sử dụng

### 1. Import component

```jsx
import UserManagement from "./pages/UserManagement";
```

### 2. Sử dụng trong route

```jsx
<Route path="/user-management" component={UserManagement} />
```

### 3. Cấu hình API endpoint

Cập nhật `API_BASE_URL` trong `services/userService.js` nếu cần:

```javascript
const API_BASE_URL = "http://localhost:8080/api/v1/account-members";
```

## Validation rules

### Username

- Bắt buộc, tối thiểu 3 ký tự
- Chỉ chứa chữ cái, số và underscore

### Email

- Format email hợp lệ
- Bắt buộc

### Số điện thoại

- 10-11 chữ số
- Chỉ chứa số

### Mật khẩu (khi tạo mới)

- Tối thiểu 5 ký tự
- Xác nhận mật khẩu phải khớp

## Tính năng bảo mật

- Không cho phép xóa user có role ADMIN
- Validation đầy đủ ở frontend
- Error handling cho tất cả API calls
- Loading states và error states

## Responsive Design

- Hoạt động tốt trên desktop, tablet và mobile
- Grid layout tự động điều chỉnh
- Modal responsive

## Browser Support

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## Dependencies

- React 16.8+ (Hooks)
- React Icons
- Modern browser với fetch API support

## Troubleshooting

### API không kết nối được

1. Kiểm tra `API_BASE_URL` trong `userService.js`
2. Đảm bảo backend server đang chạy
3. Kiểm tra CORS settings

### Validation errors

1. Kiểm tra format dữ liệu input
2. Xem console để debug validation logic

### UI issues

1. Kiểm tra CSS imports
2. Đảm bảo React Icons được cài đặt
3. Xem responsive breakpoints

## API Response Examples

### GET /getAll

```json
[
  {
    "id": "ADMIN001",
    "email": "admin@truonghoc.edu.vn",
    "password": "12345",
    "phoneNumber": "0901234567",
    "role": "ADMIN",
    "username": "admin",
    "isActive": true
  }
]
```

### POST /create Request

```json
{
  "username": "new_user",
  "email": "user@example.com",
  "phoneNumber": "0123456789",
  "role": "PARENT",
  "password": "password123",
  "isActive": true
}
```

## 🔥 NEW: Enhanced Update User API

### API Endpoint đã cập nhật

```
PUT http://localhost:8080/api/v1/account-members/update/{userId}
```

### Request Body (chỉ 3 fields bắt buộc)

```json
{
  "email": "admin@edu.vn",
  "password": "123456",
  "phoneNumber": "0415365372"
}
```

### Tính năng Edit User mới

1. **Click nút Edit** trên bất kỳ user nào
2. **Modal Form** với:

   - Username: **Disabled** (không thể sửa)
   - Email: **Required**
   - Phone: **Required**
   - Password: **Required** (mật khẩu mới)
   - Role/Status: Hiển thị nhưng không gửi API

3. **Validation nâng cao**:

   - Email format hợp lệ
   - Phone 10-11 số
   - Password tối thiểu 5 ký tự

4. **API call** tự động lấy ID từ user được chọn

### UI/UX Improvements

- 🎨 **Modern minimalist design** với gradients
- ⚡ **Real-time validation**
- 🔄 **Loading states** với timeout protection
- ❌ **Comprehensive error handling**
- ✅ **Success feedback**
- 📱 **Fully responsive**

### Demo Flow

**Edit User:**

```
1. Page load → Test API connection
2. Display 10 users → From /getAll
3. Click Edit (e.g., ADMIN001) → Modal with data
4. Update fields → Real-time validation
5. Save → PUT /update/ADMIN001 with {email, password, phoneNumber}
6. Success → Reload table
```

**Delete User:**

```
1. Click Delete button (🗑️) trên user
2. Confirm dialog → "Xóa người dùng 'username' (ID: XXX)?"
3. Confirm → DELETE /api/v1/account-members/XXX
4. Success → Reload table + success message
```

**Security Notes:**

- ❌ Không cho phép xóa user có role ADMIN
- 🔐 Requires authentication token
- ⚠️ Confirm dialog với thông tin chi tiết

### Console Debug Logs

**Delete API Example:**

```javascript
// Console output khi delete user
Deleting user: {userId: "PARENT001", userName: "parent1"}
Delete API endpoint: http://localhost:8080/api/v1/account-members/PARENT001
Using auth token: Yes
Delete response status: 200
User deleted successfully: {success: true, message: "User deleted successfully"}
```

## Changelog

### v2.1.0 (Latest) 🎉

- 🆕 **Enhanced Update User API** với endpoint `/update/{id}`
- 🗑️ **Updated Delete User API** với endpoint `/{id}`
- 🎨 **Redesigned UI** theo phong cách tối giản hiện đại
- ⚡ **Improved performance** với timeout handling
- 🔐 **Better authentication** integration
- 📝 **Enhanced form validation** cho edit mode
- 💬 **Smart confirm dialogs** với user info
- 🚀 **Modern design system** với CSS variables
- 📱 **Mobile-first responsive design**
- 🐛 **Enhanced error handling** cho all CRUD operations

### v2.0.0

- ✅ Tích hợp API thật thay vì mock data
- ✅ Cập nhật cấu trúc dữ liệu theo API backend
- ✅ Thêm đầy đủ CRUD operations
- ✅ Cải thiện error handling
- ✅ Thêm loading states
- ✅ Cập nhật validation rules
- ✅ Responsive design improvements
- ✅ Security enhancements (không cho xóa ADMIN)

### v1.0.0 (Previous)

- Basic UI với mock data
- Chỉ có tính năng xem danh sách

# Quản lý Người dùng (User Management)

Tính năng quản lý người dùng trong hệ thống MediCare với khả năng tạo tài khoản cho Y tá và Phụ huynh.

## 🚀 Tính năng mới

### API Endpoint Mới

- **Endpoint tạo tài khoản**: `POST /api/v1/account-members/addNewMember`
- Hỗ trợ tạo tài khoản cho cả Y tá và Phụ huynh với cấu trúc JSON khác nhau

### Form Tạo Tài khoản Thông minh

- **Tự động chuyển đổi form** dựa trên vai trò được chọn
- **Y tá**: Form với họ tên, email, số điện thoại, trình độ, mật khẩu
- **Phụ huynh**: Form đầy đủ với thông tin cá nhân và quản lý sinh viên
- **Admin**: Form đơn giản với các thông tin cơ bản

### Quản lý Sinh viên

- **Thêm/Xóa sinh viên** động cho phụ huynh
- **Validation đầy đủ** cho thông tin sinh viên
- **Giao diện thân thiện** với mobile responsive

## 📝 Cấu trúc JSON API

### Danh sách người dùng từ API (GET /getAll)

```json
[
  {
    "id": "ADMIN001",
    "email": "admin@truonghoc.edu.vn",
    "password": "12345",
    "phoneNumber": "0415365372",
    "role": "ADMIN",
    "username": "admin",
    "isActive": true,
    "emailSent": null
  },
  {
    "id": "NU723",
    "email": "truongnguyenthaibinh1050@gmail.com",
    "password": "12345",
    "phoneNumber": "0324667890",
    "role": "NURSE",
    "username": "thanhinh",
    "isActive": true,
    "emailSent": false
  },
  {
    "id": "PA863",
    "email": "tdinh7455@gmail.com",
    "password": "12345",
    "phoneNumber": "0544555666",
    "role": "PARENT",
    "username": "huybao",
    "isActive": true,
    "emailSent": true
  }
]
```

### Tạo tài khoản Y tá (POST /addNewMember)

```json
{
  "email": "nurse@hospital.com",
  "password": "secure123",
  "fullName": "Jane Smith",
  "phoneNumber": "1234567890",
  "role": "NURSE",
  "qualification": "RN, BSN, 5 years experience"
}
```

### Tạo tài khoản Phụ huynh (POST /addNewMember)

```json
{
  "email": "parent@example.com",
  "password": "12345",
  "fullName": "Nguyễn Văn A",
  "phoneNumber": "0375593276",
  "role": "PARENT",
  "address": "123 Đường ABC, Quận 1, TP.HCM",
  "emergencyPhoneNumber": "0544555666",
  "relationshipType": "Mother",
  "occupation": "Teacher",
  "students": [
    {
      "fullName": "Nguyễn Văn B",
      "dateOfBirth": "2010-05-15",
      "gender": "Male",
      "studentId": "STU2024001",
      "className": "5A",
      "gradeLevel": "Grade 5",
      "schoolYear": "2024-2025"
    }
  ]
}
```

### Gửi Email API (POST /email/sendAccountEmail)

```json
Request Body:
["USER_ID_1", "USER_ID_2"]

Response:
{
  "success": true,
  "message": "Emails sent successfully"
}
```

## 🛠️ Cách sử dụng

### Tạo tài khoản Y tá

1. Click nút **"Thêm người dùng"**
2. Chọn vai trò **"Y tá trường"**
3. Điền thông tin:
   - Họ tên đầy đủ
   - Email và số điện thoại
   - Trình độ/Kinh nghiệm
   - Mật khẩu và xác nhận mật khẩu
4. Click **"Thêm người dùng"**

### Tạo tài khoản Phụ huynh

1. Click nút **"Thêm người dùng"**
2. Chọn vai trò **"Phụ huynh"**
3. Điền đầy đủ thông tin cá nhân
4. Thêm thông tin sinh viên (có thể thêm nhiều sinh viên)
5. Click **"Thêm người dùng"**

### Gửi Email Tài khoản

1. Trong danh sách người dùng, tìm cột **"Email gửi"**
2. Nếu trạng thái là **"Gửi email"** (emailSent = false):
   - Click nút **"Gửi email"**
   - Xác nhận thông tin trong dialog
   - Chờ email được gửi thành công
3. Sau khi gửi thành công:
   - Trạng thái chuyển thành **"Đã gửi"** (emailSent = true)
   - Button sẽ biến mất
4. Nếu emailSent = null: Không hiển thị gì

## 🎨 Tính năng UI/UX

### Modal Lớn cho Form Phức tạp

- Modal tự động mở rộng cho form Phụ huynh
- Layout responsive trên tất cả thiết bị
- Validation real-time với thông báo lỗi rõ ràng

### Quản lý Sinh viên

- **Nút "Thêm sinh viên"**: Thêm sinh viên mới
- **Nút "Xóa"**: Xóa sinh viên (ít nhất 1 sinh viên)
- **Form validation**: Kiểm tra tất cả trường bắt buộc
- **Auto-suggest**: Gợi ý format cho các trường

### Validation Rules

- **Email**: Format hợp lệ
- **Số điện thoại**: 10-11 chữ số
- **Mật khẩu**: Tối thiểu 5 ký tự (cho Y tá và Phụ huynh)
- **Họ tên**: Bắt buộc (cho Y tá và Phụ huynh)
- **Trình độ/Kinh nghiệm**: Bắt buộc (chỉ cho Y tá)
- **Sinh viên**: Tất cả trường bắt buộc phải điền (chỉ cho Phụ huynh)

## 🔧 Technical Details

### Files Đã Cập nhật

- `userService.js`: API endpoint và transform functions
- `UserModal.jsx`: Form thông minh với dynamic fields
- `UserModal.css`: Styling cho modal lớn và student management
- `UserManagement.jsx`: Integration với API mới

### Transform Functions

- **transformUserToAPI()**: Chuyển đổi form data thành format API
- **transformUserFromAPI()**: Chuyển đổi API response thành UI format
- **generateUserId()**: Tạo ID theo format mới (NU, PA, AD)

### Error Handling

- Connection timeout (10s cho test, 15s cho data loading)
- Authentication errors (401, 403)
- Validation errors với thông báo chi tiết
- Network errors và fallback options

## 📱 Responsive Design

### Breakpoints

- **900px+**: Modal lớn (800px width)
- **640px-900px**: Modal thu nhỏ (90vw)
- **<640px**: Mobile full width với layout stack

### Mobile Optimizations

- Single column layout cho form rows
- Stacked student management buttons
- Full width buttons trong footer
- Optimized spacing và padding

## 🚦 Status & Debugging

### Development Mode

- Console logging cho tất cả API calls
- Error tracking với chi tiết
- Performance monitoring
- Connection status indicator

### Production Ready

- Error boundaries
- Graceful fallbacks
- User-friendly error messages
- Accessibility compliance

---

## 🆕 Version 2.0 Features

### Completed ✅

- ✅ API integration với `/addNewMember`
- ✅ Dynamic form switching theo role
- ✅ Student management system
- ✅ Comprehensive validation
- ✅ Mobile responsive design
- ✅ Error handling & user feedback
- ✅ **Email sending integration** - Tích hợp chức năng gửi email
- ✅ **EmailSent column display** - Hiển thị trạng thái gửi email
- ✅ **Smart email button logic** - Logic hiển thị button thông minh
- ✅ **Real-time email status update** - Cập nhật trạng thái real-time

### 📧 Email Management Features

- **emailSent Field Support**: Hiển thị và xử lý trạng thái gửi email
  - `false`: Hiển thị button "Gửi email"
  - `true`: Hiển thị badge "Đã gửi"
  - `null`: Ẩn (không hiển thị)
- **Email API Integration**: Tích hợp với EmailManagement_co
- **Confirmation Dialog**: Xác nhận trước khi gửi email
- **Loading States**: Hiển thị trạng thái đang gửi với spinner
- **Error Handling**: Xử lý lỗi comprehensive cho email functions

### Future Enhancements 🚧

- 🔄 Bulk user import từ Excel/CSV
- 🔄 Advanced search và filtering
- 🔄 Email verification workflow
- 🔄 Password reset functionality
- 🔄 User activity logging
- 🔄 Export user data reports

---

_Cập nhật lần cuối: $(new Date().toLocaleDateString('vi-VN'))_
