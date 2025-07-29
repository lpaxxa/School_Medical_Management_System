# Migration Guide - APIParent Services

## Tổng quan

Đã tạo thư mục **APIParent** để tổ chức lại các services dành riêng cho Parent role, đồng bộ với cấu trúc **APIAdmin** và **APINurse**.

## Files đã di chuyển

### 1. medicalService.js
- **Từ**: `services/medicalService.js`
- **Đến**: `services/APIParent/medicalService.js`
- **Chức năng**: Quản lý hồ sơ y tế, sự cố y tế, tiêm chủng, kiểm tra sức khỏe

### 2. medicationRequestService.js
- **Từ**: `services/medicationRequestService.js`
- **Đến**: `services/APIParent/medicationRequestService.js`
- **Chức năng**: Quản lý yêu cầu thuốc từ phụ huynh

### 3. communityService.js
- **Từ**: `services/communityService.js`
- **Đến**: `services/APIParent/communityService.js`
- **Chức năng**: Quản lý cộng đồng phụ huynh (posts, comments, likes)

### 4. healthCheckupConsentService.js
- **Từ**: `services/healthCheckupConsentService.js`
- **Đến**: `services/APIParent/healthCheckupConsentService.js`
- **Chức năng**: Quản lý đồng ý khám sức khỏe định kỳ

### 5. notificationService.js
- **Từ**: `services/notificationService.js`
- **Đến**: `services/APIParent/notificationService.js`
- **Chức năng**: Quản lý thông báo cho phụ huynh

### 6. healthGuideService.js
- **Từ**: `services/HealthGuideService.js`
- **Đến**: `services/APIParent/healthGuideService.js`
- **Chức năng**: Quản lý cẩm nang y tế

## Cập nhật Import Paths

### Cần cập nhật trong các files sau:

#### 1. Parent Components
```javascript
// CŨ
import medicalService from "../../../services/medicalService";
import medicationRequestService from "../../../services/medicationRequestService";
import communityService from "../../../services/communityService";

// MỚI
import medicalService from "../../../services/APIParent/medicalService";
import medicationRequestService from "../../../services/APIParent/medicationRequestService";
import communityService from "../../../services/APIParent/communityService";

// HOẶC sử dụng named imports
import {
  medicalService,
  medicationRequestService,
  communityService
} from "../../../services/APIParent";
```

#### 2. Files cần cập nhật cụ thể:

**MedicalRecords Components:**
- `frontend/src/Pages/Parent/pages/MedicalRecords_co/components/tabs/IncidentsTab.jsx`
- `frontend/src/Pages/Parent/pages/MedicalRecords_co/components/tabs/GeneralTab.jsx`
- `frontend/src/Pages/Parent/pages/MedicalRecords_co/components/tabs/CheckupsTab.jsx`
- `frontend/src/Pages/Parent/pages/MedicalRecords_co/components/tabs/VaccinationTab.jsx`
- `frontend/src/Pages/Parent/pages/MedicalRecords_co/components/tabs/GrowthTab.jsx`

**SendMedicine Components:**
- `frontend/src/Pages/Parent/pages/SendMedicine_co/SendMedicine.jsx`
- `frontend/src/Pages/Parent/pages/SendMedicine_co/components/MedicationHistory.jsx`
- `frontend/src/Pages/Parent/pages/SendMedicine_co/components/MedicationForm.jsx`

**Community Components:**
- `frontend/src/Pages/Parent/pages/Community_co/Community.jsx`
- `frontend/src/Pages/Parent/pages/Community_co/CommunityPost.jsx`

**HealthGuide Components:**
- `frontend/src/Pages/Parent/pages/HealthGuide_co/HealthGuide.jsx`
- `frontend/src/Pages/Parent/pages/HealthGuide_co/HealthGuideDetail.jsx`

**Notifications Components:**
- `frontend/src/Pages/Parent/pages/Notifications_co/Notifications.jsx`

**HealthDeclaration Components:**
- `frontend/src/Pages/Parent/pages/HealthDeclaration_co/HealthDeclaration.jsx`

## Script tự động cập nhật

Tạo script để tự động cập nhật import paths:

```bash
# Tìm và thay thế import paths
find frontend/src/Pages/Parent -name "*.jsx" -o -name "*.js" | xargs sed -i 's|from.*services/medicalService|from "../../../services/APIParent/medicalService"|g'
find frontend/src/Pages/Parent -name "*.jsx" -o -name "*.js" | xargs sed -i 's|from.*services/medicationRequestService|from "../../../services/APIParent/medicationRequestService"|g'
find frontend/src/Pages/Parent -name "*.jsx" -o -name "*.js" | xargs sed -i 's|from.*services/communityService|from "../../../services/APIParent/communityService"|g'
find frontend/src/Pages/Parent -name "*.jsx" -o -name "*.js" | xargs sed -i 's|from.*services/notificationService|from "../../../services/APIParent/notificationService"|g'
find frontend/src/Pages/Parent -name "*.jsx" -o -name "*.js" | xargs sed -i 's|from.*services/HealthGuideService|from "../../../services/APIParent/healthGuideService"|g'
find frontend/src/Pages/Parent -name "*.jsx" -o -name "*.js" | xargs sed -i 's|from.*services/healthCheckupConsentService|from "../../../services/APIParent/healthCheckupConsentService"|g'
```

## Kiểm tra sau khi migration

### 1. Build test
```bash
cd frontend
npm run build
```

### 2. Kiểm tra import errors
```bash
npm run dev
```

### 3. Test các chức năng Parent
- [ ] Medical Records - tất cả tabs
- [ ] Send Medicine - form và history
- [ ] Community - posts và comments
- [ ] Health Guide - articles
- [ ] Notifications - list và details
- [ ] Health Declaration - form submission

## Lợi ích của việc migration

### 1. Tổ chức code tốt hơn
- Tách biệt rõ ràng services theo role
- Dễ maintain và debug
- Consistent với APIAdmin và APINurse

### 2. Tránh conflicts
- Không xung đột với Admin/Nurse services
- Namespace riêng biệt
- Easier team collaboration

### 3. Scalability
- Dễ thêm services mới cho Parent
- Clear ownership của code
- Better testing isolation

## Lưu ý quan trọng

1. **Không xóa files cũ ngay**: Giữ lại files gốc cho đến khi test hoàn tất
2. **Update gradually**: Cập nhật từng component một để dễ debug
3. **Test thoroughly**: Kiểm tra tất cả chức năng Parent sau khi migration
4. **Update documentation**: Cập nhật README và docs liên quan

## Rollback plan

Nếu có vấn đề, có thể rollback bằng cách:
1. Revert import paths về cũ
2. Xóa thư mục APIParent
3. Sử dụng lại services gốc

## Next steps

1. Cập nhật import paths trong Parent components
2. Test tất cả chức năng
3. Update documentation
4. Remove old service files (sau khi confirm hoạt động tốt)
5. Update team về changes này
