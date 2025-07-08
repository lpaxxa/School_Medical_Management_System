# Health Campaign Notification Feature

## Tính năng Gửi Thông Báo Chiến Dịch

### Mô tả

Tính năng cho phép gửi thông báo về chiến dịch kiểm tra sức khỏe đến học sinh theo khối lớp.

### Cách sử dụng

1. **Mở Modal Gửi Thông Báo**

   - Click nút "Gửi thông báo" (📧) trên bất kỳ chiến dịch nào
   - Modal sẽ mở và tự động tải danh sách học sinh

2. **Chọn Khối Học Sinh**

   - **Tất cả các khối**: Gửi cho tất cả học sinh
   - **Khối cụ thể**: Chọn khối 1, 2, 3, 4, hoặc 5
   - **Nhiều khối**: Có thể chọn nhiều khối cùng lúc

3. **Xác nhận Gửi**
   - Kiểm tra tóm tắt số lượng học sinh sẽ nhận thông báo
   - Click "Gửi Thông Báo" để xác nhận

### Logic Lọc Học Sinh

```javascript
// Học sinh thuộc khối 1: className bắt đầu bằng "1"
// Ví dụ: "1A", "1B", "10A", "11B" đều thuộc khối 1

const isGrade1Student = (student) => {
  const className = student.className || student.class_name || "";
  return className.toString().startsWith("1");
};
```

### API Endpoint

```http
POST /api/v1/health-campaigns/{campaignId}/send-notifications
Content-Type: application/json
Authorization: Bearer {token}

[1, 2, 3, 4, 5]  // Array of student IDs
```

### Ví dụ Thực Tế

**Scenario**: Gửi thông báo cho khối 1 và 2

1. **Danh sách học sinh**:

   - ID: 1, Tên: "Nguyễn Văn A", Lớp: "1A" ✅
   - ID: 2, Tên: "Trần Thị B", Lớp: "1B" ✅
   - ID: 3, Tên: "Lê Văn C", Lớp: "2A" ✅
   - ID: 4, Tên: "Phạm Thị D", Lớp: "3A" ❌
   - ID: 5, Tên: "Hoàng Văn E", Lớp: "2B" ✅

2. **Request gửi đi**:

   ```json
   POST /api/v1/health-campaigns/16/send-notifications
   [1, 2, 3, 5]
   ```

3. **Kết quả**: 4 học sinh nhận thông báo (khối 1: 2 học sinh, khối 2: 2 học sinh)

### Xử Lý Lỗi

- **Không chọn khối**: "Vui lòng chọn ít nhất một khối học sinh!"
- **Không có học sinh**: "Không tìm thấy học sinh nào thuộc khối đã chọn!"
- **Lỗi API**: Hiển thị thông báo lỗi chi tiết
- **Lỗi mạng**: "Gửi thông báo thất bại: {error message}"

### Thông Báo Thành Công

Sau khi gửi thành công, hiển thị SuccessModal với:

- **Tiêu đề**: "Gửi thông báo thành công!"
- **Thông điệp**: "Thông báo đã được gửi đến {X} học sinh."
- **Chi tiết**: "Thông báo về chiến dịch '{campaign_title}' đã được gửi đến {grade_list}."

### Tích Hợp

File chính: `HealthCampaignHistory.jsx`

**States mới**:

```javascript
const [showNotificationModal, setShowNotificationModal] = useState(false);
const [students, setStudents] = useState([]);
const [selectedGrades, setSelectedGrades] = useState([]);
const [isAllGradesSelected, setIsAllGradesSelected] = useState(false);
```

**Functions mới**:

- `loadStudents()`: Tải danh sách học sinh
- `handleGradeSelection()`: Xử lý chọn khối
- `getStudentIdsByGrades()`: Lấy ID học sinh theo khối
- `handleConfirmSendNotification()`: Gửi thông báo

**CSS mới**: Trong `HealthCampaignHistory.css` - phần "Notification Modal Styles"
