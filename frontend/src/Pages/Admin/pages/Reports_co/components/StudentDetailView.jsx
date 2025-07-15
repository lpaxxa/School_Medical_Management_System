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
import { formatDate } from "../../../utils/dateUtils";

const StudentDetailView = ({ student, onBack }) => {
  if (!student) return null;

  // Debug: Log student data
  console.log("Student data:", student);
  console.log("Image URL:", student.imageUrl);

  return (
    <div className="reports-student-detail-page">
      {/* Back Button Outside Header */}
      <BackButton onClick={onBack} text="Quay lại danh sách" />

      {/* Header */}
      <div className="reports-student-detail-page-header">
        <h1>Thông tin chi tiết học sinh</h1>
      </div>

      {/* Body */}
      <div className="reports-student-detail-content">
        {/* Cột trái */}
        <div className="reports-student-detail-left-column">
          {/* Ảnh học sinh */}
          <div className="reports-student-detail-photo">
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
                  if (e && e.target) {
                    e.target.onerror = null;
                    e.target.src =
                      "https://via.placeholder.com/200x200/cccccc/666666?text=Student";
                  }
                }}
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="reports-student-detail-photo-placeholder">
                <FaUser size={60} />
                <p>Không có hình ảnh</p>
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
                {student.gender || "Chưa có"}
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
