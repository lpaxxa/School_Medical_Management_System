# API Services cho Admin

Thư mục này chứa các services riêng cho phần Admin, tuân thủ nguyên tắc "**mỗi mục làm riêng**".

## Nguyên tắc thiết kế

- **Tách biệt hoàn toàn**: Admin không sử dụng services từ APINurse
- **Độc lập**: Mỗi module (Admin, Nurse, Parent) có services riêng
- **Rõ ràng**: Logs có prefix `[Admin]` để dễ debug

## Services hiện có

### 1. `vaccinationPlanService.js`

Quản lý kế hoạch tiêm chủng cho Admin:

- `createVaccinationPlan()` - Tạo kế hoạch mới
- `getVaccinationPlans()` - Lấy danh sách kế hoạch
- `getVaccinationPlanById()` - Lấy kế hoạch theo ID
- `updateVaccinationPlan()` - Cập nhật kế hoạch
- `deleteVaccinationPlan()` - Xóa kế hoạch

### 2. `healthCampaignService.js`

Quản lý chiến dịch kiểm tra sức khỏe cho Admin:

- `createHealthCampaign()` - Tạo chiến dịch mới
- `getHealthCampaigns()` - Lấy danh sách chiến dịch
- `updateHealthCampaign()` - Cập nhật chiến dịch
- `deleteHealthCampaign()` - Xóa chiến dịch

### 3. `medicationService.js`

Quản lý thuốc và vật tư y tế cho Admin:

- `getAllMedicationItems()` - Lấy danh sách tất cả thuốc/vật tư
- `getMedicationItemById()` - Lấy thông tin thuốc theo ID
- `getMedicationStatistics()` - Thống kê tình trạng thuốc

## API Endpoints

Tất cả services đều sử dụng base URL: `http://localhost:8080/api/v1`

### Vaccination Plans

- `POST /vaccination-plans` - Tạo kế hoạch
- `GET /vaccination-plans` - Lấy danh sách
- `GET /vaccination-plans/:id` - Lấy theo ID
- `PUT /vaccination-plans/:id` - Cập nhật
- `DELETE /vaccination-plans/:id` - Xóa

### Health Campaigns

- `POST /health-campaigns` - Tạo chiến dịch
- `GET /health-campaigns` - Lấy danh sách
- `PUT /health-campaigns/:id` - Cập nhật
- `DELETE /health-campaigns/:id` - Xóa

### Medication Items

- `GET /medication-items/get-all` - Lấy danh sách thuốc
- `GET /medication-items/:id` - Lấy theo ID

## Sử dụng

```javascript
// Import từ APIAdmin (KHÔNG phải APINurse)
import vaccinationPlanService from "../../../../services/APIAdmin/vaccinationPlanService";
import healthCampaignService from "../../../../services/APIAdmin/healthCampaignService";
import medicationService from "../../../../services/APIAdmin/medicationService";

// Hoặc sử dụng named import
import {
  vaccinationPlanService,
  healthCampaignService,
  medicationService,
} from "../../../../services/APIAdmin";
```

## Files sử dụng

1. **CreateVaccinationPlan.jsx** - Sử dụng `vaccinationPlanService`
2. **VaccinationPlanHistory.jsx** - Sử dụng `vaccinationPlanService`
3. **CreateHealthCampaign.jsx** - Sử dụng `healthCampaignService`
4. **HealthCampaignHistory.jsx** - Sử dụng `healthCampaignService`
5. **MedicationListView.jsx** - Sử dụng `medicationService`
6. **ReportGenerator.jsx** - Sử dụng medication API endpoints

## Lưu ý quan trọng

⚠️ **KHÔNG sử dụng services từ `APINurse`** trong phần Admin!

✅ **SỬ DỤNG**: `../../../../services/APIAdmin/...`
❌ **KHÔNG SỬ DỤNG**: `../../../../services/APINurse/...`

Điều này đảm bảo mỗi module hoạt động độc lập và tuân thủ yêu cầu thiết kế.
