import React, { useState, useEffect } from 'react';
import './StudentDetail.css'; // Đảm bảo import file CSS đúng đường dẫn
import { getStudentHealthProfile } from '../../../../../services/studentRecordsService';

const StudentDetail = ({ student, onBack, onEdit }) => {
  const [healthProfile, setHealthProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Fetch student health profile on component mount
  useEffect(() => {
    const fetchHealthProfile = async () => {
      if (!student) return;
      
      try {
        setLoading(true);
        // Sử dụng try-catch để bắt tất cả lỗi tiềm ẩn
        
        // Log ra thông tin student để debug
        console.log('Student object from props:', student);
        
        // Kiểm tra healthProfileId tồn tại không 
        const profileId = student.healthProfileId || student.id;
        
        if (!profileId) {
          console.warn('Không tìm thấy ID hồ sơ y tế');
          setError('Học sinh này chưa có hồ sơ y tế');
          setHealthProfile({});
          setLoading(false);
          return;
        }
        
        console.log('Sử dụng health profile ID:', profileId);
        
        try {
          const profileData = await getStudentHealthProfile(profileId);
          console.log('Received health profile data:', profileData);
          
          if (profileData && Object.keys(profileData).length > 0) {
            setHealthProfile(profileData);
            setError(null);
          } else {
            setHealthProfile({});
            setError('Không tìm thấy hồ sơ y tế cho học sinh này');
          }
        } catch (apiError) {
          console.error('API error:', apiError);
          setHealthProfile({});
          setError(`Lỗi khi tải dữ liệu: ${apiError.message}`);
        }
      } catch (err) {
        console.error('General error in health profile fetch:', err);
        setError('Có lỗi xảy ra khi tải thông tin y tế');
        setHealthProfile({});
      } finally {
        setLoading(false);
      }
    };
    
    fetchHealthProfile();
  }, [student]);

  // Để debug trong render
  console.log('Current health profile state:', healthProfile);

  if (!student) {
    return (
      <div className="student-detail-container">
        <div className="error-message">
          <p>Không có thông tin học sinh để hiển thị</p>
          <button onClick={onBack} className="back-button">
            <i className="fas fa-arrow-left"></i> Quay lại
          </button>
        </div>
      </div>
    );
  }
  
  // Thêm xử lý an toàn để tránh lỗi undefined
  const healthData = healthProfile || {};

  // Xác định màu sắc cho BMI
  const getBmiColor = (bmi) => {
    if (!bmi || isNaN(bmi)) return '#777';
    if (bmi < 16) return '#2196F3'; // Thiếu cân nghiêm trọng
    if (bmi < 18.5) return '#4CAF50'; // Thiếu cân
    if (bmi < 25) return '#4CAF50'; // Bình thường
    if (bmi < 30) return '#FF9800'; // Thừa cân
    return '#F44336'; // Béo phì
  };

  // Xác định trạng thái BMI
  const getBmiStatus = (bmi) => {
    if (!bmi || isNaN(bmi)) return 'Chưa có dữ liệu';
    if (bmi < 16) return 'Thiếu cân nghiêm trọng';
    if (bmi < 18.5) return 'Thiếu cân';
    if (bmi < 25) return 'Bình thường';
    if (bmi < 30) return 'Thừa cân';
    return 'Béo phì';
  };

  const bmiColor = getBmiColor(healthData.bmi);
  const bmiStatus = getBmiStatus(healthData.bmi);

  // Thay thế URL placeholder bằng URL local hoặc base64 image
  const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2U5ZWNlZiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjI0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmaWxsPSIjNmM3NTdkIj5Iw6xuaCDhuqNuaDwvdGV4dD48L3N2Zz4=';

  return (
    <div className="student-detail-container">
      <div className="detail-header">
        <button onClick={onBack} className="back-button">
          <i className="fas fa-arrow-left"></i> Quay lại
        </button>
        <h2>Thông tin chi tiết học sinh</h2>
        <button onClick={onEdit} className="edit-button">
          <i className="fas fa-edit"></i> Chỉnh sửa
        </button>
      </div>
      
      <div className="detail-content">
        <div className="student-info-section">
          <div className="student-avatar">
            <img 
              src={student.imageUrl || defaultAvatar} 
              alt={student.fullName || student.name}
              className="student-image"
              onError={(e) => {
                e.target.onerror = null; 
                e.target.src = defaultAvatar;
              }}
            />
          </div>
          <div className="info-group basic-info">
            <h3>Thông tin cơ bản</h3>
            <p><strong>Họ và tên:</strong> {student.fullName || student.name}</p>
            <p><strong>Mã học sinh:</strong> {student.studentId}</p>
            <p><strong>Lớp:</strong> {student.className || student.class}</p>
            <p><strong>Ngày sinh:</strong> {new Date(student.dateOfBirth).toLocaleDateString('vi-VN')}</p>
            <p><strong>Giới tính:</strong> {student.gender}</p>
          </div>
        </div>
        
        <div className="health-info-section">
          <h3>Hồ sơ y tế</h3>
          
          {loading ? (
            <div className="loading-message">
              <div className="loading-spinner"></div>
              <p>Đang tải thông tin y tế...</p>
            </div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : (
            <>
              <div className="info-group basic-metrics">
                <h4>Chỉ số cơ bản</h4>
                <div className="metrics-container">
                  <div className="metric-item">
                    <span className="metric-icon">
                      <i className="fas fa-ruler-vertical" style={{ color: '#2196F3' }}></i>
                    </span>
                    <div className="metric-content">
                      <span className="metric-label">Chiều cao</span>
                      <span className="metric-value">{healthData.height || 'N/A'}</span>
                      <span className="metric-unit">cm</span>
                    </div>
                  </div>
                  
                  <div className="metric-item">
                    <span className="metric-icon">
                      <i className="fas fa-weight" style={{ color: '#4CAF50' }}></i>
                    </span>
                    <div className="metric-content">
                      <span className="metric-label">Cân nặng</span>
                      <span className="metric-value">{healthData.weight || 'N/A'}</span>
                      <span className="metric-unit">kg</span>
                    </div>
                  </div>
                  
                  <div className="metric-item">
                    <span className="metric-icon">
                      <i className="fas fa-calculator" style={{ color: bmiColor }}></i>
                    </span>
                    <div className="metric-content">
                      <span className="metric-label">BMI</span>
                      <span className="metric-value">{healthData.bmi || 'N/A'}</span>
                      <span className="metric-status" style={{ color: bmiColor }}>{bmiStatus}</span>
                    </div>
                  </div>
                  
                  <div className="metric-item">
                    <span className="metric-icon">
                      <i className="fas fa-tint" style={{ color: '#F44336' }}></i>
                    </span>
                    <div className="metric-content">
                      <span className="metric-label">Nhóm máu</span>
                      <span className="metric-value blood-type">{healthData.bloodType || 'Chưa xác định'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="info-group vision-hearing">
                <h4>Thị lực & Thính lực</h4>
                <div className="metrics-container">
                  <div className="metric-item">
                    <span className="metric-icon">
                      <i className="fas fa-eye" style={{ color: '#9C27B0' }}></i>
                    </span>
                    <div className="metric-content">
                      <span className="metric-label">Thị lực trái</span>
                      <span className="metric-value">{healthData.visionLeft || 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div className="metric-item">
                    <span className="metric-icon">
                      <i className="fas fa-eye" style={{ color: '#9C27B0' }}></i>
                    </span>
                    <div className="metric-content">
                      <span className="metric-label">Thị lực phải</span>
                      <span className="metric-value">{healthData.visionRight || 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div className="metric-item">
                    <span className="metric-icon">
                      <i className="fas fa-deaf" style={{ color: '#607D8B' }}></i>
                    </span>
                    <div className="metric-content">
                      <span className="metric-label">Thính lực</span>
                      <span className="metric-value">{healthData.hearingStatus || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="info-group health-history">
                <h4>Tiền sử sức khỏe</h4>
                <div className="health-history-item">
                  <div className="health-history-icon">
                    <i className="fas fa-allergies" style={{ color: '#f44336' }}></i>
                  </div>
                  <div className="health-history-content">
                    <p className="health-history-label">Dị ứng:</p>
                    {/* Hiển thị thông tin dị ứng, đảm bảo hiển thị đúng */}
                    <p className="health-history-value">{healthData.allergies || 'Không có'}</p>
                  </div>
                </div>
                
                <div className="health-history-item">
                  <div className="health-history-icon">
                    <i className="fas fa-disease" style={{ color: '#ff9800' }}></i>
                  </div>
                  <div className="health-history-content">
                    <p className="health-history-label">Bệnh mãn tính:</p>
                    {/* Sử dụng đúng tên trường từ API response */}
                    <p className="health-history-value">{healthData.chronicDiseases || 'Không có'}</p>
                  </div>
                </div>
                
                <div className="health-history-item">
                  <div className="health-history-icon">
                    <i className="fas fa-utensils" style={{ color: '#2196F3' }}></i>
                  </div>
                  <div className="health-history-content">
                    <p className="health-history-label">Hạn chế ăn uống:</p>
                    <p className="health-history-value">{healthData.dietaryRestrictions || 'Không có'}</p>
                  </div>
                </div>
                
                <div className="health-history-item">
                  <div className="health-history-icon">
                    <i className="fas fa-notes-medical" style={{ color: '#9c27b0' }}></i>
                  </div>
                  <div className="health-history-content">
                    <p className="health-history-label">Nhu cầu đặc biệt:</p>
                    <p className="health-history-value">{healthData.specialNeeds || 'Không có'}</p>
                  </div>
                </div>
              </div>

              <div className="info-group vaccination">
                <h4>Thông tin tiêm chủng</h4>
                <div className="vaccination-info">
                  <div className="vaccination-icon">
                    <i className="fas fa-syringe" style={{ color: '#4caf50' }}></i>
                  </div>
                  <div className="vaccination-content">
                    <p>{healthData.immunizationStatus || 'Chưa có thông tin tiêm chủng'}</p>
                    {healthData.lastPhysicalExamDate && (
                      <p className="last-exam-date">
                        <i className="far fa-calendar-alt"></i> 
                        Khám sức khỏe gần nhất: {new Date(healthData.lastPhysicalExamDate).toLocaleDateString('vi-VN')}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="info-group emergency-contact">
                <h4>Thông tin liên hệ khẩn cấp</h4>
                <div className="emergency-info">
                  <div className="emergency-icon">
                    <i className="fas fa-phone-alt" style={{ color: '#f44336' }}></i>
                  </div>
                  <div className="emergency-content">
                    <p>{healthData.emergencyContactInfo || 'Chưa có thông tin'}</p>
                  </div>
                </div>
                
                {healthData.lastUpdated && (
                  <p className="last-updated">
                    <i className="far fa-clock"></i> 
                    Cập nhật lần cuối: {new Date(healthData.lastUpdated).toLocaleString('vi-VN')}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;
