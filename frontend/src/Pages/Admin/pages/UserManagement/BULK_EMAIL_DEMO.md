# Bulk Email Demo Guide

## 🎯 Hướng dẫn test tính năng Bulk Email

### Bước 1: Truy cập User Management
1. Mở browser và truy cập: `http://localhost:5174`
2. Đăng nhập với tài khoản admin
3. Navigate đến **Quản lý người dùng**

### Bước 2: Kiểm tra Bulk Actions Header
Bạn sẽ thấy một section mới phía trên table:
```
┌─────────────────────────────────────────────────────────┐
│ Chưa chọn người dùng nào    [Gửi tất cả] [Gửi đã chọn] │
└─────────────────────────────────────────────────────────┘
```

### Bước 3: Test Checkbox Selection

**Test Select All:**
1. Click checkbox ở header (cột đầu tiên)
2. ✅ Tất cả rows sẽ được highlight màu xanh
3. ✅ Text sẽ thay đổi: "Đã chọn X người dùng"
4. ✅ Button "Gửi đã chọn" sẽ hiển thị số lượng

**Test Individual Selection:**
1. Uncheck header checkbox
2. Tick từng checkbox ở các rows
3. ✅ Chỉ rows được chọn sẽ highlight
4. ✅ Counter sẽ cập nhật real-time

### Bước 4: Test Send All Functionality

**Scenario 1: Có users chưa gửi email**
1. Click button **"Gửi tất cả"**
2. ✅ Confirmation dialog xuất hiện với preview
3. ✅ Hiển thị danh sách users sẽ được gửi
4. Click **"Xác nhận"**
5. ✅ Loading spinner xuất hiện
6. ✅ Success notification
7. ✅ Button disable cho users đã gửi

**Scenario 2: Tất cả users đã gửi email**
1. ✅ Button "Gửi tất cả" sẽ bị disable
2. ✅ Tooltip hiển thị lý do

### Bước 5: Test Send Selected Functionality

**Scenario 1: Chọn users chưa gửi email**
1. Tick checkbox một số users chưa gửi
2. Click **"Gửi đã chọn (X)"**
3. ✅ Confirmation dialog với selected users
4. Click **"Xác nhận"**
5. ✅ Loading spinner
6. ✅ Success notification
7. ✅ Selection được clear
8. ✅ Users đã gửi được update

**Scenario 2: Chọn users đã gửi email**
1. Tick checkbox users đã gửi email
2. ✅ Button "Gửi đã chọn" sẽ disable
3. ✅ Tooltip: "Tất cả users đã chọn đã được gửi email"

**Scenario 3: Không chọn user nào**
1. Uncheck tất cả checkboxes
2. ✅ Button "Gửi đã chọn" disable
3. ✅ Tooltip: "Vui lòng chọn ít nhất một người dùng"

### Bước 6: Test localStorage Persistence

**Test Refresh Page:**
1. Gửi email cho một số users
2. Refresh trang (F5)
3. ✅ Trạng thái email đã gửi vẫn được giữ
4. ✅ Buttons vẫn disable đúng

**Test User Update Reset:**
1. Gửi email cho user A
2. Edit thông tin user A và save
3. ✅ Trạng thái email của user A được reset
4. ✅ Có thể gửi email lại cho user A

### Bước 7: Test Responsive Design

**Desktop (>768px):**
- ✅ Full layout với text labels
- ✅ Buttons hiển thị đầy đủ text

**Tablet (768px-480px):**
- ✅ Compact layout
- ✅ Buttons responsive

**Mobile (<480px):**
- ✅ Stacked layout
- ✅ Icon-only buttons
- ✅ Smaller checkboxes

### Bước 8: Test Error Handling

**Test Network Error:**
1. Disconnect internet
2. Try gửi bulk email
3. ✅ Error notification xuất hiện
4. ✅ Loading state được clear

**Test API Error:**
1. Sử dụng invalid token
2. Try gửi email
3. ✅ Authentication error message
4. ✅ Redirect to login nếu cần

### Bước 9: Test Console Debug

**Mở Browser Console:**
```javascript
// Test localStorage utilities
window.emailSentStatusUtils.getSentEmailUsers()
window.emailSentStatusUtils.clearAllSentStatus()

// Test bulk email functions
window.bulkEmailTests.runAllBulkEmailTests()
```

### Expected Results Summary

✅ **Checkbox System:**
- Select all/individual working
- Visual feedback clear
- Counter accurate

✅ **Bulk Actions:**
- Send all filters correctly
- Send selected works with mixed selection
- Smart button disable logic

✅ **API Integration:**
- Correct payload format
- Error handling comprehensive
- Loading states working

✅ **localStorage:**
- Persistence across refresh
- Reset on user update
- Debug utilities available

✅ **Responsive:**
- All breakpoints working
- Mobile-friendly interface
- Accessible design

✅ **UX:**
- Confirmation dialogs clear
- Success/error notifications
- Intuitive workflow

## 🐛 Common Issues & Solutions

**Issue 1: Checkboxes không hoạt động**
- Solution: Kiểm tra console errors, có thể do missing event handlers

**Issue 2: Button không disable đúng**
- Solution: Kiểm tra logic trong `handleBulkSendEmail` function

**Issue 3: localStorage không persist**
- Solution: Kiểm tra browser settings, có thể bị block localStorage

**Issue 4: API call fail**
- Solution: Kiểm tra network tab, verify endpoint và token

**Issue 5: Responsive không hoạt động**
- Solution: Kiểm tra CSS media queries và viewport settings

## 📞 Support

Nếu gặp vấn đề, kiểm tra:
1. Browser console cho errors
2. Network tab cho API calls
3. localStorage trong Application tab
4. CSS styles trong Elements tab

Happy testing! 🎉
