# HEALTH DECLARATION API INTEGRATION - HOÀN THÀNH

## 📋 Mô tả yêu cầu

Cập nhật trang **Khai báo sức khỏe học sinh** để:

1. **Phần "Thông tin sức khỏe cơ bản"**: Hiển thị dữ liệu từ API làm text mẫu cho người dùng xem và chỉnh sửa
2. **Phần "Thông tin y tế bổ sung"**: Không hiển thị text mẫu, để trống cho người dùng tự nhập
3. API endpoint: `http://localhost:8080/api/v1/health-profiles/getStudentProfileByID/{studentId}`
4. studentId thay đổi theo học sinh được chọn (HS001, HS002, ...)

## ✅ Các thay đổi đã thực hiện

### 1. **🔧 Sửa lỗi cấu trúc dữ liệu API - CRITICAL FIX**

- **Vấn đề**: Code truy cập sai cấu trúc dữ liệu API
- **Nguyên nhân**: API trả về `{ healthProfile: {...}, vaccinations: [...] }` nhưng code truy cập `response.data.height`
- **Sửa lỗi**: Truy cập `response.data.healthProfile.height`
- **Kết quả**:
  - **Trước**: Tất cả fields undefined → form trống
  - **Sau**: Hiển thị đúng dữ liệu từ API
    - HS001: height=133, weight=30.8, bloodType="O+", visionLeft="Bình thường"
    - HS002: height=115, weight=22.8, bloodType="A+", visionLeft="10/10"
    - HS003: height=118.3, weight=24.1, bloodType="B+", visionLeft="10/10"

### 2. **🔄 Cập nhật logic xử lý dữ liệu**

- Đổi tên function `cleanFormData()` thành `processFormData()`
- Phân biệt 2 loại trường:
  - **Basic health fields**: `height`, `weight`, `bloodType`, `visionLeft`, `visionRight`, `hearingStatus`, `lastPhysicalExamDate`
  - **Additional health fields**: `allergies`, `chronicDiseases`, `dietaryRestrictions`, `specialNeeds`, `emergencyContactInfo`

```javascript
// Lấy dữ liệu từ healthProfile object
const healthProfileData = response.data.healthProfile;
const processedData = processFormData(healthProfileData);

// Các trường "Thông tin y tế bổ sung" - luôn để trống
additionalHealthFields.forEach((field) => {
  processedData[field] = ""; // Luôn để trống
});

// Các trường "Thông tin sức khỏe cơ bản" - giữ nguyên dữ liệu từ API
basicHealthFields.forEach((field) => {
  if (processedData[field] === null || processedData[field] === undefined) {
    processedData[field] = "";
  }
  // Giữ nguyên tất cả dữ liệu khác từ API
});
```

### 3. **💉 Sửa lỗi xử lý vaccinations**

- **Vấn đề**: Code sử dụng `v.vaccineId` nhưng API trả về `v.id`
- **Sửa**: Map `v.id` thành `vaccineId` trong form data
- **Cập nhật**: `setVaccinatedFromServer(response.data.vaccinations.map(v => v.id))`

### 4. **🎨 Cập nhật giao diện**

- **Phần "Thông tin sức khỏe cơ bản"**:

  - Thêm help-text: "Thông tin này sẽ được tự động tải từ hồ sơ y tế hiện có của học sinh..."
  - Các trường sẽ hiển thị dữ liệu từ API (nếu có)

- **Phần "Thông tin y tế bổ sung"**:
  - Thêm help-text: "Phụ huynh vui lòng nhập thêm các thông tin y tế quan trọng khác..."
  - Thêm placeholder hướng dẫn cho từng trường:
    - Dị ứng: "Nhập thông tin về các loại dị ứng của học sinh (nếu có)..."
    - Bệnh mãn tính: "Nhập thông tin về các bệnh mãn tính của học sinh (nếu có)..."
    - Hạn chế ăn uống: "Nhập thông tin về các hạn chế ăn uống của học sinh (nếu có)..."
    - Nhu cầu đặc biệt: "Nhập thông tin về các nhu cầu đặc biệt của học sinh (nếu có)..."
    - Liên lạc khẩn cấp: "Nhập tên và số điện thoại người liên hệ khẩn cấp..."

### 4. **Cập nhật logic reset form**

- Khi chọn học sinh mới hoặc load lần đầu:
  - Các trường cơ bản: Để trống, chờ API load dữ liệu
  - Các trường bổ sung: Luôn để trống để người dùng tự nhập

### 5. **Tạo test script**

- File: `test-health-api.js`
- Chức năng: Test API endpoint với các studentId khác nhau
- Phân tích cấu trúc dữ liệu response

