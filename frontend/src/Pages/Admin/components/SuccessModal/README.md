# SuccessModal Component

Component modal thông báo thành công dùng chung cho toàn bộ trang Admin.

## Tính năng

- ✅ Hiển thị một dấu tích lớn duy nhất
- ✅ Hiệu ứng animation đẹp mắt
- ✅ Auto-close sau thời gian định trước
- ✅ Có thể đóng bằng cách click overlay hoặc nút Đóng
- ✅ Responsive design
- ✅ Dễ dàng tái sử dụng

## Cách sử dụng

### 1. Import components

```jsx
import SuccessModal from "../../components/SuccessModal";
import { useSuccessModal } from "../../hooks/useSuccessModal";
```

### 2. Sử dụng hook

```jsx
const {
  isOpen: isSuccessOpen,
  modalData: successData,
  showSuccess,
  hideSuccess,
} = useSuccessModal();
```

### 3. Hiển thị modal thành công

```jsx
// Cơ bản
showSuccess("Thành công!", "Thao tác đã được thực hiện thành công.");

// Với chi tiết
showSuccess(
  "Cập nhật thành công!",
  "Dữ liệu đã được cập nhật.",
  "Chi tiết: Bản ghi #123 đã được cập nhật với thông tin mới."
);

// Tùy chỉnh auto-close
showSuccess(
  "Thành công!",
  "Thao tác hoàn tất.",
  "",
  true, // autoClose
  5000 // autoCloseDelay (5 giây)
);
```

### 4. Thêm component vào JSX

```jsx
{
  /* Success Modal */
}
<SuccessModal
  isOpen={isSuccessOpen}
  onClose={hideSuccess}
  title={successData.title}
  message={successData.message}
  details={successData.details}
  autoClose={successData.autoClose}
  autoCloseDelay={successData.autoCloseDelay}
/>;
```

## Props

### SuccessModal Props

| Prop             | Type     | Default       | Description                 |
| ---------------- | -------- | ------------- | --------------------------- |
| `isOpen`         | boolean  | false         | Hiển thị/ẩn modal           |
| `onClose`        | function | -             | Callback khi đóng modal     |
| `title`          | string   | "Thành công!" | Tiêu đề modal               |
| `message`        | string   | ""            | Thông điệp chính            |
| `details`        | string   | ""            | Chi tiết thêm (tùy chọn)    |
| `autoClose`      | boolean  | true          | Tự động đóng modal          |
| `autoCloseDelay` | number   | 3000          | Thời gian tự động đóng (ms) |

### useSuccessModal Hook

| Method        | Parameters                                           | Description               |
| ------------- | ---------------------------------------------------- | ------------------------- |
| `showSuccess` | (title, message, details, autoClose, autoCloseDelay) | Hiển thị modal thành công |
| `hideSuccess` | -                                                    | Ẩn modal                  |
| `isOpen`      | -                                                    | Trạng thái hiển thị modal |
| `modalData`   | -                                                    | Dữ liệu modal hiện tại    |

## Ví dụ thực tế

### Sau khi tạo user thành công

```jsx
const handleCreateUser = async (userData) => {
  try {
    await createUser(userData);
    showSuccess(
      "Thêm người dùng thành công!",
      "Người dùng mới đã được tạo trong hệ thống.",
      `Tài khoản "${userData.username}" với vai trò "${userData.role}" đã được thêm.`
    );
    setShowModal(false);
    loadUsers(); // Reload danh sách
  } catch (error) {
    console.error("Error:", error);
    alert("Có lỗi xảy ra: " + error.message);
  }
};
```

### Sau khi cập nhật dữ liệu thành công

```jsx
const handleUpdateData = async (id, data) => {
  try {
    await updateData(id, data);
    showSuccess(
      "Cập nhật thành công!",
      "Dữ liệu đã được cập nhật.",
      `Bản ghi #${id} đã được lưu với thông tin mới.`
    );
    loadData(); // Reload dữ liệu
  } catch (error) {
    console.error("Error:", error);
    alert("Cập nhật thất bại: " + error.message);
  }
};
```

### Sau khi xóa dữ liệu thành công

```jsx
const handleDeleteData = async (id) => {
  try {
    await deleteData(id);
    showSuccess(
      "Xóa thành công!",
      "Bản ghi đã được xóa khỏi hệ thống.",
      `Bản ghi #${id} đã được xóa vĩnh viễn.`
    );
    loadData(); // Reload dữ liệu
  } catch (error) {
    console.error("Error:", error);
    alert("Xóa thất bại: " + error.message);
  }
};
```

## Styling

Component sử dụng CSS Module với các class:

- `.success-modal-overlay` - Overlay nền
- `.success-modal` - Container chính
- `.success-modal-body` - Body modal
- `.success-icon` - Icon dấu tích
- `.success-title` - Tiêu đề
- `.success-message` - Thông điệp
- `.success-details` - Chi tiết
- `.success-modal-footer` - Footer
- `.success-btn` - Nút đóng

## Lưu ý

1. **Chỉ sử dụng một dấu tích**: Component được thiết kế để hiển thị một dấu tích lớn duy nhất, không có icon thêm ở header hay button.

2. **Thay thế alert()**: Sử dụng SuccessModal thay cho `alert()` để có UI/UX tốt hơn.

3. **Tự động đóng**: Mặc định modal sẽ tự động đóng sau 3 giây, có thể tùy chỉnh.

4. **Error handling**: Chỉ dùng cho thông báo thành công, error vẫn có thể dùng alert() hoặc tạo ErrorModal riêng.

5. **Responsive**: Component đã được optimize cho mobile và desktop.

## Áp dụng cho trang mới

Khi tạo trang Admin mới, chỉ cần:

1. Import SuccessModal và useSuccessModal
2. Sử dụng hook trong component
3. Thay thế alert() bằng showSuccess()
4. Thêm SuccessModal vào JSX

```jsx
import SuccessModal from "../../components/SuccessModal";
import { useSuccessModal } from "../../hooks/useSuccessModal";

const MyAdminPage = () => {
  const {
    isOpen: isSuccessOpen,
    modalData: successData,
    showSuccess,
    hideSuccess,
  } = useSuccessModal();

  const handleSomething = async () => {
    try {
      // ... logic xử lý
      showSuccess("Thành công!", "Thao tác đã hoàn tất.");
    } catch (error) {
      alert("Có lỗi: " + error.message);
    }
  };

  return (
    <div>
      {/* ... UI components */}

      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={hideSuccess}
        title={successData.title}
        message={successData.message}
        details={successData.details}
        autoClose={successData.autoClose}
        autoCloseDelay={successData.autoCloseDelay}
      />
    </div>
  );
};
```
