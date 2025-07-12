# Health Articles System - README

## 📋 Tổng quan

Health Articles System là hệ thống quản lý bài viết y tế riêng biệt khỏi Community Posts, được thiết kế để quản lý các bài viết chuyên môn y tế trong môi trường trường học.

## 🏗️ Kiến trúc hệ thống

### 1. API Endpoints
- **Base URL**: `http://localhost:8080/api/health-articles`
- **GET** `/` - Lấy tất cả bài viết y tế
- **GET** `/{id}` - Lấy bài viết theo ID
- **POST** `/` - Tạo bài viết mới
- **PUT** `/{id}` - Cập nhật bài viết
- **DELETE** `/{id}` - Xóa bài viết
- **POST** `/{id}/upload-image` - Upload ảnh cho bài viết
- **GET** `/search?q={query}` - Tìm kiếm bài viết
- **GET** `/category/{category}` - Lọc theo danh mục

### 2. Components Structure
```
health_articles/
├── HealthArticles.jsx          # Danh sách bài viết y tế
├── AddHealthArticle.jsx        # Thêm bài viết mới
├── EditHealthArticle.jsx       # Chỉnh sửa bài viết
└── HealthArticles.css          # Styling
```

### 3. Services
```
services/APINurse/
└── blogService.js              # Service gộp cho tất cả blog và health articles
```

## 🎯 Tính năng chính

### 1. Quản lý bài viết y tế
- ✅ Thêm bài viết mới với form đầy đủ
- ✅ Chỉnh sửa bài viết có quyền
- ✅ Xóa bài viết có quyền
- ✅ Xem chi tiết bài viết
- ✅ Upload ảnh từ máy tính hoặc URL

### 2. Phân quyền
- ✅ Admin có thể chỉnh sửa/xóa mọi bài viết
- ✅ Tác giả chỉ có thể chỉnh sửa/xóa bài viết của mình
- ✅ Ẩn/hiện nút chỉnh sửa/xóa dựa trên quyền

### 3. Tìm kiếm và lọc
- ✅ Tìm kiếm theo tiêu đề, nội dung, tóm tắt
- ✅ Lọc theo danh mục
- ✅ Tìm kiếm theo tags

### 4. Danh mục Health Articles
```javascript
const healthCategories = [
  "Disease Prevention",
  "Nutrition", 
  "Mental Health",
  "First Aid",
  "Physical Activity",
  "Health Information",
  "COVID-19 và trẻ em",
  "Dinh dưỡng học đường",
  "Sức khỏe tâm thần",
  "Tuổi dậy thì",
  "Vắc-xin cho học sinh",
  "Y tế học đường",
  "Phòng bệnh",
  "Sơ cứu",
  "Hoạt động thể chất",
  "Other"
];
```

## 🚀 Cách sử dụng

### 1. Truy cập hệ thống
```
URL: http://localhost:5173/nurse/blog/health-articles
```

### 2. Thêm bài viết mới
- Nhấn nút "Thêm bài viết mới"
- Điền form với các thông tin:
  - Tiêu đề (bắt buộc)
  - Tóm tắt (bắt buộc)
  - Nội dung (bắt buộc)
  - Danh mục (bắt buộc)
  - Hình ảnh (tùy chọn)
  - Tags (tùy chọn)
- Nhấn "Thêm bài viết"

### 3. Chỉnh sửa bài viết
- Nhấn nút "Sửa" trên bài viết (chỉ hiện với người có quyền)
- Cập nhật thông tin
- Nhấn "Cập nhật bài viết"

### 4. Xóa bài viết
- Nhấn nút "Xóa" trên bài viết (chỉ hiện với người có quyền)
- Xác nhận xóa trong popup

## 🧪 Testing

### Chạy test trên Browser Console:
```javascript
// Test toàn bộ hệ thống
await testHealthArticles.runAllTests();

// Test từng chức năng
await testHealthArticles.testHealthArticleService();
await testHealthArticles.testSearchFunction();
await testHealthArticles.testCategoryFilter();
```

## 📁 Cấu trúc dữ liệu

### Health Article Object:
```javascript
{
  id: "string",
  title: "string (required)",
  summary: "string (required)",
  content: "string (required)",
  category: "string (required)",
  imageUrl: "string (optional)",
  tags: ["string"] (optional),
  author: "string",
  authorId: "string",
  createdAt: "datetime",
  updatedAt: "datetime",
  publishDate: "datetime"
}
```

## 🔧 Cài đặt và cấu hình

### 1. Dependencies
Đảm bảo các package sau đã được cài đặt:
- react-router-dom
- react-bootstrap
- axios
- react-toastify

### 2. Environment Variables
```
REACT_APP_API_BASE_URL=http://localhost:8080
```

### 3. Authentication
Hệ thống sử dụng JWT token được lưu trong localStorage:
- `authToken`
- `userRole`
- `currentUserId`

## 🚨 Lưu ý quan trọng

1. **API Separation**: Health Articles sử dụng endpoint riêng (`/api/health-articles`) khác với Community Posts (`/api/v1/community`)

2. **Authorization**: Luôn kiểm tra quyền trước khi hiển thị nút chỉnh sửa/xóa

3. **Error Handling**: Tất cả API calls đều có error handling và thông báo lỗi cho user

4. **File Upload**: Hỗ trợ upload ảnh từ máy tính hoặc nhập URL

5. **Data Validation**: Form validation ở frontend và backend

## 📞 Hỗ trợ

Nếu gặp vấn đề, kiểm tra:
1. Console log để xem lỗi API
2. Network tab để kiểm tra request/response
3. Authentication token còn hạn không
4. Backend server đã chạy chưa

## 🎯 Roadmap

- [ ] Rich text editor cho nội dung
- [ ] Drag & drop upload ảnh
- [ ] Preview bài viết trước khi publish
- [ ] Comment system cho bài viết
- [ ] Like/Unlike functionality
- [ ] Bookmark bài viết
- [ ] Export bài viết PDF
- [ ] Email notification
- [ ] Advanced search filters
