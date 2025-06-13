import React from "react";
import Header from "../../Pages/Parent/components/Header/Header";
import Navigation from "../../Pages/Parent/components/Navigation/Navigation";
import Footer from "../../Pages/Parent/components/Footer/Footer";

// Layout for parent pages - only include structural elements
export const MainLayout = ({ children }) => (
  <>
    <Header />
    <Navigation />
    <main className="main-content">{children}</main>
    <Footer />
  </>
);

// Layout for admin/nurse pages - doesn't include header, navigation, or footer
// as these components are usually customized within admin/nurse dashboards
export const AdminLayout = ({ children }) => (
  <div className="admin-layout">{children}</div>
);

// For home page that needs additional components
export const HomeLayout = ({ children }) => (
  <>
    <Header />
    <Navigation />
    <main className="parent-content">{children}</main>
    <Footer />
  </>
);

// Layout cho các trang cơ bản không thuộc Admin hay Parent
export const BasicLayout = ({ children }) => (
  <main className="basic-content">{children}</main>
);

// Layout cho trang lỗi
export const ErrorLayout = ({ children }) => (
  <div className="error-layout">
    <div className="error-content">{children}</div>
  </div>
);

// Layout cho trang đăng nhập/đăng ký
export const AuthLayout = ({ children }) => (
  <div className="auth-layout">
    <div className="auth-content">{children}</div>
  </div>
);
