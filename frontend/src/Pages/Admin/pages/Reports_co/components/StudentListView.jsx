import React, { useState } from "react";
import {
  FaUser,
  FaIdCard,
  FaSchool,
  FaGraduationCap,
  FaEye,
  FaChild,
  FaUsers,
  FaVenusMars,
  FaEdit,
  FaTrashAlt,
  FaPlus,
  FaSearch,
  FaFilter,
  FaSortAmountDown,
  FaArrowLeft,
  FaUserFriends,
} from "react-icons/fa";
import "./StudentListView.css";

const StudentListView = ({ students, isLoading, onViewDetail, onBack }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");

  // Các hàm xử lý - sẽ thay thế bằng API sau
  const handleAddStudent = () => {
    console.log("Thêm học sinh mới");
    // Sẽ thay thế bằng API call sau
  };

  const handleEditStudent = (studentId) => {
    console.log("Sửa học sinh có ID:", studentId);
    // Sẽ thay thế bằng API call sau
  };

  const handleDeleteStudent = (studentId) => {
    console.log("Xóa học sinh có ID:", studentId);
    if (window.confirm("Bạn có chắc chắn muốn xóa học sinh này?")) {
      // Sẽ thay thế bằng API call sau
    }
  };

  // Xử lý màn hình loading
  if (isLoading) {
    return (
      <div className="student-list-container">
        <div className="student-list-loading">
          <div className="spinner"></div>
          <p>Đang tải danh sách học sinh...</p>
        </div>
      </div>
    );
  }

  // Xử lý trường hợp không có dữ liệu
  if (!students || students.length === 0) {
    return (
      <div className="student-list-container">
        <div className="back-nav">
          <button className="back-button" onClick={onBack}>
            <FaArrowLeft /> Quay lại
          </button>
        </div>
        <div className="student-list-empty">
          <FaUserFriends size={48} />
          <h3>Không có dữ liệu học sinh</h3>
          <p>Chưa có học sinh nào được thêm vào hệ thống</p>
          <button className="btn-add-first" onClick={handleAddStudent}>
            <FaPlus /> Thêm học sinh đầu tiên
          </button>
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

  // Lấy danh sách lớp và khối duy nhất
  const classes = [
    ...new Set(students.map((s) => s.className).filter(Boolean)),
  ];
  const grades = [
    ...new Set(students.map((s) => s.gradeLevel).filter(Boolean)),
  ];

  // Lọc học sinh theo tìm kiếm và bộ lọc
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      searchTerm === "" ||
      student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass =
      selectedClass === "" || student.className === selectedClass;
    const matchesGrade =
      selectedGrade === "" || student.gradeLevel === selectedGrade;

    return matchesSearch && matchesClass && matchesGrade;
  });

  return (
    <div className="student-list-container">
      {/* Thanh điều hướng */}
      <div className="back-nav">
        <button className="back-button" onClick={onBack}>
          <FaArrowLeft /> Quay lại
        </button>
        <h2 className="page-title">Quản lý học sinh</h2>
      </div>

      {/* Thống kê */}
      <div className="stats-dashboard">
        <div className="stat-card total-card">
          <div className="stat-icon-wrapper total-icon">
            <FaUsers />
          </div>
          <div className="stat-info">
            <h3>{students.length}</h3>
            <p>Tổng số học sinh</p>
          </div>
        </div>

        <div className="stat-card male-card">
          <div className="stat-icon-wrapper male-icon">
            <FaChild />
          </div>
          <div className="stat-info">
            <h3>{genderStats.male}</h3>
            <p>Học sinh nam</p>
          </div>
        </div>

        <div className="stat-card female-card">
          <div className="stat-icon-wrapper female-icon">
            <FaVenusMars />
          </div>
          <div className="stat-info">
            <h3>{genderStats.female}</h3>
            <p>Học sinh nữ</p>
          </div>
        </div>

        <div className="stat-card class-card">
          <div className="stat-icon-wrapper class-icon">
            <FaSchool />
          </div>
          <div className="stat-info">
            <h3>{classes.length}</h3>
            <p>Lớp học</p>
          </div>
        </div>
      </div>

      {/* Bộ lọc và tìm kiếm */}
      <div className="filters-container">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc mã học sinh..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <div className="filter-select">
            <label>
              <FaFilter /> Lọc theo lớp
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">Tất cả các lớp</option>
              {classes.map((className) => (
                <option key={className} value={className}>
                  {className}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-select">
            <label>
              <FaSortAmountDown /> Lọc theo khối
            </label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
            >
              <option value="">Tất cả các khối</option>
              {grades.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button className="add-button" onClick={handleAddStudent}>
          <FaPlus /> Thêm học sinh
        </button>
      </div>

      {/* Danh sách học sinh */}
      <div className="student-list-results">
        <div className="results-header">
          <h3>
            <FaUsers /> Danh sách học sinh
            <span className="results-count">
              {filteredStudents.length} học sinh
            </span>
          </h3>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="no-results">
            <p>Không tìm thấy học sinh phù hợp với tiêu chí tìm kiếm</p>
          </div>
        ) : (
          <div className="student-cards-grid">
            {filteredStudents.map((student) => (
              <div key={student.id} className="student-card">
                <div className="student-header">
                  <h4>{student.fullName}</h4>
                  <span className="student-id">
                    <FaIdCard /> {student.studentId}
                  </span>
                </div>

                <div className="student-body">
                  <div className="student-info-list">
                    <div className="info-item">
                      <FaSchool />{" "}
                      <span>Lớp: {student.className || "Chưa phân lớp"}</span>
                    </div>
                    <div className="info-item">
                      <FaGraduationCap />{" "}
                      <span>{student.gradeLevel || "Chưa phân khối"}</span>
                    </div>
                    <div className="info-item">
                      <FaUser />{" "}
                      <span>
                        Giới tính: {student.gender || "Chưa xác định"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="student-actions">
                  <button
                    className="action-btn view-btn"
                    onClick={() => onViewDetail(student)}
                    title="Xem chi tiết"
                  >
                    <FaEye />
                  </button>
                  <button
                    className="action-btn edit-btn"
                    onClick={() => handleEditStudent(student.id)}
                    title="Chỉnh sửa"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDeleteStudent(student.id)}
                    title="Xóa"
                  >
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
