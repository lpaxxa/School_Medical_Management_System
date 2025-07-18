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
import ReportHeader from "./ReportHeader";
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

  // Helper function to normalize gender display
  const normalizeGender = (gender) => {
    if (!gender) return "Không xác định";
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

  // Helper function to get gender class
  const getGenderClass = (gender) => {
    const normalized = normalizeGender(gender);
    return normalized === "Nam" ? "male" : "female";
  };

  // Delete student function
  const handleDeleteStudent = async (student) => {
    // Validate student object
    if (!student || !student.id) {
      console.error("❌ Invalid student object:", student);
      showError(
        "Lỗi dữ liệu",
        "Thông tin học sinh không hợp lệ.",
        "Vui lòng thử lại hoặc tải lại trang."
      );
      return;
    }

    console.log("🔔 Showing confirm modal for student:", student.fullName);
    showConfirm(
      "Xác nhận xóa học sinh",
      `Bạn có chắc chắn muốn xóa học sinh "${
        student.fullName || "N/A"
      }"?\n\nThao tác này không thể hoàn tác.`,
      async () => {
        console.log("✅ User confirmed deletion, proceeding...");
        try {
          console.log("🗑️ Attempting to delete student:", {
            id: student.id,
            name: student.fullName,
            studentId: student.studentId,
          });
          const token = localStorage.getItem("authToken");
          if (!token) {
            showError(
              "Chưa đăng nhập",
              "Phiên đăng nhập đã hết hạn.",
              "Vui lòng đăng nhập lại để tiếp tục."
            );
            return;
          }

          // Get backend URL safely
          const backendUrl =
            import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
          const deleteUrl = `${backendUrl}/api/v1/students/${student.id}`;
          console.log("🌐 Backend URL:", backendUrl);
          console.log("🌐 Delete URL:", deleteUrl);

          // Create AbortController for timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

          const response = await fetch(deleteUrl, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          console.log("📡 Delete response status:", response.status);
          console.log("📡 Delete response ok:", response.ok);

          if (!response.ok) {
            // Try to get error details from response
            let errorDetails = "";
            try {
              const errorData = await response.text();
              console.log("❌ Error response body:", errorData);
              errorDetails = errorData;
            } catch (e) {
              console.log("❌ Could not read error response");
            }

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
              showError(
                "Lỗi xóa học sinh",
                `Không thể xóa học sinh (${response.status})`,
                errorDetails || "Vui lòng thử lại sau."
              );
            }
            return;
          }

          // Try to get success response data
          let responseData = null;
          try {
            responseData = await response.text();
            console.log("✅ Success response data:", responseData);
          } catch (e) {
            console.log("✅ No response data to read");
          }

          console.log("✅ Student deleted successfully");

          showSuccess(
            "Xóa học sinh thành công!",
            "Học sinh đã được xóa khỏi hệ thống.",
            `Học sinh "${student.fullName}" (${student.studentId}) đã được xóa thành công.`
          );

          // Notify parent component to refresh data
          console.log("🔄 Calling onStudentDeleted with ID:", student.id);
          if (onStudentDeleted) {
            onStudentDeleted(student.id);
          } else {
            console.warn("⚠️ onStudentDeleted callback not provided");
          }
        } catch (error) {
          console.error("Error deleting student:", error);

          let errorTitle = "Lỗi xóa học sinh";
          let errorMessage = "Có lỗi xảy ra khi xóa học sinh.";
          let errorDetails = error.message;

          if (error.name === "AbortError") {
            errorTitle = "Timeout";
            errorMessage = "Yêu cầu xóa học sinh bị timeout.";
            errorDetails = "Vui lòng kiểm tra kết nối mạng và thử lại.";
          } else if (error.message.includes("fetch")) {
            errorTitle = "Lỗi kết nối";
            errorMessage = "Không thể kết nối đến server.";
            errorDetails =
              "Vui lòng kiểm tra kết nối mạng và đảm bảo server đang chạy.";
          }

          showError(errorTitle, errorMessage, errorDetails);
        }
      },
      {
        type: "danger",
        confirmText: "Xác nhận",
        cancelText: "Hủy",
      }
    );
  };

  // Xử lý màn hình loading
  if (isLoading) {
    return (
      <div className="reports-student-list-container theme-teal">
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
      <div className="reports-student-list-container theme-teal">
        <ReportHeader
          title="Quản lý học sinh"
          subtitle="Thống kê học sinh"
          icon="fas fa-user-graduate"
          onBack={onBack}
          colorTheme="teal"
        />
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
      const normalizedGender = normalizeGender(student.gender);
      if (normalizedGender === "Nam") acc.male++;
      else if (normalizedGender === "Nữ") acc.female++;
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
    <div className="reports-student-list-container theme-teal">
      {/* Header Section */}
      <ReportHeader
        title="Quản lý học sinh"
        subtitle="Thống kê học sinh"
        icon="fas fa-user-graduate"
        onBack={onBack}
        colorTheme="teal"
      />

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
                        {student.gradeLevel}
                      </span>
                    </td>
                    <td className="reports-student-table-gender">
                      <span
                        className={`reports-student-gender-badge ${getGenderClass(
                          student.gender
                        )}`}
                      >
                        {normalizeGender(student.gender)}
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
                          onClick={() => {
                            console.log(
                              "🖱️ Delete button clicked for student:",
                              student
                            );
                            handleDeleteStudent(student);
                          }}
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
