# Admin Modal System - Hướng Dẫn Sử Dụng

## Tổng quan

Hệ thống Admin hiện có 3 loại modal chính để thay thế các thông báo alert(), confirm() và console.log():

### 1. SuccessModal - Thông báo thành công

### 2. ErrorModal - Thông báo lỗi

### 3. ConfirmModal - Xác nhận hành động

## Import và Setup

```jsx
// Import components
import SuccessModal from "../../components/SuccessModal";
import ErrorModal from "../../components/ErrorModal";
import ConfirmModal from "../../components/ConfirmModal";

// Import hooks
import { useSuccessModal } from "../../hooks/useSuccessModal";
import { useErrorModal } from "../../hooks/useErrorModal";
import { useConfirmModal } from "../../hooks/useConfirmModal";

// Setup hooks trong component
const YourComponent = () => {
  // Modal hooks
  const {
    isOpen: isSuccessOpen,
    modalData: successData,
    showSuccess,
    hideSuccess,
  } = useSuccessModal();

  const {
    isOpen: isErrorOpen,
    modalData: errorData,
    showError,
    hideError,
  } = useErrorModal();

  const {
    isOpen: isConfirmOpen,
    modalData: confirmData,
    showConfirm,
    hideConfirm,
  } = useConfirmModal();

  // Your component logic...

  return (
    <div>
      {/* Your component JSX */}

      {/* Modal components */}
      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={hideSuccess}
        title={successData.title}
        message={successData.message}
        details={successData.details}
        autoClose={successData.autoClose}
        autoCloseDelay={successData.autoCloseDelay}
      />

      <ErrorModal
        isOpen={isErrorOpen}
        onClose={hideError}
        title={errorData.title}
        message={errorData.message}
        details={errorData.details}
        autoClose={errorData.autoClose}
        autoCloseDelay={errorData.autoCloseDelay}
      />

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={hideConfirm}
        onConfirm={confirmData.onConfirm}
        title={confirmData.title}
        message={confirmData.message}
        confirmText={confirmData.confirmText}
        cancelText={confirmData.cancelText}
        type={confirmData.type}
      />
    </div>
  );
};
```

## Cách sử dụng

### 1. Thay thế alert() thành công

**Trước:**

```javascript
alert("Tạo thành công!");
```

**Sau:**

```javascript
showSuccess(
  "Tạo thành công!",
  "Dữ liệu đã được lưu vào hệ thống.",
  "ID: #12345", // details (optional)
  true, // autoClose
  3000 // autoCloseDelay (ms)
);
```

### 2. Thay thế alert() lỗi

**Trước:**

```javascript
alert("Có lỗi xảy ra!");
```

**Sau:**

```javascript
showError(
  "Có lỗi xảy ra!",
  "Không thể kết nối đến server.",
  "Error code: 500", // details (optional)
  false, // autoClose
  5000 // autoCloseDelay (ms)
);
```

### 3. Thay thế confirm()

**Trước:**

```javascript
if (window.confirm("Bạn có chắc chắn muốn xóa?")) {
  // Thực hiện xóa
  deleteItem();
}
```

**Sau:**

```javascript
showConfirm(
  "Xác nhận xóa",
  "Bạn có chắc chắn muốn xóa item này? Hành động này không thể hoàn tác!",
  () => {
    // Callback khi xác nhận
    deleteItem();
  },
  {
    confirmText: "Xóa",
    cancelText: "Hủy",
    type: "danger", // "default" | "danger" | "warning"
  }
);
```

## Các trường hợp sử dụng thực tế

### 1. Xử lý API Response thành công

```javascript
try {
  const response = await createVaccinationPlan(data);
  showSuccess(
    "Tạo kế hoạch thành công!",
    `Kế hoạch tiêm chủng "${data.title}" đã được tạo.`,
    `ID: ${response.id}`,
    true,
    3000
  );
} catch (error) {
  showError(
    "Lỗi tạo kế hoạch",
    "Không thể tạo kế hoạch tiêm chủng.",
    error.message
  );
}
```

### 2. Validation form

```javascript
const handleSubmit = (e) => {
  e.preventDefault();

  if (!title.trim()) {
    showError("Thiếu thông tin", "Vui lòng nhập tiêu đề chiến dịch!");
    return;
  }

  if (!startDate) {
    showError("Thiếu thông tin", "Vui lòng chọn ngày bắt đầu!");
    return;
  }

  // Continue validation...
};
```

### 3. Xác nhận hành động nguy hiểm

```javascript
const handleDelete = (campaignId, campaignTitle) => {
  showConfirm(
    "Xác nhận xóa chiến dịch",
    `Bạn có chắc chắn muốn xóa chiến dịch "${campaignTitle}"?\n\nDữ liệu sẽ bị xóa vĩnh viễn và không thể khôi phục!`,
    async () => {
      try {
        await deleteCampaign(campaignId);
        showSuccess(
          "Xóa thành công!",
          `Chiến dịch "${campaignTitle}" đã được xóa.`
        );
        loadCampaigns(); // Reload data
      } catch (error) {
        showError(
          "Lỗi xóa chiến dịch",
          "Không thể xóa chiến dịch.",
          error.message
        );
      }
    },
    {
      confirmText: "Xóa vĩnh viễn",
      cancelText: "Hủy",
      type: "danger",
    }
  );
};
```

## Z-Index và Ưu tiên

Modal system có hierarchy z-index để đảm bảo hiển thị đúng:

- **ConfirmModal**: z-index 10003 (cao nhất)
- **ErrorModal**: z-index 10002
- **SuccessModal**: z-index 10001
- **UserModal**: z-index 10000 (thấp nhất)

## CSS Classes và Customization

Tất cả modal đều có namespace riêng:

- `admin-success-*` cho SuccessModal
- `admin-error-*` cho ErrorModal
- `admin-confirm-*` cho ConfirmModal

## Migration Checklist

Để migrate từ alert/confirm sang modal system:

1. ✅ Import các components và hooks cần thiết
2. ✅ Setup hooks trong component
3. ✅ Thay thế alert() thành showSuccess() hoặc showError()
4. ✅ Thay thế confirm() thành showConfirm()
5. ✅ Thêm modal components vào JSX cuối component
6. ✅ Test các trường hợp edge case
7. ✅ Xóa console.log() debug không cần thiết

## Best Practices

1. **Luôn cung cấp message có ý nghĩa:** Thay vì "Lỗi!", hãy dùng "Không thể tạo kế hoạch tiêm chủng"

2. **Sử dụng details cho thông tin kỹ thuật:** Error codes, IDs, timestamps

3. **Chọn type phù hợp cho confirm:**

   - `default`: Hành động bình thường
   - `warning`: Hành động cần cảnh báo
   - `danger`: Hành động nguy hiểm (xóa, reset)

4. **AutoClose cho success:** Thường dùng autoClose=true với 3s
5. **Không autoClose cho error:** Để user đọc kỹ lỗi

## Files cần Migration

Các file sau đây cần được migrate:

1. `HealthCampaignHistory.jsx` - Có 5+ alert() calls
2. `CreateVaccinationPlan.jsx` - Có console.error
3. `CreateHealthCampaign.jsx` - Có thể có alert/confirm
4. Các file trong `Reports_co/`, `EmailManagement_co/`

## Support

Nếu cần hỗ trợ implement modal system, hãy tham khảo `UserManagement.jsx` như một example hoàn chỉnh.
