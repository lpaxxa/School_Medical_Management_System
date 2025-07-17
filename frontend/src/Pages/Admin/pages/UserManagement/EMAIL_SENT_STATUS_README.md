# Hệ thống quản lý trạng thái Email đã gửi trong UserTable

## Vấn đề ban đầu

Trước đây, khi email đã được gửi thành công cho một user, nút "Gửi email" vẫn có thể được click lại nhiều lần, dẫn đến việc gửi email trùng lặp và không kiểm soát được.

## Yêu cầu mới

Khi email đã được gửi thành công:
1. Nút "Gửi email" sẽ bị vô hiệu hóa (disabled)
2. Hiển thị icon check (✓) thay vì icon envelope
3. Tooltip hiển thị "Email đã được gửi. Cập nhật thông tin user để có thể gửi lại"
4. **Chỉ khi nào admin cập nhật thông tin user thì nút mới được kích hoạt lại**

## Giải pháp đã triển khai

### 1. State Management trong UserTable.jsx

```javascript
// State để track users đã được gửi email
const [sentEmailUsers, setSentEmailUsers] = useState([]);

// Prop nhận từ parent component
updatedUserIds = [] // Array chứa IDs của users đã được cập nhật

// Effect để reset trạng thái email khi user được cập nhật
useEffect(() => {
  if (updatedUserIds.length > 0) {
    setSentEmailUsers(prev => 
      prev.filter(userId => !updatedUserIds.includes(userId))
    );
  }
}, [updatedUserIds]);
```

### 2. Logic trong UserManagement.jsx

```javascript
// State để track users đã được cập nhật
const [updatedUserIds, setUpdatedUserIds] = useState([]);

// Trong handleSaveUser khi edit thành công
if (modalMode === "edit") {
  await updateUser(userData.id, editData);
  
  // Thêm user ID vào danh sách đã cập nhật
  setUpdatedUserIds(prev => [...prev, userData.id]);
  
  showSuccess("Cập nhật người dùng thành công!");
}

// Auto cleanup sau 5 giây để tránh memory leak
useEffect(() => {
  if (updatedUserIds.length > 0) {
    const timer = setTimeout(() => {
      setUpdatedUserIds([]);
    }, 5000);
    return () => clearTimeout(timer);
  }
}, [updatedUserIds]);
```

### 3. UI Logic trong UserTable.jsx

```javascript
// Button disabled khi email đã được gửi
disabled={
  (isSendingEmail && sendingUserId === user.id) ||
  sentEmailUsers.includes(user.id)
}

// Tooltip thông báo rõ ràng
title={
  sentEmailUsers.includes(user.id)
    ? "Email đã được gửi. Cập nhật thông tin user để có thể gửi lại"
    : "Gửi thông tin tài khoản qua email"
}

// Icon thay đổi theo trạng thái
{isSendingEmail && sendingUserId === user.id ? (
  <FaSpinner className="spin-icon" />
) : sentEmailUsers.includes(user.id) ? (
  <FaCheck className="check-icon" />
) : (
  <FaEnvelope className="envelope-icon" />
)}
```

## Luồng hoạt động

### Scenario 1: Gửi email lần đầu

1. Admin click nút "Gửi email" cho user A
2. `onSendEmail(user)` được gọi
3. `setSentEmailUsers(prev => [...prev, user.id])` - thêm user A vào danh sách đã gửi
4. Nút bị disable, icon chuyển thành check (✓)
5. Tooltip hiển thị "Email đã được gửi..."

### Scenario 2: Cố gắng gửi email lại (bị chặn)

1. Admin click nút "Gửi email" cho user A (đã gửi trước đó)
2. Nút bị disabled, không có action nào xảy ra
3. Tooltip hiển thị hướng dẫn cập nhật thông tin

### Scenario 3: Cập nhật thông tin user và gửi lại email

1. Admin click "Chỉnh sửa" cho user A
2. Cập nhật thông tin (email, phone, etc.)
3. Click "Lưu" → `handleSaveUser` được gọi
4. `setUpdatedUserIds(prev => [...prev, userData.id])` - thêm user A vào danh sách đã cập nhật
5. `useEffect` trong UserTable detect thay đổi
6. `setSentEmailUsers(prev => prev.filter(userId => !updatedUserIds.includes(userId)))` - xóa user A khỏi danh sách đã gửi email
7. Nút "Gửi email" được kích hoạt lại, icon chuyển về envelope
8. Admin có thể gửi email lại

### Scenario 4: Auto cleanup

1. Sau 5 giây kể từ khi cập nhật
2. `setUpdatedUserIds([])` - clear danh sách để tránh memory leak
3. Không ảnh hưởng đến trạng thái email đã gửi

## Các thay đổi chính

### UserTable.jsx

1. **Thêm prop mới**: `updatedUserIds = []`
2. **Thêm useEffect**: Reset email sent status khi user được cập nhật
3. **Cập nhật tooltip**: Thông báo rõ ràng hơn
4. **Logic disable**: Giữ nguyên logic cũ + thêm check email đã gửi

### UserManagement.jsx

1. **Thêm state**: `updatedUserIds` để track users đã cập nhật
2. **Cập nhật handleSaveUser**: Thêm user ID vào danh sách khi edit thành công
3. **Thêm useEffect**: Auto cleanup sau 5 giây
4. **Truyền prop**: `updatedUserIds` cho UserTable

## Lợi ích

✅ **Ngăn chặn spam email**: Không thể gửi email trùng lặp

✅ **UX rõ ràng**: User biết email đã được gửi và cách để gửi lại

✅ **Logic hợp lý**: Chỉ cho phép gửi lại sau khi cập nhật thông tin

✅ **Performance tốt**: Auto cleanup tránh memory leak

✅ **Maintainable**: Code dễ hiểu và mở rộng

## Testing

Sử dụng file `utils/emailSentStatusTest.js` để test:

```javascript
// Trong browser console
window.emailStatusTests.runAllEmailStatusTests();
```

## Lưu ý kỹ thuật

1. **State persistence**: Trạng thái email chỉ lưu trong session, refresh trang sẽ reset
2. **Memory management**: Auto cleanup sau 5 giây để tránh memory leak
3. **Race conditions**: Logic đã handle trường hợp multiple updates
4. **Error handling**: Nếu update fail, trạng thái email vẫn được giữ nguyên

## Cách mở rộng

Để thêm tính năng tương tự cho các actions khác:

1. Tạo state tracking tương tự (ví dụ: `sentSMSUsers`)
2. Thêm logic reset trong useEffect
3. Cập nhật UI components tương ứng
4. Thêm prop và logic trong parent component

## Troubleshooting

### Email button không reset sau khi update

1. Kiểm tra `updatedUserIds` có được set đúng không
2. Verify useEffect dependencies
3. Check console logs để debug

### Memory leak issues

1. Kiểm tra cleanup timer có hoạt động không
2. Verify useEffect cleanup functions
3. Monitor state size trong DevTools

### UI không update

1. Kiểm tra prop passing từ parent
2. Verify state updates trong UserTable
3. Check re-render triggers
