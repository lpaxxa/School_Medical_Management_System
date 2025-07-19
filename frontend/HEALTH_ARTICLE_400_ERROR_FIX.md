# Sửa lỗi 400 Bad Request khi thêm bài viết y tế

## 🚨 Vấn đề

Khi deploy lên web, chức năng thêm bài viết y tế trong trang `AddHealthArticle.jsx` bị lỗi 400 Bad Request:

```
POST https://medically-backend.southeastasia.cloudapp.azure.com/api/health-articles 400 (Bad Request)
Error creating health article: AxiosError {message: 'Request failed with status code 400'}
```

## 🔍 Nguyên nhân

### 1. Cấu trúc dữ liệu không nhất quán

**AddHealthArticle.jsx (TRƯỚC KHI SỬA):**
```javascript
const articleTextData = {
  title: formData.title.trim(),
  summary: formData.summary.trim(),
  content: formData.content.trim(),
  category: formData.category,
  tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '') : [],
  author_id: currentUser.id || currentUser.memberId,        // ❌ Backend không mong đợi
  author: currentUser.fullName || currentUser.name || currentUser.email,  // ❌ Có thể undefined
  member_id: currentUser.memberId || currentUser.id         // ❌ Backend không mong đợi
};
```

**EditHealthArticle.jsx (HOẠT ĐỘNG BÌNH THƯỜNG):**
```javascript
const updatedTextData = {
  title: formData.title.trim(),
  summary: formData.summary.trim(),
  content: formData.content.trim(),
  category: formData.category,
  tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '') : []
  // ✅ Không có author_id, author, member_id
};
```

### 2. Các vấn đề cụ thể

1. **Backend không mong đợi các trường `author_id`, `author`, `member_id`** khi tạo bài viết mới
2. **Trường `author` có thể là `undefined`** nếu `currentUser.fullName`, `currentUser.name`, và `currentUser.email` đều undefined
3. **Backend có validation nghiêm ngặt** về cấu trúc dữ liệu và từ chối request có các trường không mong đợi

## ✅ Giải pháp

### Cập nhật AddHealthArticle.jsx

Thay đổi cấu trúc dữ liệu để giống với EditHealthArticle.jsx:

```javascript
// Step 1: Create the article with text data first
// Sử dụng cấu trúc dữ liệu giống như EditHealthArticle để tránh lỗi 400 Bad Request
const articleTextData = {
  title: formData.title.trim(),
  summary: formData.summary.trim(),
  content: formData.content.trim(),
  category: formData.category,
  tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '') : []
};
```

### Loại bỏ các trường không cần thiết

- ❌ Xóa `author_id: currentUser.id || currentUser.memberId`
- ❌ Xóa `author: currentUser.fullName || currentUser.name || currentUser.email`
- ❌ Xóa `member_id: currentUser.memberId || currentUser.id`

## 🎯 Kết quả mong đợi

Sau khi sửa:

1. ✅ **Chức năng thêm bài viết hoạt động bình thường** trên production
2. ✅ **Không còn lỗi 400 Bad Request**
3. ✅ **Cấu trúc dữ liệu nhất quán** giữa Add và Edit
4. ✅ **Backend có thể xử lý request thành công**

## 📝 Lưu ý

- **Backend sẽ tự động gán author** dựa trên thông tin authentication token
- **Không cần gửi thông tin author** trong request body
- **Cấu trúc này đã được test** và hoạt động tốt trong EditHealthArticle.jsx

## 🧪 Test

Để test fix này:

1. Deploy code lên production
2. Đăng nhập với tài khoản nurse
3. Thử tạo bài viết y tế mới
4. Kiểm tra console không còn lỗi 400
5. Xác nhận bài viết được tạo thành công

## 📚 Tham khảo

- File được sửa: `frontend/src/Pages/Nurse/pages/Blog_co/health_articles/AddHealthArticle.jsx`
- File tham khảo: `frontend/src/Pages/Nurse/pages/Blog_co/health_articles/EditHealthArticle.jsx`
- API endpoint: `POST /api/health-articles`
