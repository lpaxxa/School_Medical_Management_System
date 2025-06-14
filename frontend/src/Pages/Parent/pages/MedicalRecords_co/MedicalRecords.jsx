import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import "./MedicalRecords.css";
import {
  FaHeartbeat,
  FaSyringe,
  FaWeight,
  FaRulerVertical,
  FaFileMedicalAlt,
  FaCalendarCheck,
  FaEye,
  FaTooth,
  FaStethoscope,
  FaAllergies,
  FaUserMd,
  FaNotesMedical,
  FaPrint,
  FaArrowLeft,
  FaHome,
  FaBandAid,
  FaProcedures,
  FaChartLine,
} from "react-icons/fa";

const MedicalRecord = () => {
  const { healthProfileId } = useParams();
  const [activeTab, setActiveTab] = useState("general");
  const [isLoading, setIsLoading] = useState(true);

  // Demo học sinh
  const mockStudent = {
    id: 3,
    fullName: "Lê Thị Em",
    dateOfBirth: "2015-07-15",
    gender: "Nữ",
    studentId: "SV002",
    className: "2B",
    gradeLevel: "Lớp 2",
    schoolYear: "2023-2024",
    imageUrl: null,
    healthProfileId: 2,
  };

  // Mock data cho demo
  const mockMedicalData = {
    generalInfo: {
      bloodType: "A+",
      height: 145,
      weight: 40,
      bmi: 19.0,
      allergies: "Hải sản, Đậu phộng",
      chronicConditions: "Hen suyễn nhẹ",
      visionLeft: "20/20",
      visionRight: "20/30",
      dentalStatus: "Răng sữa còn 4 cái",
    },
    checkupHistory: [
      {
        id: 1,
        date: "2023-09-15",
        type: "Khám định kỳ",
        doctor: "BS. Nguyễn Văn A",
        location: "Phòng y tế trường học",
        findings: "Sức khỏe tổng quát tốt, không có vấn đề đáng ngại.",
        recommendations: "Tiếp tục theo dõi chiều cao, cân nặng",
      },
      {
        id: 2,
        date: "2023-06-20",
        type: "Khám mắt",
        doctor: "BS. Trần Thị B",
        location: "Phòng y tế trường học",
        findings: "Thị lực giảm nhẹ ở mắt phải.",
        recommendations:
          "Theo dõi thêm, nếu giảm tiếp cần đến bác sĩ chuyên khoa.",
      },
      {
        id: 3,
        date: "2023-03-10",
        type: "Khám răng",
        doctor: "BS. Lê Văn C",
        location: "Phòng y tế trường học",
        findings: "Răng sữa lung lay 2 cái, chuẩn bị thay răng vĩnh viễn.",
        recommendations: "Chăm sóc răng miệng thường xuyên.",
      },
    ],
    vaccinations: [
      {
        id: 1,
        date: "2022-11-05",
        name: "Vắc xin cúm mùa",
        dose: "0.5ml",
        manufacturer: "GlaxoSmithKline",
        location: "Trạm y tế phường",
        nextDue: "2023-11-05",
      },
      {
        id: 2,
        date: "2022-05-15",
        name: "MMR (Sởi - Quai bị - Rubella)",
        dose: "0.5ml",
        manufacturer: "Merck",
        location: "Trung tâm y tế dự phòng",
        nextDue: null,
      },
      {
        id: 3,
        date: "2021-01-10",
        name: "Viêm não Nhật Bản",
        dose: "0.5ml",
        manufacturer: "Sanofi Pasteur",
        location: "Bệnh viện Nhi đồng",
        nextDue: "2024-01-10",
      },
    ],
    medicalHistoryEvents: [
      {
        id: 1,
        date: "2023-02-15",
        type: "Bệnh",
        description: "Cảm cúm",
        treatment: "Nghỉ ngơi, uống nhiều nước, thuốc hạ sốt paracetamol",
        duration: "1 tuần",
        doctor: "BS. Nguyễn Thị D",
      },
      {
        id: 2,
        date: "2022-10-05",
        type: "Chấn thương",
        description: "Trầy xước đầu gối khi chơi thể thao",
        treatment: "Vệ sinh vết thương, băng gạc",
        duration: "3 ngày",
        doctor: "Y tá trường học",
      },
      {
        id: 3,
        date: "2021-05-20",
        type: "Phẫu thuật",
        description: "Phẫu thuật cắt amidan",
        treatment: "Gây mê, phẫu thuật, kê thuốc kháng sinh và giảm đau",
        duration: "2 tuần hồi phục",
        doctor: "BS. Trần Văn E",
      },
    ],
    growthData: [
      { date: "2021-01", height: 130, weight: 30 },
      { date: "2021-06", height: 133, weight: 32 },
      { date: "2022-01", height: 136, weight: 34 },
      { date: "2022-06", height: 139, weight: 36 },
      { date: "2023-01", height: 143, weight: 38 },
      { date: "2023-06", height: 145, weight: 40 },
    ],
  };

  // Hiệu ứng loading giả lập
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Đang tải hồ sơ y tế...</p>
      </div>
    );
  }

  return (
    <div className="medical-record-container">
      <div className="medical-record-header">
        <div className="header-content">
          <h1>Hồ Sơ Y Tế</h1>
          <div className="student-basic-info">
            <h2>{mockStudent.fullName}</h2>
            <p>
              Mã học sinh: {mockStudent.studentId} | Lớp:{" "}
              {mockStudent.className}
            </p>
          </div>
        </div>
        <Link to={`/parent/student-profile`} className="back-button">
          <FaArrowLeft /> Trở về hồ sơ
        </Link>
      </div>

      <div className="medical-nav-tabs">
        <button
          className={activeTab === "general" ? "active" : ""}
          onClick={() => setActiveTab("general")}
        >
          <FaHeartbeat /> Thông tin chung
        </button>
        <button
          className={activeTab === "checkups" ? "active" : ""}
          onClick={() => setActiveTab("checkups")}
        >
          <FaCalendarCheck /> Kiểm tra định kỳ
        </button>
        <button
          className={activeTab === "vaccinations" ? "active" : ""}
          onClick={() => setActiveTab("vaccinations")}
        >
          <FaSyringe /> Tiêm chủng
        </button>
        <button
          className={activeTab === "history" ? "active" : ""}
          onClick={() => setActiveTab("history")}
        >
          <FaFileMedicalAlt /> Bệnh án
        </button>
        <button
          className={activeTab === "growth" ? "active" : ""}
          onClick={() => setActiveTab("growth")}
        >
          <FaChartLine /> Tăng trưởng
        </button>
      </div>

      <div className="medical-content">
        {activeTab === "general" && (
          <div className="general-info-panel">
            <h3>Thông tin sức khỏe tổng quát</h3>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <FaHeartbeat />
                </div>
                <div className="stat-content">
                  <h4>Nhóm máu</h4>
                  <p>{mockMedicalData.generalInfo.bloodType}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <FaRulerVertical />
                </div>
                <div className="stat-content">
                  <h4>Chiều cao</h4>
                  <p>{mockMedicalData.generalInfo.height} cm</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <FaWeight />
                </div>
                <div className="stat-content">
                  <h4>Cân nặng</h4>
                  <p>{mockMedicalData.generalInfo.weight} kg</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <FaWeight />
                </div>
                <div className="stat-content">
                  <h4>Chỉ số BMI</h4>
                  <p>{mockMedicalData.generalInfo.bmi}</p>
                  <small>{getBMIStatus(mockMedicalData.generalInfo.bmi)}</small>
                </div>
              </div>
            </div>

            <div className="medical-details-section">
              <div className="medical-detail">
                <h4>
                  <FaEye /> Thị lực
                </h4>
                <div className="detail-content">
                  <p>Mắt trái: {mockMedicalData.generalInfo.visionLeft}</p>
                  <p>Mắt phải: {mockMedicalData.generalInfo.visionRight}</p>
                </div>
              </div>

              <div className="medical-detail">
                <h4>
                  <FaTooth /> Răng miệng
                </h4>
                <p>{mockMedicalData.generalInfo.dentalStatus}</p>
              </div>

              <div className="medical-detail">
                <h4>
                  <FaAllergies /> Dị ứng
                </h4>
                <p>{mockMedicalData.generalInfo.allergies}</p>
              </div>

              <div className="medical-detail">
                <h4>
                  <FaStethoscope /> Bệnh mãn tính
                </h4>
                <p>{mockMedicalData.generalInfo.chronicConditions}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "checkups" && (
          <div className="checkups-panel">
            <h3>Lịch sử kiểm tra sức khỏe định kỳ</h3>

            <div className="checkup-timeline">
              {mockMedicalData.checkupHistory.map((checkup) => (
                <div className="timeline-item" key={checkup.id}>
                  <div className="timeline-marker">
                    <div className="timeline-dot"></div>
                    <div className="timeline-date">
                      {formatDate(checkup.date)}
                    </div>
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-card">
                      <h4>{checkup.type}</h4>
                      <div className="checkup-details">
                        <p>
                          <strong>Bác sĩ:</strong> {checkup.doctor}
                        </p>
                        <p>
                          <strong>Địa điểm:</strong> {checkup.location}
                        </p>
                        <h5>Kết quả kiểm tra:</h5>
                        <p>{checkup.findings}</p>
                        <h5>Khuyến nghị:</h5>
                        <p>{checkup.recommendations}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "vaccinations" && (
          <div className="vaccinations-panel">
            <h3>Lịch sử tiêm chủng</h3>

            <table className="vaccination-table">
              <thead>
                <tr>
                  <th>Ngày tiêm</th>
                  <th>Loại vắc xin</th>
                  <th>Liều lượng</th>
                  <th>Nhà sản xuất</th>
                  <th>Địa điểm</th>
                  <th>Lịch tiêm tiếp theo</th>
                </tr>
              </thead>
              <tbody>
                {mockMedicalData.vaccinations.map((vaccine) => (
                  <tr key={vaccine.id}>
                    <td>{formatDate(vaccine.date)}</td>
                    <td>{vaccine.name}</td>
                    <td>{vaccine.dose}</td>
                    <td>{vaccine.manufacturer}</td>
                    <td>{vaccine.location}</td>
                    <td>
                      {vaccine.nextDue
                        ? formatDate(vaccine.nextDue)
                        : "Hoàn thành"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "history" && (
          <div className="history-panel">
            <h3>Lịch sử bệnh án</h3>

            <div className="medical-history-list">
              {mockMedicalData.medicalHistoryEvents.map((event) => (
                <div className="medical-event-card" key={event.id}>
                  <div className="event-header">
                    <div className="event-title">
                      <h4>
                        {event.type}: {event.description}
                      </h4>
                      <span className="event-date">
                        {formatDate(event.date)}
                      </span>
                    </div>
                    <div className="event-badge">
                      {getEventIcon(event.type)}
                    </div>
                  </div>

                  <div className="event-details">
                    <div className="detail-item">
                      <strong>Điều trị:</strong> {event.treatment}
                    </div>
                    <div className="detail-item">
                      <strong>Thời gian:</strong> {event.duration}
                    </div>
                    <div className="detail-item">
                      <strong>Bác sĩ phụ trách:</strong> {event.doctor}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "growth" && (
          <div className="growth-panel">
            <h3>Biểu đồ tăng trưởng</h3>

            <div className="growth-charts">
              <div className="chart-container">
                <h4>Chiều cao theo thời gian (cm)</h4>
                <div className="chart-placeholder">
                  <div className="mock-chart">
                    <div className="chart-bars">
                      {mockMedicalData.growthData.map((item, index) => (
                        <div
                          key={index}
                          className="chart-bar"
                          style={{ height: `${item.height / 2}px` }}
                          title={`${item.date}: ${item.height}cm`}
                        >
                          <span className="chart-value">{item.height}</span>
                        </div>
                      ))}
                    </div>
                    <div className="chart-labels">
                      {mockMedicalData.growthData.map((item, index) => (
                        <div key={index} className="chart-label">
                          {item.date}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="chart-container">
                <h4>Cân nặng theo thời gian (kg)</h4>
                <div className="chart-placeholder">
                  <div className="mock-chart">
                    <div className="chart-bars weight-bars">
                      {mockMedicalData.growthData.map((item, index) => (
                        <div
                          key={index}
                          className="chart-bar"
                          style={{ height: `${item.weight * 2}px` }}
                          title={`${item.date}: ${item.weight}kg`}
                        >
                          <span className="chart-value">{item.weight}</span>
                        </div>
                      ))}
                    </div>
                    <div className="chart-labels">
                      {mockMedicalData.growthData.map((item, index) => (
                        <div key={index} className="chart-label">
                          {item.date}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="growth-table-section">
              <h4>Bảng dữ liệu tăng trưởng</h4>
              <table className="growth-table">
                <thead>
                  <tr>
                    <th>Thời gian</th>
                    <th>Chiều cao (cm)</th>
                    <th>Cân nặng (kg)</th>
                    <th>BMI</th>
                  </tr>
                </thead>
                <tbody>
                  {mockMedicalData.growthData.map((item, index) => {
                    const bmi = calculateBMI(item.height, item.weight);
                    return (
                      <tr key={index}>
                        <td>{item.date}</td>
                        <td>{item.height}</td>
                        <td>{item.weight}</td>
                        <td>
                          {bmi} ({getBMIStatus(bmi)})
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="medical-record-footer">
        <button className="print-button" onClick={() => window.print()}>
          <i className="fas fa-print"></i> In hồ sơ y tế
        </button>
      </div>
    </div>
  );
};

// Helper functions
function getBMIStatus(bmi) {
  if (!bmi) return "Chưa có dữ liệu";
  if (bmi < 16) return "Suy dinh dưỡng";
  if (bmi < 18.5) return "Thiếu cân";
  if (bmi < 25) return "Bình thường";
  if (bmi < 30) return "Thừa cân";
  return "Béo phì";
}

function calculateBMI(height, weight) {
  if (!height || !weight) return "--";
  const heightInM = height / 100;
  return (weight / (heightInM * heightInM)).toFixed(1);
}

function getEventIcon(type) {
  switch (type.toLowerCase()) {
    case "bệnh":
      return <FaStethoscope />;
    case "chấn thương":
      return <FaBandAid />;
    case "phẫu thuật":
      return <FaProcedures />;
    default:
      return <i className="fas fa-notes-medical"></i>;
  }
}

export default MedicalRecord;
