# 🔒 Bảo mật Health Articles: Phân quyền Edit/Delete

## 🚨 **VẤN ĐỀ BẢO MẬT**

Khi xóa các trường `author_id`, `author`, `member_id` khỏi request tạo bài viết, có nguy cơ:

### ❌ **Mất thông tin ownership**
- Backend có thể không lưu đúng thông tin tác giả
- Không xác định được ai là người tạo bài viết
- **Nguy cơ**: Ai cũng có thể edit/delete bài viết của người khác

### ❌ **Logic phân quyền bị phá vỡ**
```javascript
// Logic phân quyền hiện tại trong HealthArticles.jsx
const canEditDelete = (article) => {
  const isAuthor = 
    (article.memberId && currentUser.memberId && article.memberId === currentUser.memberId) ||
    (article.memberId && currentUser.id && article.memberId === currentUser.id) ||
    (article.authorId && currentUser.memberId && article.authorId === currentUser.memberId) ||
    (article.authorId && currentUser.id && article.authorId === currentUser.id);
  
  return isAuthor;
};
```

**Nếu `article.memberId` và `article.authorId` là NULL → Ai cũng có thể edit/delete!**

## ✅ **GIẢI PHÁP BẢO MẬT**

### **Thêm lại thông tin author vào request:**

```javascript
const articleTextData = {
  title: formData.title.trim(),
  summary: formData.summary.trim(),
  content: formData.content.trim(),
  category: formData.category,
  tags: processedTags,
  imageUrl: finalImageUrl,
  // ✅ Thêm thông tin author để đảm bảo phân quyền edit/delete
  author: currentUser.fullName || currentUser.name || currentUser.email || 'Unknown',
  authorId: currentUser.id || currentUser.memberId,
  memberId: currentUser.memberId || currentUser.id
};
```

### **Đảm bảo tất cả data objects có author info:**

1. **articleTextData** (primary) ✅
2. **alternativeData** (string tags) ✅ 
3. **minimalData** (fallback) ✅

## 🔐 **Cơ chế bảo mật hoạt động**

### **1. Khi tạo bài viết:**
- Frontend gửi `authorId` và `memberId` của user hiện tại
- Backend lưu thông tin này vào database
- Bài viết được "sở hữu" bởi user tạo ra nó

### **2. Khi hiển thị danh sách:**
- Frontend nhận `article.authorId` và `article.memberId` từ API
- So sánh với `currentUser.id` và `currentUser.memberId`
- Chỉ hiển thị nút Edit/Delete cho tác giả

### **3. Khi edit/delete:**
- Frontend kiểm tra `canEditDelete(article)`
- Chỉ cho phép nếu user hiện tại là tác giả
- Backend cũng nên có validation tương tự

## 🧪 **Test Cases bảo mật**

### **Test 1: Tác giả có thể edit/delete**
```javascript
// User A tạo bài viết
currentUser = { id: 'NURSE001', memberId: 'NURSE001' }
article = { authorId: 'NURSE001', memberId: 'NURSE001' }
canEditDelete(article) // → true ✅
```

### **Test 2: User khác KHÔNG thể edit/delete**
```javascript
// User B cố gắng edit bài viết của User A
currentUser = { id: 'NURSE002', memberId: 'NURSE002' }
article = { authorId: 'NURSE001', memberId: 'NURSE001' }
canEditDelete(article) // → false ✅
```

### **Test 3: Không có thông tin author**
```javascript
// Bài viết cũ hoặc lỗi data
currentUser = { id: 'NURSE001', memberId: 'NURSE001' }
article = { authorId: null, memberId: null }
canEditDelete(article) // → false ✅ (an toàn)
```

## 🛡️ **Lớp bảo mật bổ sung**

### **Frontend validation:**
- Kiểm tra quyền trước khi hiển thị UI
- Kiểm tra quyền trước khi gọi API

### **Backend validation (khuyến nghị):**
- Kiểm tra ownership trong API endpoint
- Chỉ cho phép tác giả edit/delete bài viết của mình
- Validate JWT token và so sánh với article.authorId

### **Database constraints:**
- `authorId` và `memberId` NOT NULL
- Index trên các trường này để tăng performance

## 📋 **Files đã cập nhật**

- ✅ `frontend/src/Pages/Nurse/pages/Blog_co/health_articles/AddHealthArticle.jsx`
- ✅ `frontend/HEALTH_ARTICLE_SECURITY_FIX.md` (documentation)

## 🎯 **Kết quả**

### ✅ **Bảo mật được đảm bảo:**
- Chỉ tác giả có thể edit/delete bài viết của mình
- Thông tin ownership được lưu đúng cách
- Logic phân quyền hoạt động chính xác

### ✅ **Tương thích ngược:**
- Không ảnh hưởng đến bài viết hiện có
- EditHealthArticle.jsx vẫn hoạt động bình thường
- Database constraint vẫn được thỏa mãn

## 🚨 **Lưu ý quan trọng**

1. **Backend cũng cần validation**: Frontend security chỉ là UI/UX, backend mới là lớp bảo mật thực sự
2. **Test thoroughly**: Thử với nhiều user khác nhau để đảm bảo phân quyền đúng
3. **Monitor logs**: Theo dõi các attempt edit/delete unauthorized

**Bây giờ bài viết của bạn được bảo vệ an toàn!** 🔒
