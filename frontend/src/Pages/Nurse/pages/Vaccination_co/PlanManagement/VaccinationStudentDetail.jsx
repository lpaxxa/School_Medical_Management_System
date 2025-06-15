import React, { useState } from 'react';
import './VaccinationStudentDetail.css';

const VaccinationStudentDetail = ({ student, onBack }) => {
  const [activeTab, setActiveTab] = useState('personal');
  
  // Hàm tính tuổi từ ngày sinh
  const calculateAge = (dateOfBirth) => {
    try {
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      
      if (isNaN(birthDate.getTime())) {
        return "N/A";
      }
      
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    } catch (error) {
      console.error("Lỗi khi tính tuổi:", error);
      return "N/A";
    }
  };

  // Xử lý hiển thị ngày tháng
  const formatDate = (dateString) => {
    try {
      if (!dateString) return "Chưa cập nhật";
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Ngày không hợp lệ";
      return date.toLocaleDateString('vi-VN');
    } catch (error) {
      console.error("Lỗi khi định dạng ngày:", error);
      return "Chưa cập nhật";
    }
  };
    // Dữ liệu an toàn
  const safeStudent = {
    id: student?.id || "Không có ID",
    name: student?.name || "Không có tên",
    class: student?.class || "Chưa phân lớp",
    homeRoomTeacher: student?.homeRoomTeacher || "Chưa cập nhật",
    dateOfBirth: student?.dateOfBirth,
    gender: student?.gender || "Chưa cập nhật",
    bloodType: student?.bloodType || "Chưa cập nhật",
    status: student?.status || "Chưa cập nhật",
    imageUrl: student?.imageUrl || "https://via.placeholder.com/150",
    emergencyContact: student?.emergencyContact || {
      parentName: "Chưa cập nhật",
      phone: "Chưa cập nhật"
    },
    healthIndices: student?.healthIndices || {
      height: "Chưa cập nhật",
      weight: "Chưa cập nhật",
      bmi: "Chưa cập nhật",
      vision: "Chưa cập nhật",
      hearing: "Chưa cập nhật",
      bloodPressure: "Chưa cập nhật"
    },
    medicalHistory: student?.medicalHistory || {
      allergies: "Không có thông tin",
      chronicDiseases: "Không có thông tin",
      medicalHistory: "Không có thông tin"
    },
    notes: student?.notes || [],
    vaccinationHistory: student?.vaccinationHistory || [],
    upcomingVaccinations: student?.upcomingVaccinations || []
  };
  
  return (
    <div className="student-detail-container">
      <div className="detail-header">
        <button onClick={onBack} className="back-button">
          <i className="fas fa-arrow-left"></i>
          Quay lại danh sách
        </button>
      </div>
      
      <div className="student-profile-header">
        <div className="student-avatar">
          <img src={safeStudent.imageUrl || "https://via.placeholder.com/150"} alt={safeStudent.name} />
        </div>
        <div className="student-basic-info">
          <h2>{safeStudent.name}</h2>
          <div className="info-badges">
            <span className="badge badge-id">
              <i className="fas fa-id-card"></i> {safeStudent.id}
            </span>
            <span className="badge badge-class">
              <i className="fas fa-school"></i> {safeStudent.class}
            </span>
            <span className="badge badge-blood">
              <i className="fas fa-tint"></i> {safeStudent.bloodType}
            </span>
            <span className={`badge badge-status ${safeStudent.status === 'Đã hoàn thành' ? 'status-complete' : 'status-incomplete'}`}>
              {safeStudent.status}
            </span>
          </div>
        </div>
      </div>
        <div className="detail-tabs">
        <button 
          className={`tab-button ${activeTab === 'personal' ? 'active' : ''}`}
          onClick={() => setActiveTab('personal')}
        >
          <i className="fas fa-user"></i>
          Thông tin cá nhân
        </button>
        <button 
          className={`tab-button ${activeTab === 'medical' ? 'active' : ''}`}
          onClick={() => setActiveTab('medical')}
        >
          <i className="fas fa-notes-medical"></i>
          Tiền sử bệnh
        </button>
        <button 
          className={`tab-button ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          <i className="fas fa-clipboard"></i>
          Ghi chú
        </button>
        <button 
          className={`tab-button ${activeTab === 'vaccination' ? 'active' : ''}`}
          onClick={() => setActiveTab('vaccination')}
        >
          <i className="fas fa-syringe"></i>
          Lịch sử tiêm chủng
        </button>
      </div>
      
      <div className="tab-content">
        {/* Tab Thông tin cá nhân */}
        {activeTab === 'personal' && (
          <div className="personal-info-content">
            <div className="info-section">
              <h3>Thông tin cơ bản</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Họ và tên</span>
                  <span className="info-value">{safeStudent.name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Mã học sinh</span>
                  <span className="info-value">{safeStudent.id}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Lớp</span>
                  <span className="info-value">{safeStudent.class}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Giáo viên chủ nhiệm</span>
                  <span className="info-value">{safeStudent.homeRoomTeacher}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Giới tính</span>
                  <span className="info-value">{safeStudent.gender}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Ngày sinh</span>
                  <span className="info-value">{formatDate(safeStudent.dateOfBirth)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Tuổi</span>
                  <span className="info-value">{calculateAge(safeStudent.dateOfBirth)} tuổi</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Nhóm máu</span>
                  <span className="info-value">{safeStudent.bloodType}</span>
                </div>
              </div>
            </div>
            
            <div className="info-section">
              <h3>Thông tin liên hệ khẩn cấp</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Họ tên phụ huynh</span>
                  <span className="info-value">{safeStudent.emergencyContact.parentName}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Số điện thoại</span>
                  <span className="info-value">{safeStudent.emergencyContact.phone}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Tab Tiền sử bệnh */}
        {activeTab === 'medical' && (
          <div className="medical-history-content">
            <div className="medical-section">
              <h3>Dị ứng</h3>
              <div className="medical-text">
                {safeStudent.medicalHistory.allergies || "Không có dị ứng"}
              </div>
            </div>
            
            <div className="medical-section">
              <h3>Bệnh mãn tính</h3>
              <div className="medical-text">
                {safeStudent.medicalHistory.chronicDiseases || "Không có bệnh mãn tính"}
              </div>
            </div>
            
            <div className="medical-section">
              <h3>Tiền sử y tế</h3>
              <div className="medical-text">
                {safeStudent.medicalHistory.medicalHistory || "Không có tiền sử y tế đáng chú ý"}
              </div>
            </div>
          </div>
        )}
        
        {/* Tab Ghi chú */}
        {activeTab === 'notes' && (
          <div className="notes-content">
            {safeStudent.notes && safeStudent.notes.length > 0 ? (
              <div className="notes-list">
                {safeStudent.notes.slice().reverse().map((note) => (
                  <div key={note.id} className="note-item">
                    <div className="note-header">
                      <div className="note-author">{note.author}</div>
                      <div className="note-date">{formatDate(note.date)}</div>
                    </div>
                    <div className="note-content">{note.content}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-notes">
                <i className="fas fa-clipboard"></i>
                <p>Chưa có ghi chú nào cho học sinh này.</p>
              </div>
            )}
          </div>
        )}
          {/* Tab Lịch sử tiêm chủng */}
        {activeTab === 'vaccination' && (
          <div className="vaccination-history-content">
            <div className="vaccination-section">
              <h3>Lịch sử tiêm chủng</h3>
              
              {safeStudent.vaccinationHistory.length > 0 ? (
                <table className="vaccination-history-table">
                  <thead>
                    <tr>
                      <th>Vaccine</th>
                      <th>Ngày tiêm</th>
                      <th>Địa điểm</th>
                      <th>Kết quả</th>
                    </tr>
                  </thead>
                  <tbody>
                    {safeStudent.vaccinationHistory.map((record, index) => (
                      <tr key={index}>
                        <td>{record.vaccine}</td>
                        <td>{formatDate(record.date)}</td>
                        <td>{record.location || "Chưa cập nhật"}</td>
                        <td>{record.result || "Chưa cập nhật"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="no-records">
                  <i className="fas fa-syringe"></i>
                  <p>Chưa có dữ liệu tiêm chủng nào được ghi nhận.</p>
                </div>
              )}
            </div>
            
            <div className="vaccination-section">
              <h3>Lịch tiêm chủng dự kiến</h3>
              
              {safeStudent.upcomingVaccinations.length > 0 ? (
                <table className="vaccination-upcoming-table">
                  <thead>
                    <tr>
                      <th>Vaccine</th>
                      <th>Ngày dự kiến</th>
                      <th>Địa điểm</th>
                      <th>Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {safeStudent.upcomingVaccinations.map((record, index) => (
                      <tr key={index}>
                        <td>{record.vaccine}</td>
                        <td>{formatDate(record.plannedDate)}</td>
                        <td>{record.location || "Chưa cập nhật"}</td>
                        <td>{record.notes || ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="no-records">
                  <i className="fas fa-calendar-day"></i>
                  <p>Không có kế hoạch tiêm chủng nào sắp tới.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VaccinationStudentDetail;
