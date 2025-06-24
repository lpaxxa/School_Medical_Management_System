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
  FaArrowLeft,
} from "react-icons/fa";
import "./StudentDetail.css";

const StudentDetail = ({ student, onBack }) => {
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

  // Tính tuổi từ ngày sinh
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return "Không xác định";
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return `${age} tuổi`;
  };

  return (
    <div className="student-detail">
      <div className="student-detail-header">
        <button className="back-button" onClick={onBack}>
          <FaArrowLeft /> Quay lại danh sách
        </button>
        <h2>Thông tin chi tiết học sinh</h2>
      </div>

      <div className="student-detail-content">
        <div className="student-profile">
          <div className="student-avatar">
            {student.imageUrl ? (
              <img
                src={student.imageUrl}
                alt={student.fullName}
                className="student-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://via.placeholder.com/150?text=Ảnh+học+sinh";
                }}
              />
            ) : (
              <div className="student-image-placeholder">
                <FaUser size={50} />
              </div>
            )}
          </div>

          <div className="student-basic-info">
            <h3>{student.fullName}</h3>
            <div className="student-info-row">
              <div className="info-item">
                <FaIdCard className="info-icon" />
                <div className="info-content">
                  <span className="info-label">Mã học sinh</span>
                  <span className="info-value">{student.studentId}</span>
                </div>
              </div>

              <div className="info-item">
                <FaBirthdayCake className="info-icon" />
                <div className="info-content">
                  <span className="info-label">Ngày sinh</span>
                  <span className="info-value">
                    {formatDate(student.dateOfBirth)} (
                    {calculateAge(student.dateOfBirth)})
                  </span>
                </div>
              </div>

              <div className="info-item">
                <FaVenusMars className="info-icon" />
                <div className="info-content">
                  <span className="info-label">Giới tính</span>
                  <span className="info-value">{student.gender}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="student-details-section">
          <h4 className="section-title">Thông tin lớp học</h4>
          <div className="details-grid">
            <div className="info-item">
              <FaSchool className="info-icon" />
              <div className="info-content">
                <span className="info-label">Lớp</span>
                <span className="info-value">{student.className}</span>
              </div>
            </div>

            <div className="info-item">
              <FaGraduationCap className="info-icon" />
              <div className="info-content">
                <span className="info-label">Khối</span>
                <span className="info-value">{student.gradeLevel}</span>
              </div>
            </div>

            <div className="info-item">
              <FaCalendarAlt className="info-icon" />
              <div className="info-content">
                <span className="info-label">Năm học</span>
                <span className="info-value">{student.schoolYear}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="student-details-section">
          <h4 className="section-title">Thông tin hồ sơ</h4>
          <div className="details-grid">
            <div className="info-item">
              <FaHeart className="info-icon" />
              <div className="info-content">
                <span className="info-label">ID Hồ sơ sức khỏe</span>
                <span className="info-value">
                  {student.healthProfileId || "Chưa có"}
                </span>
              </div>
            </div>

            <div className="info-item">
              <FaUserFriends className="info-icon" />
              <div className="info-content">
                <span className="info-label">ID Phụ huynh</span>
                <span className="info-value">
                  {student.parentId || "Chưa có"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;
