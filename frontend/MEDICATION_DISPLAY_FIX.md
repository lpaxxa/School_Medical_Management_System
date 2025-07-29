# Sửa lỗi hiển thị thuốc trong Modal Cập nhật Sự kiện Y tế

## Vấn đề
Khi thêm thuốc "Viên sủi paracetamol 500mg" trong modal thêm sự kiện y tế, thuốc hiển thị đúng. Nhưng khi vào modal cập nhật sự kiện y tế, thuốc lại hiển thị tên khác.

## Nguyên nhân
Trong `MedicalIncidentUpdateModal.jsx`, hệ thống cố gắng tìm thuốc trong kho hiện tại bằng ID và hiển thị tên từ kho thay vì tên đã lưu trong sự kiện. Điều này gây ra vấn đề khi:

1. Thuốc đã bị xóa khỏi kho
2. Tên thuốc đã được thay đổi trong kho
3. ID không khớp → hiển thị tên mặc định `Thuốc #${ID}`

## Giải pháp đã áp dụng

### 1. Ưu tiên tên thuốc đã lưu trong sự kiện
**File:** `frontend/src/Pages/Nurse/pages/MedicalEvents_co/MedicalIncidents/MedicalIncidentUpdateModal.jsx`

**Thay đổi dòng 223:**
```javascript
// Trước
itemName: inventoryItem ? inventoryItem.itemName : (med.itemName || `Thuốc #${med.itemID}`),

// Sau  
itemName: med.itemName || (inventoryItem ? inventoryItem.itemName : `Thuốc #${med.itemID}`),
```

**Thay đổi dòng 444:**
```javascript
// Trước
itemName: foundItem.itemName,

// Sau
itemName: name, // Ưu tiên tên thuốc gốc từ sự kiện để đảm bảo tính nhất quán
```

### 2. Cải thiện thông báo cho người dùng

**Thêm thông báo giải thích:**
```javascript
<Alert variant="info" className="mb-3">
  <i className="fas fa-info-circle me-2"></i>
  <strong>Lưu ý:</strong> Danh sách hiển thị thuốc đã được sử dụng trong sự kiện này. 
  Thuốc có thể không còn trong kho hiện tại nhưng vẫn được hiển thị để đảm bảo tính chính xác của hồ sơ y tế.
</Alert>
```

**Cải thiện badge cảnh báo:**
```javascript
<Badge bg="warning" className="mb-2" title="Thuốc này đã được sử dụng trong sự kiện nhưng hiện không còn trong kho">
  <i className="fas fa-exclamation-triangle me-1"></i>
  Không có trong kho hiện tại
</Badge>
```

## Kết quả mong đợi
- Thuốc "Viên sủi paracetamol 500mg" sẽ hiển thị đúng tên trong cả modal thêm và modal cập nhật
- Người dùng hiểu rõ lý do tại sao thuốc vẫn hiển thị dù có thể không còn trong kho
- Đảm bảo tính nhất quán và chính xác của hồ sơ y tế

## Các vấn đề bổ sung đã sửa

### 4. Thuốc đã thêm nhưng không có trong kho
**Nguyên nhân:** Cache không được refresh sau khi thêm thuốc mới
**Giải pháp:**
- Force refresh cache khi tìm kiếm thuốc: `getAllItems(true)`
- Thêm comment giải thích trong code

### 5. Ảnh tự động thêm vào khi không chọn
**Nguyên nhân:** `imageUrl = ''` vẫn được gửi lên API
**Giải pháp:**
```javascript
// Thay đổi từ:
let imageUrl = '';

// Thành:
let imageUrl = null;
// và
imageMedicalUrl: imageUrl || '',
```

### 6. Ảnh không hiển thị preview trong UpdateModal
**Nguyên nhân:** Code đã comment out phần hiển thị ảnh từ database
**Giải pháp:**
```javascript
// Khôi phục hiển thị ảnh hiện có
if (selectedEvent.imageMedicalUrl && selectedEvent.imageMedicalUrl.trim() !== '') {
  setImagePreview(selectedEvent.imageMedicalUrl);
} else {
  setImagePreview('');
}
```

## Cách kiểm tra
1. **Thuốc hiển thị đúng:**
   - Thêm thuốc "Viên sủi paracetamol 500mg" vào kho
   - Tạo sự kiện y tế mới và chọn thuốc này
   - Lưu sự kiện
   - Vào xem chi tiết sự kiện → thuốc hiển thị đúng
   - Vào cập nhật sự kiện → thuốc vẫn hiển thị đúng tên "Viên sủi paracetamol 500mg"

2. **Thuốc mới có trong kho:**
   - Thêm thuốc mới vào kho
   - Ngay lập tức tìm kiếm thuốc trong modal sự kiện → thuốc mới xuất hiện

3. **Ảnh không tự động thêm:**
   - Tạo sự kiện y tế mới mà không chọn ảnh
   - Kiểm tra database → không có ảnh rỗng được lưu

4. **Ảnh hiển thị preview đúng:**
   - Tạo sự kiện có ảnh
   - Vào cập nhật sự kiện → ảnh hiện có được hiển thị
   - Thêm ảnh mới → preview hiển thị đúng
