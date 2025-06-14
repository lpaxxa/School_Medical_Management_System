import React, { useState, useEffect } from 'react';
import { 
  getConsultations, 
  getConsultationTypes, 
  getStudents 
} from '../../../../../services/consultationService';
import './ConsultationList.css';

const ConsultationList = ({ onConsultationSelect, onCreateNew, initialFilter = null, showFilters, isDarkMode }) => {
  const [consultations, setConsultations] = useState([]);
  const [consultationTypes, setConsultationTypes] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    type: '',
    status: initialFilter || '',
    studentId: '',
    sendDateFrom: '',
    sendDateTo: '',
    responseDeadlineFrom: '',
    responseDeadlineTo: ''
  });
  
  // Fetch consultations and filter options when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [consultationsData, typesData, studentsData] = await Promise.all([
          initialFilter ? getConsultations({ status: initialFilter }) : getConsultations(),
          getConsultationTypes(),
          getStudents()
        ]);
        
        setConsultations(consultationsData);
        setConsultationTypes(typesData);
        setStudents(studentsData);
        setError(null);
      } catch (err) {
        console.error("Error fetching consultation data:", err);
        setError("Không thể tải danh sách tư vấn. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [initialFilter]);
  
  // Apply filters when filter values change
  const handleFilterChange = async (e) => {
    const { name, value } = e.target;
    const updatedFilters = { ...filters, [name]: value };
    setFilters(updatedFilters);
    
    try {
      setLoading(true);
      const filteredConsultations = await getConsultations(updatedFilters);
      setConsultations(filteredConsultations);
    } catch (err) {
      console.error("Error applying filters:", err);
      setError("Không thể áp dụng bộ lọc. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };
  
  // Reset all filters
  const resetFilters = async () => {
    setFilters({
      type: '',
      status: '',
      studentId: '',
      sendDateFrom: '',
      sendDateTo: '',
      responseDeadlineFrom: '',
      responseDeadlineTo: ''
    });
    
    try {
      setLoading(true);
      const consultationsData = await getConsultations();
      setConsultations(consultationsData);
    } catch (err) {
      console.error("Error resetting filters:", err);
      setError("Không thể đặt lại bộ lọc. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };
  
  // Format date to display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };
  
  // Check if a consultation is urgent (deadline within 2 days)
  const isUrgent = (consultation) => {
    if (!consultation.responseDeadline || consultation.responses.length > 0) return false;
    
    const now = new Date();
    const deadline = new Date(consultation.responseDeadline);
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(now.getDate() + 2);
    
    return deadline <= twoDaysFromNow && deadline >= now;
  };
  
  // Check if a consultation is overdue
  const isOverdue = (consultation) => {
    if (!consultation.responseDeadline || consultation.responses.length > 0) return false;
    
    const now = new Date();
    const deadline = new Date(consultation.responseDeadline);
    
    return deadline < now;
  };
  
  // Get status badge class
  const getStatusBadgeClass = (consultation) => {
    if (consultation.responses.length > 0) return "status-replied";
    if (isOverdue(consultation)) return "status-overdue";
    if (isUrgent(consultation)) return "status-urgent";
    if (consultation.isRead) return "status-read";
    return "status-unread";
  };
  
  // Get status text
  const getStatusText = (consultation) => {
    if (consultation.responses.length > 0) return "Đã phản hồi";
    if (isOverdue(consultation)) return "Quá hạn phản hồi";
    if (isUrgent(consultation)) return "Cần phản hồi gấp";
    if (consultation.isRead) return "Đã đọc";
    return "Chưa đọc";
  };
  
  if (loading && consultations.length === 0) {
    return (
      <div className="consultation-list">
        <div className="list-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Đang tải danh sách tư vấn...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="consultation-list">
        <div className="list-error">
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="consultation-list">
      <div className="list-header">
        <h2>Danh sách tư vấn</h2>
        <button className="btn btn-primary create-btn" onClick={onCreateNew}>
          <i className="fas fa-plus-circle"></i>
          Tạo tư vấn mới
        </button>
      </div>

      {/* Filters section */}
      <div className={`filters-container ${showFilters ? 'show' : ''}`}>
        <div className="filters-form">
          <div className="filter-group">
            <label htmlFor="type">Loại tư vấn</label>
            <select
              id="type"
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
            >
              <option value="">Tất cả loại</option>
              {consultationTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="status">Trạng thái</label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="unread">Chưa đọc</option>
              <option value="read">Đã đọc</option>
              <option value="replied">Đã phản hồi</option>
              <option value="urgent">Cần phản hồi gấp</option>
              <option value="overdue">Quá hạn</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="studentId">Học sinh</label>
            <select
              id="studentId"
              name="studentId"
              value={filters.studentId}
              onChange={handleFilterChange}
            >
              <option value="">Tất cả học sinh</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.name} - Lớp {student.class}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group date-range">
            <label>Ngày gửi</label>
            <div className="date-inputs">
              <input
                type="date"
                name="sendDateFrom"
                value={filters.sendDateFrom}
                onChange={handleFilterChange}
                placeholder="Từ ngày"
              />
              <span>đến</span>
              <input
                type="date"
                name="sendDateTo"
                value={filters.sendDateTo}
                onChange={handleFilterChange}
                placeholder="Đến ngày"
              />
            </div>
          </div>

          <div className="filter-buttons">
            <button 
              className="btn btn-secondary" 
              onClick={resetFilters}
            >
              Đặt lại
            </button>
          </div>
        </div>
      </div>

      {/* Consultations list */}
      {consultations.length === 0 ? (
        <div className="empty-list">
          <i className="fas fa-inbox"></i>
          <p>Không có tư vấn nào phù hợp với bộ lọc hiện tại</p>
          {Object.values(filters).some(v => v !== '') && (
            <button 
              className="btn btn-secondary" 
              onClick={resetFilters}
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      ) : (
        <div className="consultations-table-container">
          <table className="consultations-table">
            <thead>
              <tr>
                <th>Trạng thái</th>
                <th>Tiêu đề</th>
                <th>Loại</th>
                <th>Học sinh</th>
                <th>Thời gian gửi</th>
                <th>Hạn phản hồi</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {consultations.map(consultation => (
                <tr 
                  key={consultation.id} 
                  className={consultation.isRead ? '' : 'unread-row'}
                  onClick={() => onConsultationSelect(consultation)}
                >
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(consultation)}`}>
                      {getStatusText(consultation)}
                    </span>
                  </td>
                  <td className="title-cell">
                    <div className="consultation-title">
                      {consultation.title}
                      {!consultation.isRead && <span className="unread-indicator"></span>}
                    </div>
                  </td>
                  <td>{consultation.type}</td>
                  <td>
                    <div className="student-info">
                      <span>{consultation.student.name}</span>
                      <small>Lớp {consultation.student.class}</small>
                    </div>
                  </td>
                  <td>{formatDate(consultation.sendDate)}</td>
                  <td>
                    {consultation.responseDeadline ? (
                      <span className={
                        isOverdue(consultation) ? 'overdue-date' : 
                        isUrgent(consultation) ? 'urgent-date' : ''
                      }>
                        {formatDate(consultation.responseDeadline)}
                      </span>
                    ) : (
                      <span className="no-deadline">Không có</span>
                    )}
                  </td>
                  <td>
                    <button 
                      className="view-btn"
                      aria-label="Xem chi tiết"
                      onClick={(e) => {
                        e.stopPropagation();
                        onConsultationSelect(consultation);
                      }}
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ConsultationList;
