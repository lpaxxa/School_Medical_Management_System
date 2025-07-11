# Tạo hồ sơ tiêm chủng - Logic và Workflow

## Mô tả chung

Module "Tạo hồ sơ tiêm chủng" được thiết kế để y tá tạo hồ sơ tiêm chủng cho học sinh sau khi họ đã được tiêm vaccine. Hệ thống tự động kiểm tra trạng thái theo dõi từ module PostMonitoring để quyết định hiển thị nút "Tạo HS" hay "Đã tạo HS".

## Logic tích hợp với PostMonitoring

### Kiểm tra trạng thái theo dõi
Hệ thống sử dụng các utility functions từ `monitoringStatusUtils.js` để:
1. Lấy lịch sử tiêm chủng của học sinh
2. Tính toán trạng thái theo dõi dựa trên ghi chú
3. Quyết định hiển thị nút "Tạo HS" hay "Đã tạo HS"

### Trạng thái hiển thị
- **"Tạo HS"**: Khi trạng thái là "Chưa hoàn thành" (chưa có lịch sử tiêm chủng)
- **"Đã tạo HS - Hoàn thành"**: Khi trạng thái là "Hoàn thành" (có ghi chú "không có phản ứng phụ")
- **"Đã tạo HS - Cần theo dõi"**: Khi trạng thái là "Cần theo dõi" (có lịch sử nhưng chưa có ghi chú hoàn thành)

## Workflow xử lý

### 1. Tải trang chính
1. Hiển thị danh sách các kế hoạch tiêm chủng
2. Bộ lọc theo tên kế hoạch, trạng thái kế hoạch, và ngày tiêm
3. Phân trang với 6 kế hoạch/trang
4. Responsive design với grid layout

### 2. Xem chi tiết kế hoạch
1. Người dùng click "Xem chi tiết"
2. Hệ thống fetch thông tin chi tiết kế hoạch và danh sách học sinh
3. **Tự động tính toán trạng thái theo dõi cho từng học sinh**
4. Hiển thị bảng danh sách học sinh với các cột:
   - STT
   - Họ và tên (độ rộng 20%)
   - Lớp
   - Tên Vaccine (độ rộng 15%)
   - Phản hồi phụ huynh
   - Ghi chú từ phụ huynh
   - Hành động (độ rộng 25%)
5. Bộ lọc tìm kiếm theo tên học sinh, lớp, và phản hồi

### 3. Tạo hồ sơ tiêm chủng
1. Học sinh có phản hồi "ACCEPTED" từ phụ huynh
2. Kiểm tra trạng thái theo dõi từ PostMonitoring
3. Hiển thị nút "Tạo HS" hoặc "Đã tạo HS" tương ứng
4. Mở modal tạo hồ sơ khi click "Tạo HS"

## API và Services sử dụng

### `getAllVaccinationByHealthProfileId(healthProfileId)`
- Lấy lịch sử tiêm chủng của học sinh
- Sử dụng để tính toán trạng thái theo dõi
- Trả về mảng các record tiêm chủng

### `fetchPlanDetails(planId)`
- Lấy chi tiết kế hoạch tiêm chủng
- Trả về thông tin kế hoạch + danh sách học sinh
- Bao gồm vaccineResponses của từng học sinh

## Cấu trúc file

```
CreateRecord/
├── CreateVaccinationRecord.jsx          # Component chính
├── VaccinationPlanDetailsModal.jsx     # Modal chi tiết kế hoạch
├── CreateRecordModal.jsx               # Modal tạo hồ sơ
├── monitoringStatusUtils.js            # Utility functions
└── README.md                           # File này
```

## Utility Functions (monitoringStatusUtils.js)

### `calculateStudentMonitoringStatus(student, planDate)`
```javascript
/**
 * Tính toán trạng thái theo dõi cho một học sinh
 * @param {Object} student - Đối tượng học sinh với healthProfileId
 * @param {string} planDate - Ngày tiêm của kế hoạch
 * @returns {Promise<string>} - Trạng thái: 'Hoàn thành', 'Cần theo dõi', 'Chưa hoàn thành'
 */
```