## 🔄 Luồng hoạt động

1. **Khi chọn học sinh**:

   - Reset form về trạng thái ban đầu
   - Gọi API `getStudentProfileByID/{studentId}`
   - Xử lý response với `processFormData()`
   - Cập nhật form:
     - Phần cơ bản: Hiển thị dữ liệu từ API
     - Phần bổ sung: Để trống

2. **Khi submit**:
   - Validate form
   - Gửi dữ liệu đã chỉnh sửa về API

## 📁 Files đã thay đổi

1. **HealthDeclaration.jsx**:

   - `processFormData()` function
   - `fetchStudentHealthProfile()`
   - `handleStudentChange()`
   - useEffect cho học sinh đầu tiên
   - JSX render với placeholder mới

2. **test-health-api.js** (mới):
   - Test script cho API endpoint

## 🎯 Kết quả

- ✅ Phần "Thông tin sức khỏe cơ bản" hiển thị dữ liệu từ API
- ✅ Phần "Thông tin y tế bổ sung" để trống cho người dùng nhập
- ✅ API endpoint sử dụng đúng studentId (HS001, HS002, ...)
- ✅ Đồng bộ với logic chọn học sinh hiện có
- ✅ Placeholder hướng dẫn cho các trường bổ sung
- ✅ Help-text giải thích rõ ràng cho người dùng

## 🚀 Testing

1. Khởi động development server: `npm run dev`
2. Truy cập trang Khai báo sức khỏe
3. Chọn học sinh và kiểm tra:
   - Dữ liệu cơ bản tự động load từ API
   - Các trường bổ sung để trống với placeholder
4. Chạy test API: `node test-health-api.js`

## 📊 Kết quả test API

### HS001 (Học sinh 1):

```
✅ Basic fields (hiển thị trong form):
- height: "133"
- weight: "30.8"
- bloodType: "O+"
- visionLeft: "Bình thường"
- visionRight: "Bình thường"
- hearingStatus: "Bình thường"
- lastPhysicalExamDate: "2024-01-15"

🚫 Additional fields (trống để người dùng nhập):
- allergies: "" (API có "Không có" nhưng bị xóa)
- chronicDiseases: "" (API có "Không có" nhưng bị xóa)
- dietaryRestrictions: "" (API có "Không có" nhưng bị xóa)
- specialNeeds: "" (API có "Không cofffffff" nhưng bị xóa)
- emergencyContactInfo: "" (API có "Liên hệ: 0901234572" nhưng bị xóa)
```

### HS002 (Học sinh 2):

```
✅ Basic fields (hiển thị trong form):
- height: "115"
- weight: "22.8"
- bloodType: "A+"
- visionLeft: "10/10"
- visionRight: "9/10"
- hearingStatus: "Bình thường"
- lastPhysicalExamDate: "2024-01-10"

🚫 Additional fields (trống để người dùng nhập):
- allergies: "" (API có "Dị ứng tôm cua" nhưng bị xóa)
- chronicDiseases: "" (API có "Không có" nhưng bị xóa)
- dietaryRestrictions: "" (API có "Kiêng hải sản" nhưng bị xóa)
- specialNeeds: "" (API có "Không có" nhưng bị xóa)
- emergencyContactInfo: "" (API có "Liên hệ: 0901234573" nhưng bị xóa)
```

### HS003 (Học sinh 3):

```
✅ Basic fields (hiển thị trong form):
- height: "118.3"
- weight: "24.1"
- bloodType: "B+"
- visionLeft: "10/10"
- visionRight: "10/10"
- hearingStatus: "Bình thường"
- lastPhysicalExamDate: "2024-01-12"

🚫 Additional fields (trống để người dùng nhập):
- allergies: "" (API có "Dị ứng phấn hoa" nhưng bị xóa)
- chronicDiseases: "" (API có "Hen suyễn nhẹ" nhưng bị xóa)
- dietaryRestrictions: "" (API có "Ít đường" nhưng bị xóa)
- specialNeeds: "" (API có "Cần thuốc xịt hen" nhưng bị xóa)
- emergencyContactInfo: "" (API có "Liên hệ: 0901234574" nhưng bị xóa)
```

## 🎯 Tóm tắt

✅ **HOÀN THÀNH** - Trang Khai báo sức khỏe đã hoạt động đúng theo yêu cầu:

- Phần "Thông tin sức khỏe cơ bản" hiển thị dữ liệu từ API làm text mẫu
- Phần "Thông tin y tế bổ sung" để trống cho người dùng tự nhập
- API endpoint đã hoạt động với studentId (HS001, HS002, HS003)
- Dữ liệu mỗi học sinh khác nhau được hiển thị chính xác
