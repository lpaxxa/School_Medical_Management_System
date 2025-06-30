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
import BackButton from "./BackButton";

const StudentDetailView = ({ student, onBack }) => {
  if (!student) return null;

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Không có dữ liệu";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Debug: Log student data
  console.log("Student data:", student);
  console.log("Image URL:", student.imageUrl);

  return (
    <div className="student-detail-page">
      {/* Back Button Outside Header */}
      <BackButton onClick={onBack} text="Quay lại danh sách" />

      {/* Header */}
      <div className="page-header">
        <h1>Thông tin chi tiết học sinh</h1>
      </div>

      {/* Body */}
      <div className="student-content">
        {/* Cột trái */}
        <div className="left-column">
          {/* Ảnh học sinh */}
          <div className="student-photo">
            {student.imageUrl ? (
              <img
                src={student.imageUrl}
                alt={student.fullName || student.name}
                onLoad={() => {
                  console.log("Image loaded successfully:", student.imageUrl);
                }}
                onError={(e) => {
                  console.error("Image failed to load:", student.imageUrl);
                  console.error("Error details:", e);
                  e.target.onerror = null;
                  e.target.src =
                    "https://via.placeholder.com/200x200/cccccc/666666?text=Student";
                }}
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="photo-placeholder">
                <FaUser size={60} />
                <p>Không có hình ảnh</p>
              </div>
            )}
          </div>

          {/* Thông tin cơ bản */}
          <div className="basic-info">
            <h2>{student.fullName || student.name}</h2>
            <div className="info-item">
              <FaIdCard />
              <span>{student.studentId}</span>
            </div>
            <div className="info-item">
              <FaSchool />
              <span>Lớp {student.className || student.class}</span>
            </div>
            <div className="info-item">
              <FaGraduationCap />
              <span>{student.gradeLevel}</span>
            </div>
          </div>
        </div>

        {/* Cột phải */}
        <div className="right-column">
          <h3>Thông tin chi tiết</h3>

          <div className="detail-info">
            <div className="info-row">
              <span className="label">
                <FaBirthdayCake />
                Ngày sinh
              </span>
              <span className="value">{formatDate(student.dateOfBirth)}</span>
            </div>

            <div className="info-row">
              <span className="label">
                <FaVenusMars />
                Giới tính
              </span>
              <span className="value">{student.gender || "Chưa có"}</span>
            </div>

            <div className="info-row">
              <span className="label">
                <FaCalendarAlt />
                Năm học
              </span>
              <span className="value">{student.schoolYear || "Chưa có"}</span>
            </div>

            <div className="info-row">
              <span className="label">
                <FaUserCircle />
                ID Hồ sơ sức khỏe
              </span>
              <span className="value">
                {student.healthProfileId || "Chưa có"}
              </span>
            </div>

            <div className="info-row">
              <span className="label">
                <FaUserFriends />
                ID Phụ huynh
              </span>
              <span className="value">{student.parentId || "Chưa có"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailView;
