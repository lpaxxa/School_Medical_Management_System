import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { currentUser } = useAuth();
  const location = useLocation();

  // Debug logging
  console.log("ProtectedRoute - currentUser:", currentUser);
  console.log("ProtectedRoute - allowedRoles:", allowedRoles);
  console.log("ProtectedRoute - location:", location.pathname);

  if (!currentUser) {
    console.log("ProtectedRoute - No user, redirecting to login");
    // Redirect người dùng đến trang đăng nhập nếu chưa đăng nhập
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Kiểm tra quyền truy cập
  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
    console.log("ProtectedRoute - User role not allowed, redirecting to home");
    console.log("User role:", currentUser.role, "Allowed roles:", allowedRoles);
    // Redirect nếu không có quyền truy cập
    return <Navigate to="/" replace />;
  }

  console.log("ProtectedRoute - Access granted");
  return children;
};

export default ProtectedRoute;
