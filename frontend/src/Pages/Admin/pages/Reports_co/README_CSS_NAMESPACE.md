# Reports_co CSS Namespace Guide

## 🎯 Mục tiêu

Tránh xung đột CSS giữa các module Admin, Parent, và Nurse trong ứng dụng School Medical Management System.

## 📁 Cấu trúc Files đã cập nhật

```
src/Pages/Admin/pages/Reports_co/components/
├── NotificationDetail.jsx      ✅ Đã chuyển sang table format
├── NotificationDetail.css      ✅ Namespace: "reports-notification-"
├── DetailView.jsx             ✅ Đã chuyển sang table format
├── DetailView.css             ✅ Namespace: "reports-detail-"
├── StudentListView.jsx        ✅ Đã chuyển sang table format
├── StudentListView.css        ✅ Namespace: "reports-student-"
├── MedicationListView.jsx     🔄 Đã có table format
├── VaccineListView.jsx        🔄 Đã có table format
└── Reports.css               ✅ Global namespace styles
```

## 🏷️ Quy tắc Namespace

### Prefix chính: `reports-`

### Cấu trúc đặt tên:

- **Component level**: `reports-{component}-{element}`
- **Modifier**: `reports-{component}-{element}-{modifier}`

### Ví dụ:

```css
/* ✅ ĐÚNG */
.reports-notification-detail
.reports-notification-table-row
.reports-student-list-container
.reports-detail-stats-card

/* ❌ SAI */
.notification-detail  /* Có thể conflict với Parent/Nurse */
.table-row           /* Quá generic */
.container; /* Chắc chắn sẽ conflict */
```

## 🔄 Chuyển đổi từ Grid/Card sang Table

### Trước (Grid/Card Layout):

```jsx
// ❌ Cũ - Grid layout
<div className="recipients-grid">
  {recipients.map((recipient) => (
    <div className="recipient-card">
      <div className="recipient-info">
        <div className="recipient-name">{recipient.name}</div>
        <div className="recipient-status">{recipient.status}</div>
      </div>
    </div>
  ))}
</div>
```

### Sau (Table Layout):

```jsx
// ✅ Mới - Table layout với namespace
<div className="reports-notification-table-container">
  <table className="reports-notification-table">
    <thead>
      <tr>
        <th>STT</th>
        <th>Tên người nhận</th>
        <th>Trạng thái</th>
      </tr>
    </thead>
    <tbody>
      {recipients.map((recipient, index) => (
        <tr key={recipient.id} className="reports-notification-table-row">
          <td className="reports-notification-table-stt">{index + 1}</td>
          <td className="reports-notification-table-receiver">
            {recipient.name}
          </td>
          <td className="reports-notification-table-status">
            {recipient.status}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

## 🎨 CSS Namespace Examples

### NotificationDetail Component:

```css
/* Container */
.reports-notification-detail {
  background: #ffffff;
  border-radius: 8px;
  padding: 24px;
}

/* Table */
.reports-notification-table {
  width: 100%;
  border-collapse: collapse;
}

.reports-notification-table-row:hover {
  background: #f8f9fa;
}

/* Status badges */
.reports-notification-status-badge.reports-notification-accepted {
  background: #d4edda;
  color: #155724;
}
```

### StudentListView Component:

```css
/* Container */
.reports-student-list-container {
  background: #f8f9fa;
  min-height: 100vh;
  padding: 20px;
}

/* Stats */
.reports-student-stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

/* Table */
.reports-student-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}
```

## 🛡️ Anti-Conflict Strategies

### 1. **Namespace Prefixing**

```css
/* ✅ Always use reports- prefix */
.reports-notification-detail {
}
.reports-student-table {
}
.reports-detail-stats {
}
```

### 2. **Avoid Generic Classes**

```css
/* ❌ Tránh các class generic */
.container, .wrapper, .content, .header, .footer
.table, .row, .col, .card, .btn
.primary, .secondary, .success, .danger

/* ✅ Sử dụng specific classes */
.reports-notification-container
.reports-student-table-row
.reports-detail-stats-card;
```

### 3. **Component Isolation**

```css
/* Đảm bảo styles chỉ áp dụng trong component */
.reports-notification-detail .reports-notification-table {
  /* Styles chỉ áp dụng cho table trong NotificationDetail */
}
```

### 4. **CSS Reset cho Reports Module**

```css
/* Trong Reports.css */
.reports-container * {
  box-sizing: border-box;
}

.reports-container .container,
.reports-container .wrapper {
  all: unset;
  display: block;
}
```

## 📱 Responsive Design

Tất cả components đã được thiết kế responsive:

```css
/* Mobile First Approach */
@media (max-width: 768px) {
  .reports-student-table-container {
    font-size: 12px;
  }

  .reports-student-table th,
  .reports-student-table td {
    padding: 8px 12px;
  }
}

@media (max-width: 1024px) {
  .reports-student-stats-section {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}
```

## 🔍 Testing Checklist

### ✅ Kiểm tra xung đột CSS:

1. **Load Reports_co trong Admin module**
2. **Chuyển qua Parent module** - kiểm tra styles không bị ảnh hưởng
3. **Chuyển qua Nurse module** - kiểm tra styles không bị ảnh hưởng
4. **Quay lại Reports_co** - kiểm tra styles vẫn đúng

### ✅ Kiểm tra Responsive:

1. **Desktop (1920px+)**: Table hiển thị đầy đủ
2. **Tablet (768px-1024px)**: Table scroll ngang, stats grid 2 cột
3. **Mobile (<768px)**: Table scroll ngang, stats grid 1 cột, font size nhỏ hơn

### ✅ Kiểm tra Browser Compatibility:

- Chrome ✅
- Firefox ✅
- Safari ✅
- Edge ✅

## 🚀 Performance Optimizations

### CSS được tối ưu:

1. **Minimal selectors** - sử dụng class thay vì tag selectors
2. **No !important** - trừ trường hợp cần thiết để override global styles
3. **Optimized animations** - sử dụng transform thay vì thay đổi layout properties
4. **Efficient responsive breakpoints** - mobile-first approach

## 📋 Maintenance Guide

### Khi thêm component mới:

1. Tạo CSS file mới với namespace `reports-{component}-`
2. Import CSS file trong component
3. Sử dụng BEM naming convention với reports prefix
4. Test trên tất cả modules để đảm bảo không conflict

### Khi update existing component:

1. Giữ nguyên namespace prefix
2. Không sử dụng generic class names
3. Test regression trên tất cả browsers
4. Update documentation nếu cần

## 🎯 Next Steps

1. **Apply tương tự cho các components khác** trong Reports_co
2. **Tạo shared component library** với reports namespace
3. **Setup CSS linting rules** để enforce namespace convention
4. **Create component documentation** với Storybook

---

**Lưu ý quan trọng**: Namespace này chỉ áp dụng cho Reports_co module. Parent và Nurse modules giữ nguyên namespace riêng của chúng để tránh breaking changes.
