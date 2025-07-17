# Test Cases for Health Campaign Notification Feature

## Test Cases

### 1. Modal Opening Test

- **Action**: Click "Gửi thông báo" button on any campaign
- **Expected**:
  - Notification modal opens
  - Shows campaign title
  - Shows "Đang tải danh sách học sinh..." while loading
  - Shows grade selection options after loading

### 2. Student Loading Test

- **Action**: Open notification modal
- **Expected**:
  - API call to ``${import.meta.env.VITE_BACKEND_URL}/api/v1/students`
  - Students data loaded and displayed
  - Student count shown for each grade

### 3. Grade Selection Test

- **Action**: Select individual grades (1, 2, 3, 4, 5)
- **Expected**:
  - Checkbox gets checked
  - Grade option shows "selected" style
  - Student count updates in summary
  - "Tất cả các khối" gets unchecked if it was selected

### 4. Select All Grades Test

- **Action**: Check "Tất cả các khối"
- **Expected**:
  - All individual grade checkboxes get checked and disabled
  - Summary shows total student count
  - Individual grade checkboxes become disabled

### 5. Student Filtering Test

- **Action**: Select specific grades
- **Expected**:
  - Only students with `className` starting with selected grade numbers are included
  - Example: Grade 1 selected → students with className "1A", "1B", "10A" are included
  - Student count matches filtered students

### 6. Send Notification Test

- **Action**: Select grades and click "Gửi Thông Báo"
- **Expected**:
  - API call to ``${import.meta.env.VITE_BACKEND_URL}/api/v1/health-campaigns/{campaignId}/send-notifications`
  - Request body contains array of student IDs
  - Success modal shows after successful send
  - Modal closes and states reset

### 7. API Request Format Test

- **Expected Request**:

  ```json
  POST /api/v1/health-campaigns/16/send-notifications
  Content-Type: application/json
  Authorization: Bearer {token}

  [1, 2, 3, 4, 5]
  ```

### 8. Error Handling Test

- **Scenarios**:
  - No grades selected → Alert "Vui lòng chọn ít nhất một khối học sinh!"
  - No students found for selected grades → Alert "Không tìm thấy học sinh nào thuộc khối đã chọn!"
  - API error → Alert with error message
  - Network error → Alert with error message

### 9. Modal Close Test

- **Actions**:
  - Click X button
  - Click outside modal
  - Click "Hủy" button
- **Expected**:
  - Modal closes
  - States reset (selectedGrades, isAllGradesSelected, students)

### 10. Responsive Design Test

- **Action**: Test on mobile devices
- **Expected**:
  - Modal adapts to screen size
  - Grade options stack vertically
  - Touch-friendly checkboxes
  - Readable text on small screens

## Mock Data Structure

### Students API Response:

```json
[
  {
    "id": 1,
    "name": "Nguyễn Văn A",
    "className": "1A",
    "gradeLevel": "1"
  },
  {
    "id": 2,
    "name": "Trần Thị B",
    "className": "1B",
    "gradeLevel": "1"
  },
  {
    "id": 3,
    "name": "Lê Văn C",
    "className": "2A",
    "gradeLevel": "2"
  }
]
```

### Send Notification Request:

```json
POST /api/v1/health-campaigns/16/send-notifications
[1, 2, 3, 4, 5]
```

## Edge Cases to Test

1. **Empty student list**: What happens if API returns empty array?
2. **Students without className**: How are they handled?
3. **Invalid className formats**: Non-numeric prefixes
4. **Large student lists**: Performance with 1000+ students
5. **Network timeout**: Slow API responses
6. **Invalid campaign ID**: Campaign that doesn't exist
7. **Unauthorized access**: Invalid or expired token

## UI/UX Validation

1. **Visual feedback**: Loading states, hover effects, disabled states
2. **Accessibility**: Keyboard navigation, screen reader support
3. **Performance**: Smooth animations, responsive interactions
4. **Consistency**: Matches existing design patterns
5. **Error messages**: Clear, actionable, user-friendly
