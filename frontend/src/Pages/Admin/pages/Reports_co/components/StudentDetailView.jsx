import React from "react";
import {
  FaUser,
  FaIdCard,
  FaBirthdayCake,
  FaVenusMars,
  FaSchool,
  FaGraduationCap,
  FaCalendarAlt,
  FaHeart,
  FaUserFriends,
} from "react-icons/fa";
import "./StudentDetailView.css";
import BackButton from "./BackButton"; // Import BackButton

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

  return (
    <div className="student-detail-container">
      <div className="detail-header">
        {/* Thay thế button bằng BackButton */}
        <BackButton onClick={onBack} text="Quay lại danh sách" />
        <h2>Thông tin chi tiết học sinh</h2>
      </div>

      <div className="detail-content">
        <div className="student-profile-section">
          <div className="student-avatar">
            {student.imageUrl ? (
              <img
                src={student.imageUrl}
                alt={student.fullName}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/150?text=Student";
                }}
              />
            ) : (
              <div className="avatar-placeholder">
                <FaUser size={60} />
              </div>
            )}
          </div>

          <div className="student-basic-info">
            <h3>{student.fullName}</h3>
            <div className="info-badges">
              <span className="info-badge">
                <FaIdCard /> {student.studentId}
              </span>
              <span className="info-badge">
                <FaGraduationCap /> {student.gradeLevel}
              </span>
              <span className="info-badge">
                <FaSchool /> {student.className}
              </span>
            </div>
          </div>
        </div>

        <div className="detail-sections">
          <div className="detail-section">
            <h4 className="section-title">Thông tin cá nhân</h4>
            <div className="info-grid">
              <div className="info-item">
                <div className="info-label">
                  <FaUser /> Họ và tên
                </div>
                <div className="info-value">{student.fullName}</div>
              </div>
              <div className="info-item">
                <div className="info-label">
                  <FaBirthdayCake /> Ngày sinh
                </div>
                <div className="info-value">
                  {formatDate(student.dateOfBirth)}
                </div>
              </div>
              <div className="info-item">
                <div className="info-label">
                  <FaVenusMars /> Giới tính
                </div>
                <div className="info-value">{student.gender}</div>
              </div>
              <div className="info-item">
                <div className="info-label">
                  <FaIdCard /> Mã học sinh
                </div>
                <div className="info-value">{student.studentId}</div>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h4 className="section-title">Thông tin học tập</h4>
            <div className="info-grid">
              <div className="info-item">
                <div className="info-label">
                  <FaSchool /> Lớp
                </div>
                <div className="info-value">{student.className}</div>
              </div>
              <div className="info-item">
                <div className="info-label">
                  <FaGraduationCap /> Khối
                </div>
                <div className="info-value">{student.gradeLevel}</div>
              </div>
              <div className="info-item">
                <div className="info-label">
                  <FaCalendarAlt /> Năm học
                </div>
                <div className="info-value">{student.schoolYear}</div>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h4 className="section-title">Thông tin hồ sơ</h4>
            <div className="info-grid">
              <div className="info-item">
                <div className="info-label">
                  <FaHeart /> ID Hồ sơ sức khỏe
                </div>
                <div className="info-value">
                  {student.healthProfileId || "Chưa có"}
                </div>
              </div>
              <div className="info-item">
                <div className="info-label">
                  <FaUserFriends /> ID Phụ huynh
                </div>
                <div className="info-value">
                  {student.parentId || "Chưa có"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailView;
