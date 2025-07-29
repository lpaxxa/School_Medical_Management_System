# Sửa lỗi hiển thị giới tính trong StudentList

## Vấn đề
Trong file `StudentList.jsx`, cột giới tính hiển thị "Male" và "Female" bằng tiếng Anh thay vì tiếng Việt.

## Giải pháp đã áp dụng

### 1. Thêm hàm chuyển đổi giới tính
```javascript
// Hàm chuyển đổi giới tính sang tiếng Việt
const formatGender = (gender) => {
  if (!gender) return 'N/A';
  
  const genderLower = gender.toLowerCase();
  switch (genderLower) {
    case 'male':
      return 'Nam';
    case 'female':
      return 'Nữ';
    default:
      return gender; // Trả về giá trị gốc nếu không phải male/female
  }
};
```

### 2. Áp dụng hàm vào hiển thị trong bảng
```javascript
// Trước:
<td>{student.gender}</td>

// Sau:
<td>
  <Badge 
    bg={formatGender(student.gender) === 'Nam' ? 'primary' : formatGender(student.gender) === 'Nữ' ? 'danger' : 'secondary'} 
    pill
  >
    {formatGender(student.gender)}
  </Badge>
</td>
```

## Kết quả
- **Male** → **Nam** (Badge màu xanh primary)
- **Female** → **Nữ** (Badge màu đỏ danger)
- **Giá trị khác** → **Giữ nguyên** (Badge màu xám secondary)
- **Null/undefined** → **N/A** (Badge màu xám secondary)

## Cải tiến thêm
- Sử dụng Badge với màu sắc phân biệt để dễ nhận biết
- Xử lý trường hợp giá trị null/undefined
- Giữ nguyên giá trị gốc nếu không phải male/female

## File đã sửa
- `frontend/src/Pages/Nurse/pages/StudentRecords_co/StudentList/StudentList.jsx`

## Cách kiểm tra
1. Mở trang danh sách học sinh
2. Kiểm tra cột "Giới tính"
3. Xác nhận:
   - "Male" hiển thị thành "Nam" với badge xanh
   - "Female" hiển thị thành "Nữ" với badge đỏ
   - Các giá trị khác hiển thị đúng với badge xám
