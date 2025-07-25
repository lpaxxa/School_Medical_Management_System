import React from "react";
import {
  FaUser,
  FaIdCard,
  FaBirthdayCake,
  FaVenusMars,
  FaSchool,
  FaGraduationCap,
  FaCalendarAlt,
  FaUserCircle,
  FaUserFriends,
} from "react-icons/fa";
import "./StudentDetailView.css";
import ReportHeader from "./ReportHeader";
import { formatDate } from "../../../utils/dateUtils";

const StudentDetailView = ({ student, onBack, theme = "teal" }) => {
  if (!student) return null;

  // Helper function to normalize gender display
  const normalizeGender = (gender) => {
    if (!gender) return "Chưa có";
    const genderLower = gender.toLowerCase();
    if (genderLower === "male" || genderLower === "nam") return "Nam";
    if (
      genderLower === "female" ||
      genderLower === "nữ" ||
      genderLower === "nu"
    )
      return "Nữ";
    return gender; // Return original if not recognized
  };

  // Helper function to validate and format image URL
  const getValidImageUrl = (imageUrl) => {
    if (!imageUrl) {
      console.log("🔍 No image URL provided");
      return null;
    }

    console.log("🔍 Checking image URL:", imageUrl);

    // Blacklist problematic domains that don't allow hotlinking
    const blacklistedDomains = [
      "freepik.com",
      "shutterstock.com",
      "getty.com",
      "istockphoto.com",
    ];

    // Check if it's a valid URL format
    try {
      const url = new URL(imageUrl);
      console.log("🔍 Parsed URL:", {
        protocol: url.protocol,
        hostname: url.hostname,
        pathname: url.pathname,
      });

      // Check for blacklisted domains
      const isBlacklisted = blacklistedDomains.some((domain) =>
        url.hostname.includes(domain)
      );

      if (isBlacklisted) {
        console.log(
          "❌ Blacklisted domain (no hotlinking allowed):",
          url.hostname
        );
        return null;
      }

      // Check if it's a supported image format
      const supportedFormats = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
      const hasValidExtension = supportedFormats.some((format) =>
        url.pathname.toLowerCase().includes(format)
      );

      console.log("🔍 Has valid extension:", hasValidExtension);
      console.log("🔍 Contains 'image':", url.pathname.includes("image"));
      console.log("🔍 Contains 'photo':", url.pathname.includes("photo"));

      if (
        hasValidExtension ||
        url.pathname.includes("image") ||
        url.pathname.includes("photo")
      ) {
        console.log("✅ Valid image URL:", imageUrl);
        return imageUrl;
      } else {
        console.log("❌ URL doesn't match image criteria:", imageUrl);
      }
    } catch (e) {
      console.warn("❌ Invalid image URL format:", imageUrl, e.message);
    }

    return null;
  };

  // Debug: Log student data
  console.log("Student data:", student);
  console.log("Original Image URL:", student.imageUrl);

  const validImageUrl = getValidImageUrl(student.imageUrl);
  console.log("Valid Image URL:", validImageUrl);

  return (
    <div className={`reports-student-detail-page theme-${theme}`}>
      {/* Header with theme support */}
      <ReportHeader
        title="Quản lý học sinh"
        subtitle="Thông tin chi tiết học sinh"
        icon="fas fa-user-graduate"
        onBack={onBack}
        colorTheme={theme}
      />

      {/* Body */}
      <div className="reports-student-detail-content">
        {/* Cột trái */}
        <div className="reports-student-detail-left-column">
          {/* Ảnh học sinh */}
          <div className="reports-student-detail-photo">
            {validImageUrl ? (
              <img
                src={validImageUrl}
                alt={student.fullName || student.name}
                onLoad={() => {
                  console.log("✅ Image loaded successfully:", validImageUrl);
                }}
                onError={(e) => {
                  console.error("❌ Image failed to load:", validImageUrl);
                  console.error("Error details:", e);
                  if (e && e.target) {
                    e.target.onerror = null;
                    // Use a more reliable fallback - data URL
                    e.target.src =
                      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzBDOTQuNDc3MiA3MCA5MCA3NC40NzcyIDkwIDgwVjEyMEM5MCA5NC40NzcyIDk0LjQ3NzIgOTAgMTAwIDkwSDEwMEMxMDUuNTIzIDkwIDExMCA5NC40NzcyIDExMCAxMjBWODBDMTEwIDc0LjQ3NzIgMTA1LjUyMyA3MCAxMDAgNzBaIiBmaWxsPSIjOUI5QjlCIi8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjUwIiByPSIxNSIgZmlsbD0iIzlCOUI5QiIvPgo8dGV4dCB4PSIxMDAiIHk9IjE1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOUI5QjlCIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+";
                  }
                }}
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                style={{
                  width: "100%",
                  height: "200px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />
            ) : (
              <div className="reports-student-detail-photo-placeholder">
                <FaUser size={60} />
                <p>Không có hình ảnh</p>
                {student.imageUrl && (
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#999",
                      marginTop: "5px",
                      textAlign: "center",
                    }}
                  >
                    <p>
                      Lý do: URL không hợp lệ hoặc không cho phép hotlinking
                    </p>
                    <p style={{ wordBreak: "break-all", marginTop: "3px" }}>
                      {student.imageUrl.length > 60
                        ? `${student.imageUrl.substring(0, 60)}...`
                        : student.imageUrl}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Thông tin cơ bản */}
          <div className="reports-student-detail-basic-info">
            <h2>{student.fullName || student.name}</h2>
            <div className="reports-student-detail-info-item">
              <FaIdCard />
              <span>{student.studentId}</span>
            </div>
            <div className="reports-student-detail-info-item">
              <FaSchool />
              <span>Lớp {student.className || student.class}</span>
            </div>
            <div className="reports-student-detail-info-item">
              <FaGraduationCap />
              <span>{student.gradeLevel}</span>
            </div>
          </div>
        </div>

        {/* Cột phải */}
        <div className="reports-student-detail-right-column">
          <h3>Thông tin chi tiết</h3>

          <div className="reports-student-detail-detail-info">
            <div className="reports-student-detail-info-row">
              <span className="reports-student-detail-label">
                <FaBirthdayCake />
                Ngày sinh
              </span>
              <span className="reports-student-detail-value">
                {formatDate(student.dateOfBirth)}
              </span>
            </div>

            <div className="reports-student-detail-info-row">
              <span className="reports-student-detail-label">
                <FaVenusMars />
                Giới tính
              </span>
              <span className="reports-student-detail-value">
                <span
                  className={`reports-student-gender-badge ${
                    normalizeGender(student.gender) === "Nam"
                      ? "male"
                      : "female"
                  }`}
                >
                  {normalizeGender(student.gender)}
                </span>
              </span>
            </div>

            <div className="reports-student-detail-info-row">
              <span className="reports-student-detail-label">
                <FaCalendarAlt />
                Năm học
              </span>
              <span className="reports-student-detail-value">
                {student.schoolYear || "Chưa có"}
              </span>
            </div>

            <div className="reports-student-detail-info-row">
              <span className="reports-student-detail-label">
                <FaUserCircle />
                ID Hồ sơ sức khỏe
              </span>
              <span className="reports-student-detail-value">
                {student.healthProfileId || "Chưa có"}
              </span>
            </div>

            <div className="reports-student-detail-info-row">
              <span className="reports-student-detail-label">
                <FaUserFriends />
                ID Phụ huynh
              </span>
              <span className="reports-student-detail-value">
                {student.parentId || "Chưa có"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailView;
