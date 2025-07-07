import React, { useState } from "react";
import {
  FaUser,
  FaIdCard,
  FaSchool,
  FaGraduationCap,
  FaEye,
  FaEdit,
  FaTrashAlt,
  FaSearch,
  FaArrowLeft,
  FaUsers,
  FaChild,
  FaVenusMars,
} from "react-icons/fa";
import "./StudentListView.css";
import BackButton from "./BackButton";

const StudentListView = ({ students, isLoading, onViewDetail, onBack }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Xử lý màn hình loading
  if (isLoading) {
    return (
      <div className="student-list-container">
        <div className="student-list-loading-enhanced">
          <div className="student-loading-spinner-enhanced"></div>
          <div className="loading-text-enhanced">
            Đang tải danh sách học sinh...
          </div>
          <div className="loading-subtext">Vui lòng chờ trong giây lát</div>
        </div>
      </div>
    );
  }

  // Xử lý trường hợp không có dữ liệu
  if (!students || students.length === 0) {
    return (
      <div className="student-list-container">
        <div className="student-list-header-section">
          <div className="header-content-enhanced">
            <BackButton onClick={onBack} text="Quay lại" />
            <h1 className="student-list-title-enhanced">Quản lý học sinh</h1>
            <p className="student-list-subtitle-enhanced">
              Thống kê sức khỏe học sinh
            </p>
          </div>
        </div>
        <div className="student-list-empty-enhanced">
          <i className="fas fa-users"></i>
          <h3>Không có dữ liệu học sinh</h3>
          <p>Chưa có học sinh nào được thêm vào hệ thống</p>
        </div>
      </div>
    );
  }

  // Tính toán thống kê
  const genderStats = students.reduce(
    (acc, student) => {
      if (student.gender === "Nam") acc.male++;
      else if (student.gender === "Nữ") acc.female++;
      return acc;
    },
    { male: 0, female: 0 }
  );

  // Lấy danh sách lớp duy nhất
  const classes = [
    ...new Set(students.map((s) => s.className).filter(Boolean)),
  ];

  // Lọc học sinh theo tìm kiếm
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      searchTerm === "" ||
      student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="student-list-container">
      {/* Header Section */}
      <div className="student-list-header-section">
        <div className="header-content-enhanced">
          <BackButton onClick={onBack} text="Quay lại" />
          <h1 className="student-list-title-enhanced">Quản lý học sinh</h1>
          <p className="student-list-subtitle-enhanced">
            Thống kê sức khỏe học sinh
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="student-stats-section">
        <div className="stat-item">
          <div className="stat-icon">
            <FaUsers />
          </div>
          <div className="stat-content">
            <div className="stat-number">{students.length}</div>
            <div className="stat-label">Tổng số học sinh</div>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon">
            <FaChild />
          </div>
          <div className="stat-content">
            <div className="stat-number">{genderStats.male}</div>
            <div className="stat-label">Học sinh nam</div>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon">
            <FaVenusMars />
          </div>
          <div className="stat-content">
            <div className="stat-number">{genderStats.female}</div>
            <div className="stat-label">Học sinh nữ</div>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon">
            <FaSchool />
          </div>
          <div className="stat-content">
            <div className="stat-number">{classes.length}</div>
            <div className="stat-label">Lớp học</div>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="student-list-controls-section">
        <div className="student-list-controls-enhanced">
          <div className="search-section-enhanced">
            <div className="student-search-enhanced">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Tìm kiếm học sinh..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="stats-section-enhanced">
            <div className="student-count-enhanced">
              <i className="fas fa-users"></i> Danh sách học sinh
              {filteredStudents.length} học sinh
            </div>
          </div>
        </div>
      </div>

      {/* Student List */}
      <div className="student-list-section">
        {filteredStudents.length === 0 ? (
          <div className="student-list-empty-enhanced">
            <i className="fas fa-search"></i>
            <h3>Không tìm thấy học sinh</h3>
            <p>Thử thay đổi từ khóa tìm kiếm</p>
          </div>
        ) : (
          <div className="student-list-items">
            {filteredStudents.map((student) => (
              <div key={student.id} className="student-list-item">
                <div className="student-item-header">
                  <div className="student-name">{student.fullName}</div>
                  <div className="student-id-badge">{student.studentId}</div>
                </div>

                <div className="student-item-details">
                  <div className="student-detail-row">
                    <i className="fas fa-school"></i>
                    <span className="student-detail-text">
                      Lớp: {student.className}
                    </span>
                  </div>
                  <div className="student-detail-row">
                    <i className="fas fa-graduation-cap"></i>
                    <span className="student-detail-text">
                      Lớp {student.gradeLevel}
                    </span>
                  </div>
                  <div className="student-detail-row">
                    <i className="fas fa-user"></i>
                    <span className="student-detail-text">
                      Giới tính: {student.gender}
                    </span>
                  </div>
                </div>

                <div className="student-item-actions">
                  <button
                    className="action-btn view-btn"
                    onClick={() => onViewDetail(student)}
                    title="Xem chi tiết"
                  >
                    <FaEye />
                  </button>
                  <button className="action-btn edit-btn" title="Chỉnh sửa">
                    <FaEdit />
                  </button>
                  <button className="action-btn delete-btn" title="Xóa">
                    <FaTrashAlt />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentListView;
