import React, { useState, useEffect } from 'react';
import './MedicationHistory.css';
import MedicationHistoryDetail from './MedicationHistoryDetail';

const MedicationHistory = () => {
  const [medicationHistory, setMedicationHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStudent, setFilterStudent] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  // Sử dụng dữ liệu mẫu thay vì gọi API
  useEffect(() => {
    const mockData = [
            {
              id: 'med001',
              studentId: 'HS001',
              studentName: 'Nguyễn Văn A',
              class: '10A1',
              medicineName: 'Paracetamol',
              dosage: '500mg',
              administrationTime: '2025-06-15T08:30:00',
              administeredBy: 'Trần Thị Y Tá',
              status: 'completed',
              notes: 'Học sinh có biểu hiện sốt nhẹ'
            },
            {
              id: 'med002',
              studentId: 'HS001',
              studentName: 'Nguyễn Văn A',
              class: '10A1',
              medicineName: 'Paracetamol',
              dosage: '500mg',
              administrationTime: '2025-06-15T12:30:00',
              administeredBy: 'Trần Thị Y Tá',
              status: 'completed',
              notes: ''
            },
            {
              id: 'med003',
              studentId: 'HS001',
              studentName: 'Nguyễn Văn A',
              class: '10A1',
              medicineName: 'Paracetamol',
              dosage: '500mg',
              administrationTime: '2025-06-15T16:30:00',
              administeredBy: 'Lê Thị Y Tá',
              status: 'completed',
              notes: 'Nhiệt độ đã giảm'
            },
            {
              id: 'med004',
              studentId: 'HS002',
              studentName: 'Trần Thị C',
              class: '11A2',
              medicineName: 'Vitamin C',
              dosage: '1 viên',
              administrationTime: '2025-06-15T12:00:00',
              administeredBy: 'Trần Thị Y Tá',
              status: 'completed',
              notes: ''
            },
            {
              id: 'med005',
              studentId: 'HS003',
              studentName: 'Lê Văn E',
              class: '9B3',
              medicineName: 'Probiotics',
              dosage: '1 gói',
              administrationTime: '2025-06-15T08:00:00',
              administeredBy: 'Nguyễn Văn Y Tá',
              status: 'completed',
              notes: 'Học sinh có vấn đề về tiêu hóa'
            },
            {
              id: 'med006',
              studentId: 'HS004',
              studentName: 'Phạm Thị G',
              class: '10A3',
              medicineName: 'Cetirizine',
              dosage: '10mg',
              administrationTime: '2025-06-15T20:00:00',
              administeredBy: 'Lê Thị Y Tá',
              status: 'completed',
              notes: 'Điều trị dị ứng theo đơn thuốc'
            },
            {
              id: 'med007',
              studentId: 'HS001',
              studentName: 'Nguyễn Văn A',
              class: '10A1',
              medicineName: 'Paracetamol',
              dosage: '500mg',
              administrationTime: '2025-06-16T08:30:00',
              administeredBy: 'Trần Thị Y Tá',              status: 'scheduled',
              notes: 'Liều cuối cùng'
            }
          ];
          
    // Set mock data to state
    setLoading(true);
    setMedicationHistory(mockData);
    setLoading(false);
  }, []);

  // View medication detail
  const handleViewDetail = (medication) => {
    setSelectedMedication(medication);
    setShowDetail(true);
  };

  // Close detail view
  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedMedication(null);
  };

  // Format administration time
  const formatDate = (dateTimeString) => {
    if (!dateTimeString) return '';
    
    const date = new Date(dateTimeString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Filter medication history
  const filteredMedicationHistory = medicationHistory.filter(med => {
    // Filter by search term (student name, medication name)
    if (searchTerm && !(
      med.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.medicineName.toLowerCase().includes(searchTerm.toLowerCase())
    )) {
      return false;
    }
    
    // Filter by student ID
    if (filterStudent && !med.studentId.includes(filterStudent)) {
      return false;
    }
    
    // Filter by date range (from)
    if (filterDateFrom) {
      const adminDate = new Date(med.administrationTime);
      const fromDate = new Date(filterDateFrom);
      fromDate.setHours(0, 0, 0, 0);
      
      if (adminDate < fromDate) {
        return false;
      }
    }
    
    // Filter by date range (to)
    if (filterDateTo) {
      const adminDate = new Date(med.administrationTime);
      const toDate = new Date(filterDateTo);
      toDate.setHours(23, 59, 59, 999);
      
      if (adminDate > toDate) {
        return false;
      }
    }
    
    return true;
  });

  return (
    <div className="medication-history-container">
      <div className="history-header">
        <h2>Lịch sử dùng thuốc</h2>
        <div className="search-filter-container">
          <div className="search-box">
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên học sinh, tên thuốc..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-group">
          <label htmlFor="student-filter">Mã học sinh:</label>
          <input
            type="text"
            id="student-filter"
            value={filterStudent}
            onChange={(e) => setFilterStudent(e.target.value)}
            placeholder="Nhập mã học sinh"
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="date-from">Từ ngày:</label>
          <input
            type="date"
            id="date-from"
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="date-to">Đến ngày:</label>
          <input
            type="date"
            id="date-to"
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
            className="filter-input"
          />
        </div>
        
        <button 
          className="btn-reset-filter" 
          onClick={() => {
            setSearchTerm('');
            setFilterStudent('');
            setFilterDateFrom('');
            setFilterDateTo('');
          }}
        >
          <i className="fas fa-redo-alt"></i> Đặt lại
        </button>
      </div>

      {/* Detail view */}
      {showDetail && selectedMedication && (
        <MedicationHistoryDetail 
          medication={selectedMedication} 
          onClose={handleCloseDetail}
        />
      )}

      {/* Display medication history */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="history-table-container">
          {filteredMedicationHistory.length === 0 ? (
            <div className="no-data">Không có dữ liệu lịch sử dùng thuốc</div>
          ) : (
            <table className="history-table">
              <thead>
                <tr>
                  <th>Mã HS</th>
                  <th>Tên học sinh</th>
                  <th>Lớp</th>
                  <th>Tên thuốc</th>
                  <th>Liều lượng</th>
                  <th>Thời gian dùng</th>
                  <th>Người thực hiện</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredMedicationHistory.map(med => (
                  <tr 
                    key={med.id}
                    className={med.status === 'scheduled' ? 'scheduled-row' : ''}
                  >
                    <td>{med.studentId}</td>
                    <td>{med.studentName}</td>
                    <td>{med.class}</td>
                    <td>{med.medicineName}</td>
                    <td>{med.dosage}</td>
                    <td>{formatDate(med.administrationTime)}</td>
                    <td>{med.administeredBy}</td>
                    <td>
                      {med.status === 'completed' ? (
                        <span className="status-badge completed">Đã thực hiện</span>
                      ) : (
                        <span className="status-badge scheduled">Lịch dùng thuốc</span>
                      )}
                    </td>
                    <td>
                      <button 
                        className="btn-view" 
                        onClick={() => handleViewDetail(med)}
                        title="Xem chi tiết"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default MedicationHistory;
