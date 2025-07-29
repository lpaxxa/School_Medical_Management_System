# API Parent Services

## Tổng quan

Thư mục này chứa tất cả các services API dành riêng cho **Parent role** trong hệ thống School Medical Management.

## Cấu trúc thư mục

```
APIParent/
├── README.md                           # File này
├── index.js                           # Export tất cả services
├── medicalService.js                  # Quản lý hồ sơ y tế học sinh
├── medicationRequestService.js        # Quản lý yêu cầu thuốc
├── communityService.js               # Quản lý cộng đồng phụ huynh
├── healthCheckupConsentService.js    # Quản lý đồng ý khám sức khỏe
├── notificationService.js            # Quản lý thông báo
└── healthGuideService.js             # Quản lý cẩm nang y tế
```

## Services chi tiết

### 1. medicalService.js
**Chức năng**: Quản lý hồ sơ y tế và thông tin sức khỏe học sinh
- `getHealthProfile(studentCode)` - Lấy hồ sơ sức khỏe
- `getMedicalCheckups(studentId)` - Lấy lịch sử kiểm tra y tế
- `getMedicalIncidents(studentId)` - Lấy sự cố y tế
- `getVaccinationHistory(studentId)` - Lấy lịch sử tiêm chủng
- `getGrowthData(studentId)` - Lấy dữ liệu tăng trưởng

### 2. medicationRequestService.js
**Chức năng**: Quản lý yêu cầu thuốc từ phụ huynh
- `fetchMedicationHistory()` - Lấy lịch sử yêu cầu thuốc
- `submitMedicationRequest(requestData)` - Gửi yêu cầu thuốc mới
- `updateMedicationRequest(id, requestData)` - Cập nhật yêu cầu
- `deleteMedicationRequest(id)` - Xóa yêu cầu thuốc

### 3. communityService.js
**Chức năng**: Quản lý cộng đồng phụ huynh (forum, posts, comments)
- `getAllPosts()` - Lấy tất cả bài viết
- `getPostById(id)` - Lấy chi tiết bài viết
- `createPost(postData)` - Tạo bài viết mới
- `updatePost(id, postData)` - Cập nhật bài viết
- `deletePost(id)` - Xóa bài viết
- `likePost(id)` - Like/Unlike bài viết
- `bookmarkPost(id)` - Bookmark bài viết

### 4. healthCheckupConsentService.js
**Chức năng**: Quản lý đồng ý khám sức khỏe định kỳ
- `getConsentDetails(consentId)` - Lấy chi tiết consent
- `submitConsent(consentId, consentData)` - Gửi phản hồi consent
- `getPendingConsents(parentId)` - Lấy consent đang chờ
- `getAllConsents(parentId)` - Lấy tất cả consent

### 5. notificationService.js
**Chức năng**: Quản lý thông báo cho phụ huynh
- `getNotifications(parentId)` - Lấy danh sách thông báo
- `getNotificationDetail(notificationId, parentId)` - Lấy chi tiết thông báo
- `respondToNotification(notificationId, parentId, response)` - Phản hồi thông báo
- `markAsRead(notificationId, parentId)` - Đánh dấu đã đọc

### 6. healthGuideService.js
**Chức năng**: Quản lý cẩm nang y tế
- `getAllArticles()` - Lấy tất cả bài viết y tế
- `getArticleById(id)` - Lấy chi tiết bài viết
- `searchArticles(query)` - Tìm kiếm bài viết

## Nguyên tắc sử dụng

### 1. Import Services
```javascript
// Import từ APIParent (KHÔNG phải services gốc)
import medicalService from "../../../../services/APIParent/medicalService";
import medicationRequestService from "../../../../services/APIParent/medicationRequestService";
import communityService from "../../../../services/APIParent/communityService";

// Hoặc sử dụng named import
import {
  medicalService,
  medicationRequestService,
  communityService,
} from "../../../../services/APIParent";
```

### 2. Authentication
Tất cả services đều sử dụng `sessionService` để quản lý authentication:
```javascript
import sessionService from '../sessionService';

const getAuthHeaders = () => {
  const token = sessionService.getToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};
```

### 3. Error Handling
Tất cả services đều có error handling nhất quán:
```javascript
try {
  const response = await api.get(endpoint);
  return response.data;
} catch (error) {
  console.error('Error description:', error);
  throw error;
}
```

## API Endpoints

### Base URLs
- **API Base**: `${import.meta.env.VITE_API_BASE_URL}` hoặc `${import.meta.env.VITE_BACKEND_URL}/api/v1`
- **Backend**: `${import.meta.env.VITE_BACKEND_URL}`

### Endpoints chính
```javascript
const ENDPOINTS = {
  // Medical Records
  HEALTH_PROFILES: '/health-profiles',
  MEDICAL_CHECKUPS: '/medical-checkups',
  MEDICAL_INCIDENTS: '/medical-incidents',
  VACCINATIONS: '/vaccinations',
  
  // Medication Requests
  MEDICATION_REQUESTS: '/parent-medication-requests',
  
  // Community
  COMMUNITY_POSTS: '/community/posts',
  COMMUNITY_COMMENTS: '/community/comments',
  
  // Notifications
  NOTIFICATIONS: '/notifications',
  
  // Health Guide
  HEALTH_ARTICLES: '/health-articles',
  
  // Consents
  PARENT_CONSENTS: '/parent-consents'
};
```

## Migration từ services cũ

### Files đã di chuyển:
1. `services/medicalService.js` → `APIParent/medicalService.js`
2. `services/medicationRequestService.js` → `APIParent/medicationRequestService.js`
3. `services/communityService.js` → `APIParent/communityService.js`
4. `services/healthCheckupConsentService.js` → `APIParent/healthCheckupConsentService.js`
5. `services/notificationService.js` → `APIParent/notificationService.js`
6. `services/HealthGuideService.js` → `APIParent/healthGuideService.js`

### Cập nhật import paths:
```javascript
// CŨ
import medicalService from "../../../services/medicalService";

// MỚI
import medicalService from "../../../services/APIParent/medicalService";
```

## Lưu ý quan trọng

1. **Tách biệt rõ ràng**: APIParent chỉ chứa services cho Parent role
2. **Không conflict**: Không sử dụng chung services với Admin hoặc Nurse
3. **Consistent naming**: Tất cả file đều sử dụng camelCase
4. **Session management**: Sử dụng sessionService cho authentication
5. **Error handling**: Nhất quán trong xử lý lỗi

## Testing

Mỗi service nên được test với:
- Unit tests cho các functions
- Integration tests với API endpoints
- Error handling tests

## Maintenance

- Cập nhật README khi thêm service mới
- Maintain consistent code style
- Update API endpoints khi backend thay đổi
