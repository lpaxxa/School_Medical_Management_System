import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import googleAuthService from "../services/googleAuthService";
import LoadingSpinner from "./LoadingSpinner/LoadingSpinner";

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser, setAuthToken } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        console.log("🔄 Processing OAuth callback...");

        // Kiểm tra có lỗi từ Google OAuth không
        const oauthError = searchParams.get("error");
        if (oauthError) {
          const errorDescription =
            searchParams.get("error_description") ||
            "Đăng nhập Google thất bại";
          console.error("❌ OAuth error:", oauthError, errorDescription);
          setError(decodeURIComponent(errorDescription));
          return;
        }

        // Lấy token và user info từ URL params (được gửi từ backend)
        const token = searchParams.get("token");
        const userDataParam = searchParams.get("user");

        if (!token) {
          console.error("❌ No token received from OAuth callback");
          setError("Không nhận được token đăng nhập");
          return;
        }

        let userInfo = {};
        if (userDataParam) {
          try {
            userInfo = JSON.parse(decodeURIComponent(userDataParam));
          } catch (parseError) {
            console.error("❌ Error parsing user data:", parseError);
            // Fallback: tạo user info cơ bản từ token
            userInfo = {
              email: searchParams.get("email") || "",
              name: searchParams.get("name") || "",
              role: searchParams.get("role") || "parent",
            };
          }
        }

        console.log("🎫 Token received:", token.substring(0, 20) + "...");
        console.log("👤 User info:", userInfo);

        // Xử lý callback thông qua service
        const user = googleAuthService.handleOAuthCallback(token, userInfo);

        // Cập nhật auth context
        setAuthToken(token);
        setUser(user);

        console.log("✅ OAuth callback processed successfully");

        // Redirect dựa trên role
        let redirectPath = "/";
        switch (user.role?.toLowerCase()) {
          case "admin":
            redirectPath = "/admin";
            break;
          case "nurse":
            redirectPath = "/nurse";
            break;
          case "parent":
            redirectPath = "/parent";
            break;
          default:
            redirectPath = "/parent"; // Default cho Google login
        }

        console.log("🔄 Redirecting to:", redirectPath);
        navigate(redirectPath, { replace: true });
      } catch (error) {
        console.error("❌ Error processing OAuth callback:", error);
        setError(error.message || "Lỗi xử lý đăng nhập Google");
      } finally {
        setIsProcessing(false);
      }
    };

    // Chỉ xử lý nếu có searchParams
    if (searchParams.toString()) {
      processOAuthCallback();
    } else {
      console.log("⚠️ No search parameters found, redirecting to login");
      navigate("/login", { replace: true });
    }
  }, [searchParams, navigate, setUser, setAuthToken]);

  // Hiển thị lỗi và redirect về login sau 3 giây
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: { error: error },
        });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [error, navigate]);

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            backgroundColor: "#fee",
            color: "#c33",
            padding: "20px",
            borderRadius: "8px",
            border: "1px solid #fcc",
            maxWidth: "400px",
          }}
        >
          <h3>❌ Lỗi đăng nhập Google</h3>
          <p>{error}</p>
          <p style={{ fontSize: "14px", color: "#666" }}>
            Đang chuyển hướng về trang đăng nhập...
          </p>
        </div>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <LoadingSpinner />
        <h3 style={{ marginTop: "20px", color: "#333" }}>
          🔄 Đang xử lý đăng nhập Google...
        </h3>
        <p style={{ color: "#666", textAlign: "center", maxWidth: "300px" }}>
          Vui lòng đợi trong giây lát, chúng tôi đang xác thực thông tin của
          bạn.
        </p>
      </div>
    );
  }

  return null;
};

export default OAuthCallback;
