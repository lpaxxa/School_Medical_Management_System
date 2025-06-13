import React, { useState, useEffect } from "react";
import { useStudentData } from "../../../../context/StudentDataContext";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";
import axios from "axios";
import "./MedicalRecords.css";

const MedicalRecords = () => {
  const { students, isLoading: studentsLoading } = useStudentData();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [medicalRecord, setMedicalRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // API URL cho hồ sơ y tế
  const HEALTH_API =
    "https://684684387dbda7ee7aaf4ac1.mockapi.io/api/v1/khaibaosuckhoe/khaibaosuckhoehosinh";

  useEffect(() => {
    // Chọn học sinh đầu tiên khi danh sách học sinh được tải xong
    if (students.length > 0 && !selectedStudent) {
      setSelectedStudent(students[0]);
    }
  }, [students, selectedStudent]);

  // Khi chọn học sinh mới, tải hồ sơ y tế
  useEffect(() => {
    const fetchMedicalRecord = async () => {
      if (!selectedStudent) return;

      setLoading(true);
      setError(null);

      try {
        // Lấy tất cả dữ liệu từ API và lọc theo studentId
        const response = await axios.get(`${HEALTH_API}`);
        const allRecords = response.data;

        // Lọc các bản ghi có chứa trường y tế như height, weight, bmi
        const medicalRecords = allRecords.filter(
          (record) =>
            record.studentId === selectedStudent.id &&
            record.height &&
            record.weight &&
            record.bmi
        );

        if (medicalRecords.length > 0) {
          setMedicalRecord(medicalRecords[0]); // Lấy bản ghi đầu tiên
        } else {
          setError("Không tìm thấy hồ sơ y tế cho học sinh này");
        }
      } catch (err) {
        console.error("Lỗi khi tải hồ sơ y tế:", err);
        setError("Không thể tải hồ sơ y tế. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchMedicalRecord();
  }, [selectedStudent]);

  // Xử lý chọn học sinh
  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setMedicalRecord(null); // Reset hồ sơ y tế khi chọn học sinh mới
  };

  // Format ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    try {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch (e) {
      return dateString;
    }
  };

  // Hiển thị danh sách học sinh
  const renderStudentList = () => {
    if (studentsLoading) {
      return (
        <div className="loading-container">
          <LoadingSpinner />
          <p className="loading-text">Đang tải danh sách học sinh...</p>
        </div>
      );
    }

    if (students.length === 0) {
      return <p className="no-data">Không có thông tin học sinh.</p>;
    }

    return (
      <div className="student-list">
        <h3>Chọn học sinh</h3>
        {students.map((student) => (
          <div
            key={student.id}
            className={`student-card ${
              selectedStudent?.id === student.id ? "selected" : ""
            }`}
            onClick={() => handleStudentSelect(student)}
          >
            <div className="student-avatar">
              <img
                src={student.avatar || "https://i.pravatar.cc/150?img=11"}
                alt={`${student.name}`}
              />
            </div>
            <div className="student-info">
              <h4>{student.name}</h4>
              <p>Lớp: {student.class}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Hiển thị hồ sơ y tế
  const renderMedicalRecord = () => {
    if (!selectedStudent) {
      return (
        <p className="select-prompt">
          Vui lòng chọn học sinh để xem hồ sơ y tế.
        </p>
      );
    }

    if (loading) {
      return (
        <div className="loading-container">
          <LoadingSpinner />
          <p className="loading-text">Đang tải hồ sơ y tế...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-container">
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
          <button
            className="retry-button"
            onClick={() => handleStudentSelect(selectedStudent)}
          >
            <i className="fas fa-redo"></i> Thử lại
          </button>
        </div>
      );
    }

    if (!medicalRecord) {
      return (
        <div className="no-record-container">
          <i className="fas fa-file-medical-alt"></i>
          <p>Chưa có hồ sơ y tế cho học sinh này.</p>
          <p className="hint">
            Hồ sơ y tế được cập nhật sau các đợt khám sức khỏe định kỳ tại
            trường.
          </p>
        </div>
      );
    }

    // Helper function để phân loại BMI
    const getBMIClass = (bmi) => {
      if (!bmi) return "";
      if (bmi < 18.5) return "bmi-underweight";
      if (bmi < 25) return "bmi-normal";
      if (bmi < 30) return "bmi-overweight";
      return "bmi-obese";
    };

    // Helper function để mô tả BMI
    const getBMIDescription = (bmi) => {
      if (!bmi) return "Không xác định";
      if (bmi < 18.5) return "Thiếu cân";
      if (bmi < 25) return "Bình thường";
      if (bmi < 30) return "Thừa cân";
      return "Béo phì";
    };

    return (
      <div className="medical-record-container">
        <div className="record-header">
          <h2>Hồ sơ y tế - {selectedStudent.name}</h2>
          <div className="school-year">
            <span>Năm học: {medicalRecord.schoolYear || "2023-2024"}</span>
          </div>
        </div>

        <div className="updated-info">
          <p>
            <i className="fas fa-sync-alt"></i> Cập nhật lần cuối:
            {formatDate(medicalRecord.lastUpdated)} bởi{" "}
            {medicalRecord.updatedBy || "Nhân viên y tế"}
          </p>
        </div>

        <div className="medical-record-section">
          <h3>
            <i className="fas fa-user-alt"></i> Thông tin cơ bản
          </h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Họ tên:</span>
              <span className="value">{selectedStudent.name}</span>
            </div>
            <div className="info-item">
              <span className="label">Ngày sinh:</span>
              <span className="value">
                {selectedStudent.birthday || "Chưa có thông tin"}
              </span>
            </div>
            <div className="info-item">
              <span className="label">Lớp:</span>
              <span className="value">{selectedStudent.class}</span>
            </div>
            <div className="info-item">
              <span className="label">Nhóm máu:</span>
              <span className="value">
                {medicalRecord.bloodType || "Chưa xác định"}
              </span>
            </div>
          </div>
        </div>

        <div className="medical-record-section">
          <h3>
            <i className="fas fa-weight"></i> Chỉ số thể chất
          </h3>
          <div className="metrics-container">
            <div className="metric-card">
              <div className="metric-value">{medicalRecord.height} cm</div>
              <div className="metric-label">Chiều cao</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{medicalRecord.weight} kg</div>
              <div className="metric-label">Cân nặng</div>
            </div>
            <div className="metric-card">
              <div className={`metric-value ${getBMIClass(medicalRecord.bmi)}`}>
                {medicalRecord.bmi.toFixed(2)}
              </div>
              <div className="metric-label">
                BMI - {getBMIDescription(medicalRecord.bmi)}
              </div>
            </div>
          </div>
        </div>

        <div className="medical-record-section">
          <h3>
            <i className="fas fa-eye"></i> Thị lực
          </h3>
          <div className="vision-container">
            <div className="vision-card left">
              <div className="eye-icon">L</div>
              <div className="vision-value">
                {medicalRecord.visionLeft || "Chưa kiểm tra"}
              </div>
              <div className="vision-label">Mắt trái</div>
            </div>
            <div className="vision-card right">
              <div className="eye-icon">R</div>
              <div className="vision-value">
                {medicalRecord.visionRight || "Chưa kiểm tra"}
              </div>
              <div className="vision-label">Mắt phải</div>
            </div>
          </div>
        </div>

        <div className="medical-record-section">
          <h3>
            <i className="fas fa-notes-medical"></i> Tiền sử bệnh lý
          </h3>

          <div className="health-details">
            <div className="health-detail-item">
              <span className="label">Dị ứng:</span>
              <div className="tags-container">
                {medicalRecord.allergies &&
                medicalRecord.allergies.length > 0 ? (
                  Array.isArray(medicalRecord.allergies) ? (
                    medicalRecord.allergies.map((allergy, index) => (
                      <span key={index} className="health-tag allergy-tag">
                        {allergy}
                      </span>
                    ))
                  ) : (
                    <span className="health-tag allergy-tag">
                      {medicalRecord.allergies}
                    </span>
                  )
                ) : (
                  <span className="empty-tag">Không có</span>
                )}
              </div>
            </div>

            <div className="health-detail-item">
              <span className="label">Bệnh mãn tính:</span>
              <div className="tags-container">
                {medicalRecord.chronicConditions &&
                medicalRecord.chronicConditions.length > 0 ? (
                  Array.isArray(medicalRecord.chronicConditions) ? (
                    medicalRecord.chronicConditions.map((condition, index) => (
                      <span key={index} className="health-tag chronic-tag">
                        {condition}
                      </span>
                    ))
                  ) : (
                    <span className="health-tag chronic-tag">
                      {medicalRecord.chronicConditions}
                    </span>
                  )
                ) : (
                  <span className="empty-tag">Không có</span>
                )}
              </div>
            </div>

            <div className="health-detail-item">
              <span className="label">Thuốc đang dùng:</span>
              <div className="tags-container">
                {medicalRecord.medications &&
                medicalRecord.medications.length > 0 ? (
                  Array.isArray(medicalRecord.medications) ? (
                    medicalRecord.medications.map((medication, index) => (
                      <span key={index} className="health-tag medication-tag">
                        {medication}
                      </span>
                    ))
                  ) : (
                    <span className="health-tag medication-tag">
                      {medicalRecord.medications}
                    </span>
                  )
                ) : (
                  <span className="empty-tag">Không có</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="medical-record-section">
          <h3>
            <i className="fas fa-syringe"></i> Lịch sử tiêm chủng
          </h3>
          {medicalRecord.vaccinations &&
          medicalRecord.vaccinations.length > 0 ? (
            <div className="vaccinations-container">
              <table className="vaccinations-table">
                <thead>
                  <tr>
                    <th>Tên vắc-xin</th>
                    <th>Ngày tiêm</th>
                  </tr>
                </thead>
                <tbody>
                  {medicalRecord.vaccinations.map((vaccine, index) => (
                    <tr key={index}>
                      <td>{vaccine.name}</td>
                      <td>{formatDate(vaccine.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-data-small">Chưa có thông tin tiêm chủng</p>
          )}
        </div>

        <div className="medical-record-section">
          <h3>
            <i className="fas fa-stethoscope"></i> Lịch sử khám sức khỏe định kỳ
          </h3>
          {medicalRecord.healthExams && medicalRecord.healthExams.length > 0 ? (
            <div className="health-exams-container">
              <table className="health-exams-table">
                <thead>
                  <tr>
                    <th>Ngày khám</th>
                    <th>Loại khám</th>
                    <th>Cơ sở y tế</th>
                    <th>Kết quả</th>
                  </tr>
                </thead>
                <tbody>
                  {medicalRecord.healthExams.map((exam, index) => (
                    <tr key={index}>
                      <td>{formatDate(exam.date)}</td>
                      <td>{exam.type || "Khám sức khỏe định kỳ"}</td>
                      <td>{exam.facility || "Y tế trường học"}</td>
                      <td>
                        <span
                          className={`exam-result ${
                            exam.result === "Đạt"
                              ? "result-pass"
                              : "result-review"
                          }`}
                        >
                          {exam.result || "Khỏe mạnh"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-exams-container">
              <p className="no-data-small">
                <i className="fas fa-info-circle"></i> Chưa có thông tin khám
                sức khỏe định kỳ
              </p>
              <p className="health-exam-schedule">
                Đợt khám sức khỏe định kỳ tiếp theo:{" "}
                {medicalRecord.nextExamDate
                  ? formatDate(medicalRecord.nextExamDate)
                  : "Chưa lên lịch"}
              </p>
            </div>
          )}
        </div>

        {medicalRecord.notes && (
          <div className="medical-record-section">
            <h3>
              <i className="fas fa-comment-medical"></i> Ghi chú
            </h3>
            <div className="notes-container">
              <p className="medical-notes">{medicalRecord.notes}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">
            <i className="fas fa-file-medical-alt"></i>
            Hồ sơ y tế học sinh
          </h2>
          <div className="section-actions">
            <button
              className="btn-action btn-outline"
              onClick={() => window.print()}
            >
              <i className="fas fa-print"></i> In hồ sơ
            </button>
          </div>
        </div>
        <p className="section-description">
          Thông tin sức khỏe và kết quả khám định kỳ tại trường
        </p>
      </div>

      <div className="parent-content with-sidebar">
        <div className="content-section">{renderStudentList()}</div>

        <div className="main-content">{renderMedicalRecord()}</div>
      </div>
    </>
  );
};

export default MedicalRecords;
