# Cập nhật API cho Khai báo sức khỏe học sinh

## Tổng quan thay đổi

Đã cập nhật trang **Khai báo sức khỏe học sinh** để phù hợp với API mới và yêu cầu từ backend.

## API Endpoints được sử dụng

### 1. POST - Khai báo sức khỏe

- **URL**: ``${import.meta.env.VITE_BACKEND_URL}/api/v1/health-profiles/full`
- **Method**: POST
- **Content-Type**: application/json
- **Authorization**: Bearer Token

#### Request Body Format:

```json
{
  "healthProfile": {
    "id": 0,
    "bloodType": "A",
    "height": 300,
    "weight": 500,
    "allergies": "string",
    "chronicDiseases": "string",
    "visionLeft": "Chưa kiểm tra",
    "visionRight": "Bình thường",
    "hearingStatus": "string",
    "dietaryRestrictions": "string",
    "emergencyContactInfo": "string",
    "immunizationStatus": "string",
    "lastPhysicalExamDate": "2025-07-09",
    "specialNeeds": "string",
    "checkupStatus": "COMPLETED"
  },
  "vaccinations": [
    {
      "vaccineId": 0,
      "vaccinationDate": "2025-07-09T09:29:57.057Z",
      "administeredAt": "string",
      "notes": "string",
      "parentNotes": "string"
    }
  ]
}
```

### 2. GET - Danh sách Vaccines

- **URL**: ``${import.meta.env.VITE_BACKEND_URL}/api/v1/vaccines/getAllVaccine`
- **Method**: GET

#### Response Format:

```json
[
  {
    "id": 1,
    "name": "Vaccine Sởi - Quai bị - Rubella (MMR)",
    "description": "Vaccine phòng bệnh sởi, quai bị và rubella",
    "totalDoses": 2,
    "intervalDays": 365,
    "minAgeMonths": 12,
    "maxAgeMonths": 180,
    "isActive": true
  }
]
```

## Thay đổi chính

### 1. Cập nhật cấu trúc dữ liệu

- **healthProfile**: Thêm trường `checkupStatus: "COMPLETED"`
- **bloodType**: Thay đổi từ "Chưa cập nhật" thành "A" làm mặc định
- **vaccinations**: Cấu trúc mảng vaccine với đầy đủ thông tin

### 2. Cập nhật giao diện vaccine

- Hiển thị đầy đủ thông tin vaccine từ API `getAllVaccine`
- Thêm thông tin: số liều, khoảng cách, độ tuổi, trạng thái
- Cho phép phụ huynh bỏ trống hoặc chọn vaccine
- Cải thiện UI/UX với thông tin rõ ràng hơn

### 3. Cập nhật validation

- Bắt buộc chọn nhóm máu
- Kiểm tra dữ liệu đầu vào cho chiều cao (0-300cm) và cân nặng (0-500kg)
- Validation cho ngày khám sức khỏe

### 4. Cải thiện xử lý dữ liệu

- Tự động load thông tin vaccine đã tiêm khi chọn học sinh
- Sync dữ liệu vaccine giữa form state và selected vaccines
- Xử lý ghi chú của phụ huynh cho từng vaccine

## Tính năng mới

### 1. Quản lý vaccine linh hoạt

- Phụ huynh có thể bỏ trống phần vaccine
- Chọn nhiều vaccine từ danh sách hệ thống
- Thêm ghi chú riêng cho từng vaccine

### 2. Thông tin vaccine chi tiết

- Hiển thị mô tả vaccine
- Thông tin số liều cần thiết
- Khoảng cách giữa các lần tiêm
- Độ tuổi phù hợp
- Trạng thái sử dụng của vaccine

### 3. Cải thiện trải nghiệm người dùng

- Loading states rõ ràng
- Error handling tốt hơn
- Success messages chi tiết
- Responsive design cho mobile

## Tệp được thay đổi

1. **HealthDeclaration.jsx**

   - Cập nhật cấu trúc form data
   - Thay đổi logic xử lý vaccine
   - Cập nhật API call
   - Cải thiện validation

2. **VaccineSelection.css**
   - Thêm styles cho vaccine info
   - Styles cho vaccine status
   - Responsive design improvements

## Testing

### Test Cases

1. **Khai báo không có vaccine**: Gửi form chỉ với thông tin sức khỏe cơ bản
2. **Khai báo có vaccine**: Chọn một hoặc nhiều vaccine và thêm ghi chú
3. **Load dữ liệu cũ**: Kiểm tra load thông tin đã khai báo trước đó
4. **Validation**: Test các trường hợp validation lỗi
5. **API Error Handling**: Test khi API không available

### Manual Testing Steps

1. Mở trang Khai báo sức khỏe
2. Chọn học sinh
3. Điền thông tin sức khỏe cơ bản
4. Chọn/bỏ chọn vaccine và thêm ghi chú
5. Submit form và kiểm tra response
6. Reload trang và kiểm tra dữ liệu được load lại

## Lưu ý

- API endpoint phải được backend implement đúng format
- Cần có authentication token hợp lệ
- Database phải có cấu trúc phù hợp để lưu trữ dữ liệu vaccine và health profile