### `calculateStudentsMonitoringStatus(students, planDate)`
```javascript
/**
 * Tính toán trạng thái theo dõi cho nhiều học sinh
 * @param {Array} students - Mảng các đối tượng học sinh
 * @param {string} planDate - Ngày tiêm của kế hoạch
 * @returns {Promise<Object>} - Object với healthProfileId làm key và trạng thái làm value
 */
```

### `canCreateVaccinationRecord(monitoringStatus)`
```javascript
/**
 * Kiểm tra xem có thể tạo hồ sơ tiêm chủng mới không
 * @param {string} monitoringStatus - Trạng thái theo dõi
 * @returns {boolean} - True nếu có thể tạo hồ sơ, false nếu không
 */
```

### `getVaccinationRecordStatusText(monitoringStatus)`
```javascript
/**
 * Lấy text hiển thị cho trạng thái hồ sơ tiêm chủng
 * @param {string} monitoringStatus - Trạng thái theo dõi
 * @returns {string} - Text hiển thị
 */
```

## Logic tính toán trạng thái

### Thuật toán kiểm tra trạng thái:
```javascript
// 1. Lấy lịch sử tiêm chủng
const history = await vaccinationApiService.getAllVaccinationByHealthProfileId(student.healthProfileId);

// 2. Lọc theo ngày tiêm của kế hoạch
const vaccinationDate = new Date(planDate);
const filteredHistory = history.filter(record => {
  const recordDate = new Date(record.vaccinationDate);
  return recordDate.toDateString() === vaccinationDate.toDateString();
});

// 3. Tính toán trạng thái
if (filteredHistory.length === 0) {
  return 'Chưa hoàn thành';
} else {
  const allCompleted = filteredHistory.every(record => {
    const notes = record.notes;
    return notes && notes.toLowerCase().trim().includes('không có phản ứng phụ');
  });
  
  if (allCompleted) {
    return 'Hoàn thành';
  } else {
    return 'Cần theo dõi';
  }
}
```

### Logic hiển thị nút/text:
```javascript
const monitoringStatus = monitoringStatuses[student.healthProfileId];
const canCreate = canCreateVaccinationRecord(monitoringStatus);

if (canCreate) {
  // Hiển thị nút "Tạo HS" - có thể click
  return <button onClick={handleCreateRecord}>Tạo HS</button>;
} else {
  // Hiển thị text "Đã tạo HS" - không thể click
  return <span>Đã tạo HS - {monitoringStatus}</span>;
}
```

## Tính năng đã triển khai

### 1. Giao diện
- ✅ Layout responsive với grid 3 cột (desktop), 2 cột (tablet), 1 cột (mobile)
- ✅ Card design hiện đại với gradient, shadow, hover effects
- ✅ Bộ lọc tìm kiếm theo tên, trạng thái, ngày
- ✅ Pagination cho danh sách kế hoạch
- ✅ Loading states và error handling

### 2. Chi tiết kế hoạch
- ✅ Modal hiển thị chi tiết kế hoạch
- ✅ Bảng danh sách học sinh với bộ lọc
- ✅ Tự động tính toán trạng thái theo dõi
- ✅ Hiển thị đúng nút "Tạo HS" hoặc "Đã tạo HS"
- ✅ Responsive table với độ rộng cột tối ưu

### 3. Tích hợp với PostMonitoring
- ✅ Sử dụng chung logic tính toán trạng thái
- ✅ Batch processing để tối ưu hiệu suất
- ✅ Error handling khi API lỗi
- ✅ Fallback status khi không thể tính toán

### 4. Tính năng bổ sung
- ✅ Scroll position preservation
- ✅ Filter state persistence
- ✅ Session storage cho trải nghiệm người dùng
- ✅ Smooth transitions và animations

## Performance và tối ưu

### 1. API Optimization
- Sử dụng batch processing (5 học sinh/lần) để tránh overload
- Caching kết quả trạng thái để tránh call API không cần thiết
- Lazy loading cho chi tiết kế hoạch

