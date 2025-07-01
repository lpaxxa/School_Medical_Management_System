# Image Backups - Original Homepage Images

Đây là file backup lưu trữ tất cả hình ảnh mặc định ban đầu của trang chủ để có thể sử dụng lại khi cần.

## Hero Section Original Image

- **URL**: `https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-05-27/3nTekDHd9c.png`
- **Mô tả**: Hình ảnh hero chính của trang chủ ban đầu
- **Kích thước**: Responsive, height tự động
- **Vị trí**: Hero section, bên phải của text content

## Cách sử dụng lại:

### 1. Hiển thị hình ảnh gốc trong Hero:

Thêm class `show-original` vào element `home-page`:

```html
<div className="home-page show-original"></div>
```

### 2. Sử dụng trong CSS:

```css
.original-hero-image {
  background-image: url("https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-05-27/3nTekDHd9c.png");
  background-size: cover;
  background-position: center;
  width: 100%;
  height: 400px;
  border-radius: 20px;
  margin: 2rem 0;
}
```

### 3. Sử dụng trong JSX:

```jsx
<img
  src="https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-05-27/3nTekDHd9c.png"
  alt="School Medical System"
  className="hero-img"
/>
```

## Local Assets trong src/assets/:

- `A1.jpg` - Logo/Avatar image (210KB)
- `medical-school-login.jpg` - Login background (118KB)
- `google.png` - Google icon (211KB)
- `vision.jpg` - Vision section image (528KB)
- `react.svg` - React logo (4KB)

## Notes:

- Hình ảnh gốc vẫn được giữ nguyên trong CSS với class `.original-hero-image`
- Có thể toggle giữa design mới (phone mockup) và design cũ (hình ảnh gốc)
- Tất cả assets local vẫn còn trong thư mục src/assets/

# Backup Images

## Hero Section Images (Home_co)

- Original hero image: https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-05-27/3nTekDHd9c.png
- User avatars and doctor images used in phone mockup from Unsplash

## Parent Interface Images

- Medical school login background: medical-school-login.jpg
- Vision section image: vision.jpg
- Main background: A1.jpg
- Google login icon: google.png
- React logo: react.svg

## Unsplash Images Used in Hero Phone Mockup

- User avatar: https://images.unsplash.com/photo-1494790108755-2616b612b830?w=50&h=50&fit=crop&crop=face
- Doctor 1: https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face
- Nurse: https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=40&h=40&fit=crop&crop=face
- Pharmacist: https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=40&h=40&fit=crop&crop=face
- Admin: https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=40&h=40&fit=crop&crop=face
- Parent: https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face
- Doctor 2: https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=30&h=30&fit=crop&crop=face

## Notes

- All images preserved during color scheme updates
- Original URLs kept in CSS comments for reference
- Professional blue theme applied: #015C92 → #2D82B5 → #428CD4 → #88CDF6 → #BCE6FF
