# Theo dõi sau tiêm chủng - Logic và Workflow

## Mô tả chung

Module "Theo dõi sau tiêm chủng" được thiết kế để y tá theo dõi tình trạng sức khỏe của học sinh sau khi tiêm vaccine. Hệ thống tự động phân loại trạng thái theo dõi dựa trên ghi chú trong lịch sử tiêm chủng.

## Các trạng thái theo dõi

### 1. Trạng thái cá nhân (từng học sinh)

- **Hoàn thành**: Học sinh đã tiêm và có ghi chú "không có phản ứng phụ"
- **Cần theo dõi**: Học sinh đã tiêm nhưng chưa có ghi chú "không có phản ứng phụ" hoặc có ghi chú khác
- **Chưa hoàn thành**: Học sinh chưa tiêm (không có lịch sử tiêm trong ngày kế hoạch)

### 2. Tình trạng tổng thể (toàn kế hoạch)

- **Hoàn thành**: Tất cả học sinh đều có trạng thái "Hoàn thành"
- **Còn học sinh cần theo dõi**: Chỉ có học sinh với trạng thái "Cần theo dõi", không có "Chưa hoàn thành"
- **Chưa hoàn thành**: Chỉ có học sinh với trạng thái "Chưa hoàn thành", không có "Cần theo dõi"
- **Còn học sinh cần theo dõi và chưa hoàn thành**: Có cả học sinh "Cần theo dõi" và "Chưa hoàn thành"

## Workflow xử lý

### 1. Tải trang chính
1. Hiển thị danh sách các kế hoạch tiêm chủng
2. Tự động tính toán tình trạng tổng thể cho từng kế hoạch
3. Hiển thị tình trạng với màu sắc phù hợp:
   - 🟢 Hoàn thành (xanh lá)
   - 🟡 Cần theo dõi (vàng)
   - 🔴 Chưa hoàn thành/Còn học sinh cần theo dõi và chưa hoàn thành (đỏ)

### 2. Xem chi tiết kế hoạch
1. Người dùng click "Xem chi tiết"
2. Hệ thống fetch thông tin chi tiết kế hoạch và danh sách học sinh
3. Tính toán trạng thái theo dõi cho từng học sinh
4. Hiển thị bảng danh sách học sinh với trạng thái tương ứng
5. Cung cấp bộ lọc tìm kiếm theo tên học sinh và trạng thái
6. Hiển thị phân trang với 10 học sinh/trang
7. Thông báo khi không có kết quả lọc

### 3. Xem lịch sử tiêm chủng
1. Người dùng click "Xem lịch sử" cho học sinh cụ thể
2. Hệ thống fetch lịch sử tiêm chủng theo `healthProfileId`
3. Lọc lịch sử theo ngày tiêm của kế hoạch
4. Hiển thị lịch sử dạng card/form (không dùng bảng)
5. Mỗi card chứa: tên kế hoạch, tên vaccine, lần tiêm, ghi chú, nút cập nhật

## API sử dụng

### `getAllVaccinationByHealthProfileId(healthProfileId)`
- Lấy toàn bộ lịch sử tiêm chủng của học sinh
- Trả về mảng các record tiêm chủng
- Mỗi record chứa: vaccinationDate, notes, planName, vaccineName, v.v.

### `fetchPlanDetails(planId)`
- Lấy chi tiết kế hoạch tiêm chủng
- Trả về thông tin kế hoạch + danh sách học sinh tham gia
- Mỗi học sinh có: id, fullName, healthProfileId, parentNotes

## Cách tính toán trạng thái

### Thuật toán cho trạng thái cá nhân:
```javascript
// Lấy lịch sử tiêm chủng
const history = await vaccinationApiService.getAllVaccinationByHealthProfileId(student.healthProfileId);

// Lọc theo ngày tiêm của kế hoạch
const vaccinationDate = new Date(plan.vaccinationDate);
const filteredHistory = history.filter(record => {
  const recordDate = new Date(record.vaccinationDate);
  return recordDate.toDateString() === vaccinationDate.toDateString();
});

// Tính toán trạng thái
if (filteredHistory.length === 0) {
  status = 'Chưa hoàn thành';
} else {
  const allCompleted = filteredHistory.every(record => {
    const notes = record.notes;
    return notes && notes.toLowerCase().trim().includes('không có phản ứng phụ');
  });
  
  if (allCompleted) {
    status = 'Hoàn thành';
  } else {
    status = 'Cần theo dõi';
  }
}
```

