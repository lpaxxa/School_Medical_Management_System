import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentProfile.css";
import "../shared/student-selector.css";
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

      // If the selected student has a different parentId, fetch that parent's info
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

  // Fetch parent info when component mounts
  useEffect(() => {
    fetchParentInfo();
  }, [fetchParentInfo]);

  // Calculate age from date of birth
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

  // Format date (e.g., "2023-06-15" to "15/06/2023")
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Get student image URL - handle both old and new data structure
  const getStudentImageUrl = (studentData) => {
    // Debug: Log the student data structure
    console.log("Student data for image:", studentData);
    console.log("Image URL:", studentData?.imageUrl);

    // Check for imageUrl at root level (new structure)
    if (studentData?.imageUrl) {
      return studentData.imageUrl;
    }
    // Check for imageUrl in nested student object (old structure)
    if (studentData?.student?.imageUrl) {
      return studentData.student.imageUrl;
    }
    return null;
  };

  if (isLoading) {
    return <LoadingSpinner text="Đang tải thông tin học sinh..." />;
  }

  if (error) {
    return (
      <div className="error-container">
        <i className="fas fa-exclamation-circle"></i>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Thử lại</button>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="no-students-container">
        <i className="fas fa-user-graduate"></i>
        <p>Không tìm thấy thông tin học sinh nào.</p>
      </div>
    );
  }

  return (
    <div className="student-profile-container">
      <h1 className="page-title">Hồ Sơ Học Sinh</h1>

      {/* Student selection */}
      {students.length > 1 && (
        <div className="student-selector">
          <label htmlFor="student-select">Chọn học sinh:</label>
          <select
            id="student-select"
            value={selectedStudentId || ""}
            onChange={(e) => setSelectedStudentId(Number(e.target.value))}
          >
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.fullName}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Student details */}
      {extendedStudent && (
        <div className="student-details">
          <div className="student-profile-card">
            <div className="student-header">
              <div className="student-avatar">
                {getStudentImageUrl(extendedStudent) ? (
                  <img
                    src={getStudentImageUrl(extendedStudent)}
                    alt={extendedStudent.fullName}
                    onError={(e) => {
                      // If image fails to load, show default icon
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <i
                  className="fas fa-user-graduate"
                  style={{
                    display: getStudentImageUrl(extendedStudent)
                      ? "none"
                      : "flex",
                  }}
                ></i>
              </div>
              <div className="student-basic-info">
                <h2>{extendedStudent.fullName}</h2>
                <p>Mã học sinh: {extendedStudent.studentId}</p>
                <p>Lớp: {extendedStudent.className}</p>
                <p>Khối: {extendedStudent.gradeLevel}</p>
              </div>
            </div>

            <div className="student-info-sections">
              <section className="info-section">
                <h3>Thông tin cá nhân</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">Ngày sinh:</span>
                    <span>{formatDate(extendedStudent.dateOfBirth)}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Tuổi:</span>
                    <span>
                      {calculateAge(extendedStudent.dateOfBirth)} tuổi
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Giới tính:</span>
                    <span>{extendedStudent.gender}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Niên khóa:</span>
                    <span>{extendedStudent.schoolYear}</span>
                  </div>
                </div>
              </section>

              {/* Family Information Section */}
              <section className="info-section">
                <h3>Thông tin gia đình</h3>
                {isLoadingParent ? (
                  <div className="loading-indicator">
                    <i className="fas fa-spinner fa-spin"></i> Đang tải thông
                    tin gia đình...
                  </div>
                ) : parentError ? (
                  <div className="error-message">
                    <i className="fas fa-exclamation-circle"></i> {parentError}
                  </div>
                ) : parentInfo ? (
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">Họ tên phụ huynh:</span>
                      <span>{parentInfo.fullName}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Mối quan hệ:</span>
                      <span>
                        {parentInfo.relationshipType || "Chưa cập nhật"}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="label">Email:</span>
                      <span>{parentInfo.email}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Số điện thoại:</span>
                      <span>{parentInfo.phoneNumber}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Địa chỉ:</span>
                      <span>{parentInfo.address || "Chưa cập nhật"}</span>
                    </div>
                    {parentInfo.occupation && (
                      <div className="info-item">
                        <span className="label">Nghề nghiệp:</span>
                        <span>{parentInfo.occupation}</span>
                      </div>
                    )}
                    <div className="info-item">
                      <span className="label">Mã tài khoản:</span>
                      <span>{parentInfo.accountId}</span>
                    </div>
                  </div>
                ) : (
                  <p>Không có thông tin gia đình</p>
                )}
              </section>

              <section className="info-section">
                <h3>Hồ sơ y tế</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">Mã hồ sơ y tế:</span>
                    <span>{extendedStudent.healthProfileId || "Chưa có"}</span>
                  </div>
                </div>
                <div className="health-profile-actions">
                  <button
                    className="primary-button"
                    onClick={() =>
                      navigate(
                        `/parent/health-profile/${extendedStudent.healthProfileId}`
                      )
                    }
                  >
                    <i className="fas fa-file-medical"></i>
                    Xem hồ sơ y tế
                  </button>
                </div>
              </section>
            </div>

            <div className="action-buttons">
              <button
                className="secondary-button"
                onClick={() =>
                  navigate(`/parent/medical-history/${extendedStudent.id}`)
                }
              >
                <i className="fas fa-history"></i>
                Lịch sử khám bệnh
              </button>
              <button
                className="secondary-button"
                onClick={() =>
                  navigate(`/parent/student-edit/${extendedStudent.id}`)
                }
              >
                <i className="fas fa-edit"></i>
                Chỉnh sửa thông tin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
