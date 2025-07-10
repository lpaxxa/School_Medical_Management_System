import React from "react";
import ParentLayout from "../../Pages/Parent/layout/ParentLayout";

// Layout for parent pages - sử dụng ParentLayout thay vì duplicate
export const MainLayout = ({ children }) => (
  <ParentLayout>{children}</ParentLayout>
);

// Layout for home page - cũng sử dụng ParentLayout
export const HomeLayout = ({ children }) => (
  <ParentLayout>{children}</ParentLayout>
);

// Layout for admin/nurse pages - doesn't include header, navigation, or footer
export const AdminLayout = ({ children }) => (
  <div className="shared-admin-layout">{children}</div>
);

// Layout cho các trang cơ bản không thuộc Admin hay Parent
export const BasicLayout = ({ children }) => (
  <main className="shared-basic-content">{children}</main>
);

// Layout cho trang lỗi
export const ErrorLayout = ({ children }) => (
  <div className="shared-error-layout">
    <div className="shared-error-content">{children}</div>
  </div>
);

// Layout cho trang đăng nhập/đăng ký
export const AuthLayout = ({ children }) => (
  <div className="shared-auth-layout">
    <div className="shared-auth-content">{children}</div>
  </div>
);