### Thuật toán cho tình trạng tổng thể:
```javascript
const statusCounts = {
  'Hoàn thành': 0,
  'Cần theo dõi': 0,
  'Chưa hoàn thành': 0
};

// Đếm số lượng học sinh theo từng trạng thái
students.forEach(student => {
  const status = statuses[student.healthProfileId] || 'Cần theo dõi';
  statusCounts[status]++;
});

// Tính toán tình trạng tổng thể
const total = students.length;
const completed = statusCounts['Hoàn thành'];
const needMonitoring = statusCounts['Cần theo dõi'];
const notCompleted = statusCounts['Chưa hoàn thành'];

if (completed === total) {
  return 'Hoàn thành';
} else if (notCompleted > 0 && needMonitoring > 0) {
  return 'Còn học sinh cần theo dõi và chưa hoàn thành';
} else if (needMonitoring > 0) {
  return 'Còn học sinh cần theo dõi';
} else if (notCompleted > 0) {
  return 'Chưa hoàn thành';
} else {
  return 'Cần theo dõi';
}
```

## Các tính năng đã triển khai

### 1. Giao diện
- ✅ Layout responsive với grid 3 cột (desktop), 2 cột (tablet), 1 cột (mobile)
- ✅ Card design hiện đại với gradient, shadow, hover effects
- ✅ Màu sắc phân biệt rõ ràng cho từng trạng thái
- ✅ Loading states và error handling
- ✅ Pagination cho danh sách kế hoạch
- ✅ Bộ lọc tìm kiếm theo tên và ngày

### 2. Xử lý dữ liệu
- ✅ Batch processing để tránh quá tải API
- ✅ Caching và session storage cho trải nghiệm người dùng
- ✅ Error handling và fallback states
- ✅ Optimistic updates cho UI

### 3. Lịch sử tiêm chủng
- ✅ Hiển thị dạng card thay vì bảng
- ✅ Layout ngang cho thông tin học sinh
- ✅ Responsive design
- ✅ Cập nhật ghi chú inline

### 4. Tính năng bổ sung
- ✅ Scroll position preservation
- ✅ Filter state persistence
- ✅ Smooth scrolling to details
- ✅ Auto-refresh overall status

## Performance và tối ưu

### 1. API Optimization
- Sử dụng batch processing (3 kế hoạch/lần) để tránh overload
- Caching kết quả để tránh call API không cần thiết
- Lazy loading cho chi tiết kế hoạch

### 2. UI/UX Optimization
- Skeleton loading states
- Progressive rendering
- Debounced search
- Optimistic updates

### 3. Memory Management
- Cleanup event listeners
- Clear unused state
- Session storage for persistence

## Cấu trúc file

```
PostMonitoring/
├── PostVaccinationMonitoring.jsx    # Component chính
├── HistoryModal.jsx                 # Modal lịch sử tiêm chủng
├── HistoryModal.css                 # Styles cho modal lịch sử
├── StudentListModal.jsx             # Modal danh sách học sinh
├── UpdateNoteModal.jsx              # Modal cập nhật ghi chú
└── README.md                        # File này
```

## Lưu ý kỹ thuật

1. **healthProfileId vs studentId**: API sử dụng `healthProfileId` làm khóa chính
2. **Date filtering**: So sánh ngày bằng `toDateString()` để tránh lỗi timezone
3. **Status calculation**: Luôn có fallback status là "Cần theo dõi"
4. **Batch processing**: Xử lý từng batch để tránh timeout và overload
5. **State management**: Sử dụng local state kết hợp với context cho hiệu suất tốt

## Changelog

### v1.0.0 (Latest)
- ✅ Triển khai đầy đủ logic trạng thái theo dõi
- ✅ UI/UX responsive và hiện đại
- ✅ Tối ưu performance với batch processing
- ✅ Error handling và loading states
- ✅ Session persistence cho filters
- ✅ Lịch sử tiêm chủng dạng card
- 🔄 Đang triển khai: Bộ lọc trong chi tiết kế hoạch
