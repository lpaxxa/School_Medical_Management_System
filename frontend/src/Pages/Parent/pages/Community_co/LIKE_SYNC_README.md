# Hệ thống đồng bộ trạng thái Like giữa Community.jsx và CommunityPost.jsx

## Vấn đề ban đầu

Trước đây, hai trang `Community.jsx` và `CommunityPost.jsx` sử dụng hai cách quản lý trạng thái like khác nhau:

1. **Community.jsx**: Sử dụng localStorage để lưu trạng thái like và có logic merge phức tạp với API
2. **CommunityPost.jsx**: Chỉ sử dụng state local `liked` và không đồng bộ với localStorage

Điều này dẫn đến việc trạng thái tim (like) không đồng bộ giữa hai trang.

## Giải pháp đã triển khai

### 1. Thống nhất cách quản lý state

**CommunityPost.jsx** đã được cập nhật để sử dụng cùng logic với **Community.jsx**:

- Sử dụng `likedPosts` array thay vì `liked` boolean
- Sử dụng localStorage để lưu trạng thái
- Sử dụng cùng `getUserStorageKey()` function

### 2. Custom Events để đồng bộ real-time

Sử dụng browser's custom events để thông báo thay đổi giữa các component:

```javascript
// Dispatch event khi có thay đổi like
window.dispatchEvent(
  new CustomEvent("postLikeChanged", {
    detail: {
      postId: postId,
      liked: isLiked,
      likesCount: likesCount,
      source: "Community" // hoặc "CommunityPost"
    }
  })
);

// Listen for events
useEffect(() => {
  const handlePostLikeChanged = (event) => {
    const { postId, liked, likesCount, source } = event.detail;
    // Update state accordingly
  };

  window.addEventListener("postLikeChanged", handlePostLikeChanged);
  return () => window.removeEventListener("postLikeChanged", handlePostLikeChanged);
}, [dependencies]);
```

### 3. localStorage làm single source of truth

- Cả hai component đều sử dụng localStorage làm nguồn chính xác
- Khi load component, kiểm tra localStorage trước, sau đó merge với API
- Mọi thay đổi đều được lưu vào localStorage ngay lập tức

## Luồng hoạt động

### Scenario 1: User like bài viết từ Community.jsx

1. User click like button trong Community.jsx
2. Community.jsx gọi API toggleLike
3. Cập nhật `likedPosts` state và localStorage
4. Dispatch `postLikeChanged` event
5. Nếu CommunityPost.jsx đang mở cùng bài viết, nó sẽ nhận event và cập nhật UI

### Scenario 2: User like bài viết từ CommunityPost.jsx

1. User click like button trong CommunityPost.jsx
2. CommunityPost.jsx gọi API toggleLike
3. Cập nhật `likedPosts` state và localStorage
4. Dispatch `postLikeChanged` event
5. Community.jsx sẽ nhận event và cập nhật state cho bài viết tương ứng

### Scenario 3: User chuyển giữa các trang

1. Khi load CommunityPost.jsx, nó đọc từ localStorage
2. Merge với dữ liệu từ API
3. Hiển thị trạng thái chính xác
4. Khi quay lại Community.jsx, trạng thái đã được đồng bộ

## Các thay đổi chính

### Community.jsx

1. Thêm event listener cho `postLikeChanged`
2. Thêm event dispatch trong `handlePostLike`
3. Không có thay đổi lớn về logic hiện tại

### CommunityPost.jsx

1. Thêm `getUserStorageKey()` function
2. Thêm `likedPosts` state management
3. Thêm localStorage sync useEffect
4. Thêm event listener và dispatcher
5. Cập nhật `handleLike` để sử dụng localStorage
6. Cập nhật UI để sử dụng `likedPosts.includes(postId)` thay vì `liked`
7. Xóa state `liked` cũ

## Testing

Sử dụng file `utils/testLikeSync.js` để test:

```javascript
// Trong browser console
window.likeSyncTests.runAllTests();
```

## Lợi ích

1. **Đồng bộ real-time**: Thay đổi ở một trang sẽ ngay lập tức phản ánh ở trang khác
2. **Persistent state**: Trạng thái like được lưu trong localStorage
3. **Consistent UX**: User experience nhất quán giữa các trang
4. **Robust**: Hoạt động ngay cả khi API có vấn đề
5. **Scalable**: Có thể mở rộng cho các component khác

## Lưu ý kỹ thuật

1. **Memory leaks**: Đã có cleanup cho event listeners
2. **Performance**: Events chỉ dispatch khi cần thiết
3. **Error handling**: Có xử lý lỗi chi tiết
4. **Debugging**: Có logging chi tiết để debug
5. **Backward compatibility**: Không ảnh hưởng đến logic hiện tại

## Cách mở rộng

Để thêm đồng bộ cho các tính năng khác (bookmark, comment, etc.):

1. Tạo custom event tương tự
2. Thêm localStorage management
3. Thêm event listeners trong các component liên quan
4. Update UI để sử dụng shared state

## Troubleshooting

### Trạng thái không đồng bộ

1. Kiểm tra console logs
2. Kiểm tra localStorage trong DevTools
3. Verify event listeners được setup đúng
4. Kiểm tra postId matching

### Performance issues

1. Kiểm tra event listeners cleanup
2. Verify dependencies trong useEffect
3. Kiểm tra localStorage operations

### API conflicts

1. Kiểm tra merge logic
2. Verify API response structure
3. Kiểm tra error handling
