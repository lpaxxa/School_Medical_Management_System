import React from "react";
import ParentLayoutSimple from "../../Pages/Parent/layout/ParentLayoutSimple";

// Layout for parent pages - sử dụng ParentLayoutSimple để fix scroll issues
export const MainLayout = ({ children }) => (
  <ParentLayoutSimple>{children}</ParentLayoutSimple>
);

// Layout for home page - cũng sử dụng ParentLayoutSimple
export const HomeLayout = ({ children }) => (
  <ParentLayoutSimple>{children}</ParentLayoutSimple>
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
