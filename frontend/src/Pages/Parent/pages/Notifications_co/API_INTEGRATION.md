# API Integration với Parent ID từ StudentProfile

## 📋 Tổng quan

Trang **Thông báo** đã được cập nhật để sử dụng Parent ID thực tế từ **StudentProfile** thay vì hardcode ID = 1.

## 🔧 Cách hoạt động

### 1. Lấy Parent ID từ Context

```javascript
const getParentId = () => {
  // Ưu tiên: Lấy từ parentInfo (từ StudentProfile)
  if (parentInfo?.id) {
    return parentInfo.id;
  }

  // Fallback: Lấy từ student data
  if (students?.length > 0 && students[0].parentId) {
    return students[0].parentId;
  }

  return null;
};
```

### 2. API Call với Parent ID thực tế

```javascript
const response = await healthCheckupConsentService.getAllConsents(parentId);
```

**API Endpoint:** `http://localhost:8080/api/v1/parent-consents/parent/{parentId}/all-children`

### 3. Nguồn dữ liệu Parent ID

#### Từ StudentDataContext:

- **parentInfo.id**: Thông tin phụ huynh được load từ StudentProfile
- **students[0].parentId**: ID phụ huynh từ danh sách học sinh

#### Luồng dữ liệu:

1. User đăng nhập → `currentUser` có thông tin
2. StudentDataContext fetch students → có `parentId` trong mỗi student
3. StudentDataContext fetch parent info → có `parentInfo.id`
4. Notifications component sử dụng parentId để gọi API

## 🧪 Testing

### Component Test:

- **TestAPIWithContext**: Component test hiển thị Parent ID hiện tại và cho phép test API
- **api-test.js**: Script test API với Parent ID tùy chỉnh

### Cách test:

1. Đảm bảo đã đăng nhập với role "parent"
2. Vào trang StudentProfile để load parent info
3. Vào trang Notifications
4. Click nút "Test API với Parent ID thực tế" trong component test

## 🔍 API Response Structure

```json
{
  "parentId": 1,
  "parentName": "Nguyễn Văn Hùng",
  "totalNotifications": 3,
  "pendingConsents": 3,
  "approvedConsents": 0,
  "completedCheckups": 0,
  "childrenNotifications": [
    {
      "studentId": 1,
      "studentName": "Nguyễn Minh An",
      "studentClass": "1A1",
      "studentAge": 9,
      "totalNotifications": 1,
      "notifications": [
        {
          "consentId": 1,
          "healthCampaignId": 14,
          "campaignTitle": "Kiểm tra sức khỏe định kỳ học kỳ I năm 2024-2025",
          "campaignDescription": "Chiến dịch kiểm tra sức khỏe toàn diện...",
          "campaignStartDate": "2024-12-01",
          "campaignEndDate": "2024-12-15",
          "campaignStatus": "PREPARING",
          "consentStatus": "PENDING",
          "createdAt": "2025-07-06T00:39:19.907235",
          "updatedAt": "2025-07-06T00:39:19.907235"
        }
      ]
    }
  ]
}
```

## ✅ Đã cập nhật

1. **getParentId()**: Sử dụng Parent ID từ context thay vì hardcode
2. **API Integration**: Gọi API với Parent ID thực tế
3. **Data Transformation**: Bao gồm đầy đủ fields từ API response
4. **Demo Data**: Đồng bộ với cấu trúc API thực tế
5. **Test Components**: Thêm component test với context thực tế

## 🚀 Sẵn sàng sử dụng

Hệ thống hiện tại đã hoàn toàn tích hợp với Parent ID từ StudentProfile và sẵn sàng hoạt động với dữ liệu thực tế!
