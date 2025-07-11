import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentProfile.css";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";
import { useAuth } from "../../../../context/AuthContext";
import { useStudentData } from "../../../../context/StudentDataContext";

export default function StudentProfile() {
  const { currentUser } = useAuth();
  const {
    students,
    parentInfo,
    isLoading,
    isLoadingParent,
    error,
    parentError,
    fetchParentInfo,
  } = useStudentData();

  const navigate = useNavigate();

  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [extendedStudent, setExtendedStudent] = useState(null);

  // Automatically select the first student when data is loaded
  useEffect(() => {
    if (!isLoading && students.length > 0 && !selectedStudentId) {
      setSelectedStudentId(students[0].id);
    }
  }, [students, isLoading, selectedStudentId]);

  // Update extended student data when selection changes
  useEffect(() => {
    if (selectedStudentId && students.length > 0) {
      const studentData = students.find((s) => s.id === selectedStudentId);
      setExtendedStudent(studentData || null);

      if (
        studentData &&
        (!parentInfo || parentInfo.id !== studentData.parentId)
      ) {
        fetchParentInfo(studentData.parentId);
      }
    } else {
      setExtendedStudent(null);
    }
  }, [selectedStudentId, students, parentInfo, fetchParentInfo]);

  useEffect(() => {
    fetchParentInfo();
  }, [fetchParentInfo]);

  const calculateAge = (dob) => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="parent-content-wrapper">
        <div className="sp-loading">
          <LoadingSpinner text="Đang tải thông tin học sinh..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="parent-content-wrapper">
        <div className="sp-error">
          <i className="fas fa-exclamation-circle"></i>
          <p>{error}</p>
          <button
            className="sp-btn sp-btn-primary"
            onClick={() => window.location.reload()}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="parent-content-wrapper">
        <div className="sp-card">
          <div className="sp-card-body" style={{ textAlign: "center" }}>
            <i
              className="fas fa-user-graduate"
              style={{
                fontSize: "48px",
                color: "#d1d5db",
                marginBottom: "16px",
              }}
            ></i>
            <p>Không tìm thấy thông tin học sinh nào.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="parent-content-wrapper">
      <div className="sp-container">
        {/* Header với nút Back đã được di chuyển lên trên */}
        <div className="sp-header">
          <button
            className="sp-btn sp-btn-secondary sp-back-btn"
            onClick={() => navigate("/parent/dashboard")}
          >
            <i className="fas fa-arrow-left"></i> Quay lại
          </button>
          <h1 className="sp-title">Thông tin học sinh</h1>
        </div>

        {/* Student selection */}
        {students.length > 1 && (
          <div className="sp-card" style={{ marginBottom: "20px" }}>
            <div className="sp-card-body">
              <label
                htmlFor="student-select"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                Chọn học sinh:
              </label>
              <select
                id="student-select"
                value={selectedStudentId || ""}
                onChange={(e) => setSelectedStudentId(Number(e.target.value))}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  fontSize: "14px",
                }}
              >
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.fullName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Student details - giữ nguyên */}
        {extendedStudent && (
          <>
            {/* Student header card */}
            <div className="sp-student-card">
              <div className="sp-student-header">
                <div className="sp-student-avatar">
                  {extendedStudent.imageUrl ? (
                    <img
                      src={extendedStudent.imageUrl}
                      alt={extendedStudent.fullName}
                    />
                  ) : (
                    <img
                      src="https://via.placeholder.com/150"
                      alt="Default Avatar"
                    />
                  )}
                </div>
                <div className="sp-student-info">
                  <h2 className="sp-student-name">
                    {extendedStudent.fullName}
                  </h2>
                  <div className="sp-student-details">
                    <div>
                      Mã học sinh:{" "}
                      {extendedStudent.studentId || extendedStudent.id}
                    </div>
                    <div>
                      Lớp: {extendedStudent.className || extendedStudent.class}
                    </div>
                    <div>
                      Khối:{" "}
                      {extendedStudent.gradeLevel ||
                        "Lớp " + extendedStudent.grade ||
                        "1"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal information */}
            <div className="sp-card">
              <div className="sp-card-header">
                <div className="sp-card-icon">
                  <i className="fas fa-user sp-icon-blue"></i>
                </div>
                <div className="sp-card-title">Thông tin cá nhân</div>
              </div>
              <div className="sp-card-body">
                <div className="sp-info-grid">
                  <div className="sp-info-item">
                    <span className="sp-info-label">Ngày sinh:</span>
                    <span className="sp-info-value">
                      {formatDate(extendedStudent.dateOfBirth) ||
                        "Chưa cập nhật"}
                    </span>
                  </div>
                  <div className="sp-info-item">
                    <span className="sp-info-label">Tuổi:</span>
                    <span className="sp-info-value">
                      {calculateAge(extendedStudent.dateOfBirth)} tuổi
                    </span>
                  </div>
                  <div className="sp-info-item">
                    <span className="sp-info-label">Giới tính:</span>
                    <span className="sp-info-value">
                      {extendedStudent.gender || "Chưa cập nhật"}
                    </span>
                  </div>
                  <div className="sp-info-item">
                    <span className="sp-info-label">Niên khóa:</span>
                    <span className="sp-info-value">
                      {extendedStudent.schoolYear || "2023-2024"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Family information */}
            <div className="sp-card">
              <div className="sp-card-header">
                <div className="sp-card-icon">
                  <i className="fas fa-users sp-icon-purple"></i>
                </div>
                <div className="sp-card-title">Thông tin gia đình</div>
              </div>
              <div className="sp-card-body">
                {isLoadingParent ? (
                  <div style={{ textAlign: "center", padding: "10px" }}>
                    <i className="fas fa-spinner fa-spin"></i> Đang tải thông
                    tin gia đình...
                  </div>
                ) : parentError ? (
                  <div className="sp-error" style={{ margin: "0" }}>
                    <i className="fas fa-exclamation-triangle"></i>{" "}
                    {parentError}
                  </div>
                ) : parentInfo ? (
                  <div className="sp-info-grid">
                    <div className="sp-info-item">
                      <span className="sp-info-label">Họ tên phụ huynh:</span>
                      <span className="sp-info-value">
                        {parentInfo.fullName}
                      </span>
                    </div>
                    <div className="sp-info-item">
                      <span className="sp-info-label">Mối quan hệ:</span>
                      <span className="sp-info-value">
                        {parentInfo.relationshipType || "Bố/Mẹ"}
                      </span>
                    </div>
                    <div className="sp-info-item sp-full-width">
                      <span className="sp-info-label">Email:</span>
                      <span className="sp-info-value">{parentInfo.email}</span>
                    </div>
                    <div className="sp-info-item">
                      <span className="sp-info-label">Số điện thoại:</span>
                      <span className="sp-info-value">
                        {parentInfo.phoneNumber}
                      </span>
                    </div>
                    <div className="sp-info-item">
                      <span className="sp-info-label">Địa chỉ:</span>
                      <span className="sp-info-value">
                        {parentInfo.address || "Chưa cập nhật"}
                      </span>
                    </div>
                    <div className="sp-info-item">
                      <span className="sp-info-label">Mã tài khoản:</span>
                      <span className="sp-info-value">
                        {parentInfo.accountId}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p>Không có thông tin gia đình</p>
                )}
              </div>
            </div>

            {/* Health profile */}
            <div className="sp-card">
              <div className="sp-card-header">
                <div className="sp-card-icon">
                  <i className="fas fa-heartbeat sp-icon-green"></i>
                </div>
                <div className="sp-card-title">Hồ sơ y tế</div>
              </div>
              <div className="sp-card-body">
                <div className="sp-info-grid">
                  <div className="sp-info-item">
                    <span className="sp-info-label">Mã hồ sơ y tế:</span>
                    <span className="sp-info-value">
                      {extendedStudent.healthProfileId || "1"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="sp-card-footer">
                <button
                  className="sp-btn sp-btn-primary"
                  onClick={() =>
                    navigate(
                      `/parent/health-profile/${extendedStudent.healthProfileId}`
                    )
                  }
                >
                  <i className="fas fa-file-medical"></i> Xem hồ sơ y tế
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