### 2. UI/UX Optimization
- Skeleton loading states cho trạng thái
- Progressive rendering cho danh sách học sinh
- Debounced search trong bộ lọc
- Optimistic updates cho UI

### 3. Memory Management
- Cleanup event listeners
- Clear unused state khi đóng modal
- Session storage cho persistence

## Màu sắc và styling

### Trạng thái nút/text:
- **"Tạo HS"**: Nút xanh lá (#059669) có thể click
- **"Đã tạo HS - Hoàn thành"**: Text xanh lá (#10b981) với background nhạt
- **"Đã tạo HS - Cần theo dõi"**: Text vàng (#f59e0b) với background nhạt

### Responsive design:
- Desktop: 3 cột card
- Tablet: 2 cột card
- Mobile: 1 cột card
- Table: Scroll ngang khi cần thiết

## Lưu ý kỹ thuật

1. **healthProfileId**: Sử dụng làm khóa chính để liên kết với PostMonitoring
2. **Date matching**: So sánh ngày bằng `toDateString()` để tránh lỗi timezone
3. **Status calculation**: Luôn có fallback status là "Chưa hoàn thành"
4. **Batch processing**: Xử lý từng batch để tránh timeout
5. **State management**: Sử dụng local state kết hợp với context

## Luồng dữ liệu

```
CreateVaccinationRecord.jsx
├── Hiển thị danh sách kế hoạch
├── Click "Xem chi tiết"
└── VaccinationPlanDetailsModal.jsx
    ├── Fetch plan details
    ├── Load monitoring statuses (batch)
    │   └── monitoringStatusUtils.js
    │       ├── calculateStudentsMonitoringStatus()
    │       └── getAllVaccinationByHealthProfileId()
    ├── Render table với nút/text phù hợp
    └── Click "Tạo HS"
        └── CreateRecordModal.jsx
```

## Changelog

### v1.0.0 (Latest)
- ✅ Tích hợp với PostMonitoring để kiểm tra trạng thái
- ✅ Tự động hiển thị "Tạo HS" hoặc "Đã tạo HS"
- ✅ Utility functions để tính toán trạng thái
- ✅ Batch processing cho hiệu suất
- ✅ UI/UX responsive và hiện đại
- ✅ Error handling và loading states
- ✅ Session persistence cho filters
- ✅ Tối ưu độ rộng cột trong bảng

### Tính năng pending:
- [ ] Thêm export danh sách học sinh
- [ ] Thêm bulk create cho nhiều học sinh
- [ ] Thêm notification khi tạo thành công
- [ ] Thêm audit log cho việc tạo hồ sơ

## Hướng dẫn sử dụng

1. **Xem danh sách kế hoạch**: Các kế hoạch được hiển thị dạng card
2. **Tìm kiếm và lọc**: Sử dụng bộ lọc để tìm kế hoạch cụ thể
3. **Xem chi tiết**: Click "Xem chi tiết" để xem danh sách học sinh
4. **Tạo hồ sơ**: Click "Tạo HS" cho học sinh chưa có hồ sơ
5. **Kiểm tra trạng thái**: Học sinh đã có hồ sơ sẽ hiển thị "Đã tạo HS"

## Troubleshooting

### Nút "Tạo HS" không hiển thị:
- Kiểm tra phản hồi phụ huynh phải là "ACCEPTED"
- Kiểm tra trạng thái theo dõi phải là "Chưa hoàn thành"
- Kiểm tra API getAllVaccinationByHealthProfileId có hoạt động không

### Trạng thái không chính xác:
- Kiểm tra ngày tiêm có đúng format không
- Kiểm tra logic so sánh ngày trong utility functions
- Kiểm tra ghi chú có chứa "không có phản ứng phụ" không

### Performance chậm:
- Kiểm tra batch size (hiện tại 5 học sinh/batch)
- Kiểm tra API response time
- Kiểm tra memory usage và cleanup
