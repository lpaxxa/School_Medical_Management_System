import React, { useState } from "react";
import {
  FaUser,
  FaIdCard,
  FaSchool,
  FaGraduationCap,
  FaEye,
  FaTrashAlt,
  FaSearch,
  FaArrowLeft,
  FaUsers,
  FaChild,
  FaVenusMars,
} from "react-icons/fa";
import "./StudentListView.css";
import BackButton from "./BackButton";
import ErrorModal from "../../../components/ErrorModal";
import ConfirmModal from "../../../components/ConfirmModal";
import SuccessModal from "../../../components/SuccessModal";
import { useErrorModal } from "../../../hooks/useErrorModal";
import { useConfirmModal } from "../../../hooks/useConfirmModal";
import { useSuccessModal } from "../../../hooks/useSuccessModal";

const StudentListView = ({
  students,
  isLoading,
  onViewDetail,
  onBack,
  onStudentDeleted,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Modal hooks
  const {
    isOpen: isErrorOpen,
    modalData: errorData,
    showError,
    hideError,
  } = useErrorModal();

  const {
    isOpen: isConfirmOpen,
    modalData: confirmData,
    showConfirm,
    hideConfirm,
  } = useConfirmModal();

  const {
    isOpen: isSuccessOpen,
    modalData: successData,
    showSuccess,
    hideSuccess,
  } = useSuccessModal();

  // Delete student function
  const handleDeleteStudent = async (student) => {
    showConfirm(
      "Xác nhận xóa học sinh",
      `Bạn có chắc chắn muốn xóa học sinh "${student.fullName}"?\n\nThao tác này không thể hoàn tác.`,
      "danger",
      async () => {
        try {
          const token = localStorage.getItem("authToken");
          if (!token) {
            showError(
              "Chưa đăng nhập",
              "Phiên đăng nhập đã hết hạn.",
              "Vui lòng đăng nhập lại để tiếp tục."
            );
            return;
          }

          const response = await fetch(`/api/v1/students/${student.id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            if (response.status === 401) {
              showError(
                "Phiên đăng nhập hết hạn",
                "Phiên đăng nhập đã hết hạn.",
                "Vui lòng đăng nhập lại để tiếp tục."
              );
            } else if (response.status === 403) {
              showError(
                "Không có quyền",
                "Bạn không có quyền xóa học sinh.",
                "Vui lòng liên hệ quản trị viên."
              );
            } else {
              throw new Error(`Không thể xóa học sinh (${response.status})`);
            }
            return;
          }

          showSuccess(
            "Xóa học sinh thành công!",
            "Học sinh đã được xóa khỏi hệ thống.",
            `Học sinh "${student.fullName}" (${student.studentId}) đã được xóa thành công.`
          );

          // Notify parent component to refresh data
          if (onStudentDeleted) {
            onStudentDeleted(student.id);
          }
        } catch (error) {
          console.error("Error deleting student:", error);
          showError(
            "Lỗi xóa học sinh",
            "Có lỗi xảy ra khi xóa học sinh.",
            `Chi tiết lỗi: ${error.message}`
          );
        }
      }
    );
  };

  // Xử lý màn hình loading
  if (isLoading) {
    return (
      <div className="reports-student-list-container">
        <div className="reports-student-list-loading">
          <div className="reports-student-loading-spinner"></div>
          <div className="reports-student-loading-text">
            Đang tải danh sách học sinh...
          </div>
          <div className="reports-student-loading-subtext">
            Vui lòng chờ trong giây lát
          </div>
        </div>
      </div>
    );
  }

  // Xử lý trường hợp không có dữ liệu
  if (!students || students.length === 0) {
    return (
      <div className="reports-student-list-container">
        <div className="reports-student-list-header-section">
          <div className="reports-student-header-content">
            <BackButton onClick={onBack} text="Quay lại" />
            <h1 className="reports-student-list-title">Quản lý học sinh</h1>
            <p className="reports-student-list-subtitle">
              Thống kê sức khỏe học sinh
            </p>
          </div>
        </div>
        <div className="reports-student-list-empty">
          <FaUsers size={48} color="#ccc" />
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
    <div className="reports-student-list-container">
      {/* Header Section */}
      <div className="reports-student-list-header-section">
        <div className="reports-student-header-content">
          <BackButton onClick={onBack} text="Quay lại" />
          <h1 className="reports-student-list-title">Quản lý học sinh</h1>
          <p className="reports-student-list-subtitle">
            Thống kê sức khỏe học sinh
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="reports-student-stats-section">
        <div className="reports-student-stat-item">
          <div className="reports-student-stat-icon">
            <FaUsers />
          </div>
          <div className="reports-student-stat-content">
            <div className="reports-student-stat-number">{students.length}</div>
            <div className="reports-student-stat-label">Tổng số học sinh</div>
          </div>
        </div>

        <div className="reports-student-stat-item">
          <div className="reports-student-stat-icon">
            <FaChild />
          </div>
          <div className="reports-student-stat-content">
            <div className="reports-student-stat-number">
              {genderStats.male}
            </div>
            <div className="reports-student-stat-label">Học sinh nam</div>
          </div>
        </div>

        <div className="reports-student-stat-item">
          <div className="reports-student-stat-icon">
            <FaVenusMars />
          </div>
          <div className="reports-student-stat-content">
            <div className="reports-student-stat-number">
              {genderStats.female}
            </div>
            <div className="reports-student-stat-label">Học sinh nữ</div>
          </div>
        </div>

        <div className="reports-student-stat-item">
          <div className="reports-student-stat-icon">
            <FaSchool />
          </div>
          <div className="reports-student-stat-content">
            <div className="reports-student-stat-number">{classes.length}</div>
            <div className="reports-student-stat-label">Lớp học</div>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="reports-student-list-controls-section">
        <div className="reports-student-list-controls">
          <div className="reports-student-search-section">
            <div className="reports-student-search">
              <FaSearch />
              <input
                type="text"
                placeholder="Tìm kiếm học sinh..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="reports-student-stats-section-controls">
            <div className="reports-student-count">
              <FaUsers /> Danh sách học sinh ({filteredStudents.length} học
              sinh)
            </div>
          </div>
        </div>
      </div>

      {/* Student Table */}
      <div className="reports-student-list-section">
        {filteredStudents.length === 0 ? (
          <div className="reports-student-list-empty">
            <FaSearch size={48} color="#ccc" />
            <h3>Không tìm thấy học sinh</h3>
            <p>Thử thay đổi từ khóa tìm kiếm</p>
          </div>
        ) : (
          <div className="reports-student-table-container">
            <table className="reports-student-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Mã học sinh</th>
                  <th>Họ và tên</th>
                  <th>Lớp học</th>
                  <th>Khối lớp</th>
                  <th>Giới tính</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, index) => (
                  <tr key={student.id} className="reports-student-table-row">
                    <td className="reports-student-table-stt">{index + 1}</td>
                    <td className="reports-student-table-id">
                      <span className="reports-student-id-badge">
                        {student.studentId}
                      </span>
                    </td>
                    <td className="reports-student-table-name">
                      <div className="reports-student-name-info">
                        <FaUser className="reports-student-table-icon" />
                        <span className="reports-student-name">
                          {student.fullName}
                        </span>
                      </div>
                    </td>
                    <td className="reports-student-table-class">
                      <span className="reports-student-class-badge">
                        {student.className}
                      </span>
                    </td>
                    <td className="reports-student-table-grade">
                      <span className="reports-student-grade-badge">
                        Lớp {student.gradeLevel}
                      </span>
                    </td>
                    <td className="reports-student-table-gender">
                      <span
                        className={`reports-student-gender-badge ${
                          student.gender === "Nam" ? "male" : "female"
                        }`}
                      >
                        {student.gender}
                      </span>
                    </td>
                    <td className="reports-student-table-actions">
                      <div className="reports-student-action-buttons">
                        <button
                          className="reports-student-action-btn reports-student-view-btn"
                          onClick={() => onViewDetail(student)}
                          title="Xem chi tiết"
                        >
                          <FaEye />
                        </button>
                        <button
                          className="reports-student-action-btn reports-student-delete-btn"
                          onClick={() => handleDeleteStudent(student)}
                          title="Xóa học sinh"
                        >
                          <FaTrashAlt />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Components */}
      <ErrorModal
        isOpen={isErrorOpen}
        onClose={hideError}
        title={errorData.title}
        message={errorData.message}
        details={errorData.details}
      />

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={hideConfirm}
        onConfirm={confirmData.onConfirm}
        title={confirmData.title}
        message={confirmData.message}
        type={confirmData.type}
      />

      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={hideSuccess}
        title={successData.title}
        message={successData.message}
        details={successData.details}
      />
    </div>
  );
};

export default StudentListView;
