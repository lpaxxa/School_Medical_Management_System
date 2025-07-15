# Community Service API Documentation

## Overview

Service để quản lý các tính năng cộng đồng trong ứng dụng School Medical Management System, bao gồm posts, comments, replies, likes và bookmarks.

## Configuration

### Environment Variables

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_BACKEND_URL=http://localhost:8080
NODE_ENV=development
```

### API Base URL

Service sử dụng `VITE_API_BASE_URL` từ environment variables, fallback về localhost nếu không được cấu hình.

## Features

### 1. Posts Management

- ✅ Lấy danh sách bài đăng (có phân trang, filter, search)
- ✅ Tạo bài đăng mới
- ✅ Lấy chi tiết bài đăng
- ✅ Like/unlike bài đăng
- ✅ Bookmark/unbookmark bài đăng
- ✅ Lấy danh sách bài đăng đã bookmark

### 2. Comments Management

- ✅ Lấy bình luận của bài đăng (có phân trang)
- ✅ Thêm bình luận mới
- ✅ Cập nhật bình luận
- ✅ Xóa bình luận
- ✅ Like/unlike bình luận

### 3. Replies Management

- ✅ Lấy phản hồi của bình luận (có phân trang)
- ✅ Thêm phản hồi mới
- ✅ Cập nhật phản hồi
- ✅ Xóa phản hồi
- ✅ Like/unlike phản hồi

### 4. Utility Functions

- ✅ Test API connection
- ✅ Lấy thống kê community
- ✅ Báo cáo nội dung vi phạm

## Usage Examples

### Import Service

```javascript
import communityService from "../services/communityService";
// Hoặc import specific functions
import {
  validateResponse,
  buildUrl,
  COMMUNITY_ENDPOINTS,
} from "../services/communityService";
```

### Get Posts with Pagination and Filters

```javascript
const fetchPosts = async () => {
  try {
    const result = await communityService.getPosts(
      1,
      10,
      "health-guide",
      "vaccination"
    );
    console.log("Posts:", result.data.content);
    console.log("Total pages:", result.data.totalPages);
  } catch (error) {
    console.error("Error:", error.message);
  }
};
```

### Create New Post

```javascript
const createNewPost = async () => {
  try {
    const postData = {
      title: "Hướng dẫn chăm sóc trẻ bị sốt",
      content: "Nội dung chi tiết...",
      category: "health-guide",
      tags: ["sốt", "trẻ em", "chăm sóc"],
    };

    const result = await communityService.createPost(postData);
    console.log("Created post:", result.data);
  } catch (error) {
    console.error("Error:", error.message);
  }
};
```

### Like a Post

```javascript
const handleLike = async (postId) => {
  try {
    const result = await communityService.toggleLike(postId);
    console.log("Like status:", result.data.liked);
    console.log("Total likes:", result.data.likesCount);
  } catch (error) {
    console.error("Error:", error.message);
  }
};
```

### Add Comment

```javascript
const addComment = async (postId, content) => {
  try {
    const result = await communityService.addComment(postId, content);
    console.log("New comment:", result.data);
  } catch (error) {
    console.error("Error:", error.message);
  }
};
```

### Get Comments with Pagination

```javascript
const fetchComments = async (postId, page = 1) => {
  try {
    const result = await communityService.getComments(postId, page, 10);
    console.log("Comments:", result.data.content);
  } catch (error) {
    console.error("Error:", error.message);
  }
};
```

## Error Handling

Service sử dụng error handling chuẩn với meaningful error messages:

```javascript
try {
  const result = await communityService.getPosts();
} catch (error) {
  // Error được throw với message tiếng Việt dễ hiểu
  console.error(error.message); // "Không thể tải danh sách bài viết"

  // Original error vẫn có thể access được
  console.error(error.cause); // Original axios error
}
```

## API Response Format

Service expect backend trả về format chuẩn:

```javascript
{
  "status": "success",
  "data": {
    "content": [...], // Array of items
    "totalElements": 100,
    "totalPages": 10,
    "currentPage": 1
  },
  "message": "Success message"
}
```

## Authentication

Service tự động thêm Bearer token vào header từ localStorage:

```javascript
headers: {
  'Authorization': `Bearer ${localStorage.getItem('authToken')}`
}
```

## Validation

### Input Validation

- Post ID phải là số hợp lệ
- Content không được để trống
- Category và tags được chuẩn hóa

### Response Validation

- Kiểm tra response structure
- Validate data types
- Handle missing fields

## Configuration Options

### Axios Instance Configuration

```javascript
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 seconds
  headers: {
    "Content-Type": "application/json",
  },
});
```

### Request/Response Interceptors

- Tự động thêm auth token
- Log requests trong development mode
- Handle common errors (401, 403, etc.)
- Validate response format

## Best Practices

### 1. Always use try-catch

```javascript
const handleAction = async () => {
  try {
    const result = await communityService.someMethod();
    // Handle success
  } catch (error) {
    // Handle error with user-friendly message
    showNotification(error.message, "error");
  }
};
```

### 2. Validate input before API calls

```javascript
if (!postId || isNaN(postId)) {
  throw new Error("ID bài viết không hợp lệ");
}
```

### 3. Use consistent error messages

Service đã chuẩn hóa error messages tiếng Việt để hiển thị cho user.

### 4. Leverage utility functions

```javascript
import {
  COMMUNITY_ENDPOINTS,
  validateResponse,
} from "../services/communityService";

// Use endpoints constants
const url = COMMUNITY_ENDPOINTS.POSTS.GET_BY_ID(postId);

// Use validation helper
const validData = validateResponse(response);
```

## Future Enhancements

- [ ] Add caching mechanism với React Query
- [ ] Implement optimistic updates
- [ ] Add real-time notifications với WebSocket
- [ ] Batch operations support
- [ ] File upload support cho posts/comments
- [ ] Advanced search với Elasticsearch

## Troubleshooting

### Common Issues

1. **401 Authentication Error**

   - Check if authToken exists in localStorage
   - Verify token hasn't expired
   - Ensure user is logged in

2. **Network Timeout**

   - Check API server status
   - Verify VITE_API_BASE_URL configuration
   - Check network connectivity

3. **Invalid Response Format**
   - Verify backend returns correct JSON structure
   - Check API version compatibility
   - Enable debug logging in development

### Debug Mode

```javascript
// Enable debug logging in development
if (import.meta.env.NODE_ENV === "development") {
  console.log("API Request:", config);
}
```
