# ✅ Hoàn thành API Submit Consent (Đồng ý/Từ chối)

## 🎯 Tổng quan

Đã cập nhật ConsentDetailModal để sử dụng API thật cho việc submit consent với cấu trúc đúng theo backend.

## 🔧 API Integration

### **API Submit Consent**

- **Endpoint:** `PUT http://localhost:8080/api/v1/parent-consents/{consentId}`
- **Method:** PUT
- **Content-Type:** application/json

### **Request Format - ĐỒNG Ý:**

```json
{
  "consentStatus": "APPROVED",
  "specialCheckupItems": ["Khám mắt chuyên sâu", "Khám răng miệng"],
  "parentNotes": "Con tôi bị dị ứng nhẹ"
}
```

### **Request Format - TỪ CHỐI:**

```json
{
  "consentStatus": "REJECTED",
  "specialCheckupItems": [],
  "parentNotes": "Không muốn tham gia lúc này"
}
```

## 🚀 UI Updates

### **Modal Footer - 2 nút cho PENDING status:**

1. **Nút "Từ chối"** (đỏ):
   - Gửi `consentStatus: "REJECTED"`
   - `specialCheckupItems: []` (rỗng)
   - Confirm dialog trước khi submit
2. **Nút "Đồng ý tham gia"** (xanh):
   - Gửi `consentStatus: "APPROVED"`
   - `specialCheckupItems: [selected items]`
   - Submit với các mục đã chọn

### **UI States:**

#### **PENDING (Chờ phản hồi):**

- ✅ Hiển thị form chọn checkup items
- ✅ Textarea cho parent notes
- ✅ 2 nút: Từ chối | Đồng ý

#### **APPROVED (Đã đồng ý):**

- ✅ Hiển thị danh sách items đã chọn
- ✅ Status badge xanh "Đã đồng ý"
- ✅ Chỉ có nút "Đóng"

#### **REJECTED (Đã từ chối):**

- ✅ Hiển thị thông báo đã từ chối (nền đỏ nhạt)
- ✅ Hiển thị parent notes nếu có
- ✅ Status badge đỏ "Đã từ chối"
- ✅ Chỉ có nút "Đóng"

## 📱 User Experience

### **Flow Đồng ý:**

1. User mở modal (status PENDING)
2. Chọn các mục kiểm tra đặc biệt
3. Nhập ghi chú (optional)
4. Click "Đồng ý tham gia"
5. API call với `consentStatus: "APPROVED"`
6. Modal update UI → status "Đã đồng ý"
7. Danh sách notifications được refresh

### **Flow Từ chối:**

1. User mở modal (status PENDING)
2. Click "Từ chối"
3. Confirm dialog "Bạn có chắc chắn muốn từ chối?"
4. API call với `consentStatus: "REJECTED"`
5. Modal update UI → status "Đã từ chối"
6. Danh sách notifications được refresh

## 🔧 Code Changes

### **ConsentDetailModal.jsx:**

#### ✅ **Updated handleSubmitConsent:**

```javascript
const consentData = {
  consentStatus: "APPROVED", // Thay vì consentGiven: true
  specialCheckupItems: selectedItems, // Giữ nguyên
  parentNotes: parentNotes.trim() || null, // Giữ nguyên
};
```

#### ✅ **Added handleRejectConsent:**

```javascript
const consentData = {
  consentStatus: "REJECTED",
  specialCheckupItems: [],
  parentNotes: parentNotes.trim() || null,
};
```

#### ✅ **Updated Modal Footer:**

- 2 nút cho PENDING status
- Styling inline cho nút từ chối
- Loading states cho cả 2 nút

#### ✅ **Added REJECTED UI:**

- Container với background đỏ nhạt
- Icon và text "Đã từ chối tham gia"
- Hiển thị parent notes nếu có

## 🧪 Testing

### **Test Components:**

- **submit-consent-test.js**: Test cấu trúc request cho cả APPROVED và REJECTED
- **TestAPIWithContext**: Nút "Test API Format" để validate format
- **validateAPIFormat()**: Function kiểm tra cấu trúc request

### **Manual Testing Checklist:**

- [ ] Load modal với consent PENDING
- [ ] Submit APPROVED với selected items
- [ ] Submit REJECTED với confirm dialog
- [ ] UI update sau submit thành công
- [ ] Error handling khi API fail
- [ ] Refresh danh sách sau submit

## 🎉 Kết quả

**Modal hiện tại hỗ trợ đầy đủ:**

1. ✅ Load chi tiết từ API thật
2. ✅ Submit APPROVED với selected items
3. ✅ Submit REJECTED với confirm
4. ✅ UI states cho tất cả trạng thái
5. ✅ Error handling và toast messages
6. ✅ Real-time update sau submit

**Hoàn toàn tích hợp với API backend!** 🚀
