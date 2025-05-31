import React, { useState, useEffect } from 'react';
import vaccinationService from '../../../../../services/vaccinationService';

const StudentVaccinationRecords = ({ refreshData }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [studentRecords, setStudentRecords] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [vaccines, setVaccines] = useState([]);
  
  // Filters
  const [filters, setFilters] = useState({
    keyword: '',
    className: '',
    grade: ''
  });
  
  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch students and vaccines in parallel
        const [studentsData, vaccinesData] = await Promise.all([
          vaccinationService.getAllStudents(),
          vaccinationService.getAllVaccines()
        ]);
        
        setStudents(studentsData);
        setVaccines(vaccinesData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };
  
  // Apply filters
  const handleApplyFilters = async () => {
    try {
      setLoading(true);
      const filteredStudents = await vaccinationService.searchStudents(filters);
      setStudents(filteredStudents);
    } catch (error) {
      console.error("Failed to apply filters:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Reset filters
  const handleResetFilters = async () => {
    setFilters({
      keyword: '',
      className: '',
      grade: ''
    });
    
    try {
      setLoading(true);
      const allStudents = await vaccinationService.getAllStudents();
      setStudents(allStudents);
    } catch (error) {
      console.error("Failed to reset filters:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // View student vaccination records
  const handleViewRecords = async (student) => {
    try {
      setLoading(true);
      setSelectedStudent(student);
      
      const records = await vaccinationService.getStudentVaccinationHistory(student.id);
      setStudentRecords(records);
      setShowModal(true);
    } catch (error) {
      console.error("Failed to fetch student vaccination history:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Get vaccination status for a student
  const getVaccinationStatus = (student) => {
    // This is a simplified example - in a real app, you would fetch actual data
    // For now, we'll return random values
    const randomStatus = Math.floor(Math.random() * 3); // 0, 1, or 2
    
    switch (randomStatus) {
      case 0:
        return { status: 'complete', label: 'Đã hoàn thành' };
      case 1:
        return { status: 'partial', label: 'Chưa hoàn thành' };
      case 2:
        return { status: 'none', label: 'Chưa tiêm chủng' };
      default:
        return { status: 'unknown', label: 'Không xác định' };
    }
  };
  
  return (
    <div className="student-vaccination-records">
      <div className="section-header">
        <h2>Hồ sơ Tiêm chủng Học sinh</h2>
      </div>
      
      {/* Filters */}
      <div className="filters-section">
        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="keyword">Tìm kiếm:</label>
            <input
              type="text"
              id="keyword"
              name="keyword"
              placeholder="Nhập mã hoặc tên học sinh..."
              value={filters.keyword}
              onChange={handleFilterChange}
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="className">Lớp:</label>
            <input
              type="text"
              id="className"
              name="className"
              placeholder="Ví dụ: 10A1"
              value={filters.className}
              onChange={handleFilterChange}
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="grade">Khối:</label>
            <select
              id="grade"
              name="grade"
              value={filters.grade}
              onChange={handleFilterChange}
            >
              <option value="">Tất cả khối</option>
              <option value="6">Khối 6</option>
              <option value="7">Khối 7</option>
              <option value="8">Khối 8</option>
              <option value="9">Khối 9</option>
              <option value="10">Khối 10</option>
              <option value="11">Khối 11</option>
              <option value="12">Khối 12</option>
            </select>
          </div>
          
          <div className="filter-actions">
            <button className="btn filter-btn" onClick={handleApplyFilters}>
              <i className="fas fa-filter"></i> Lọc
            </button>
            <button className="btn reset-btn" onClick={handleResetFilters}>
              <i className="fas fa-undo"></i> Đặt lại
            </button>
          </div>
        </div>
      </div>
      
      {/* Students Table */}
      {loading && !showModal ? (
        <div className="loading-spinner centered">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table student-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Mã học sinh</th>
                <th>Họ và tên</th>
                <th>Lớp</th>
                <th>Khối</th>
                <th>Ngày sinh</th>
                <th>Trạng thái tiêm chủng</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? (
                students.map((student, index) => {
                  const vaccinationStatus = getVaccinationStatus(student);
                  
                  return (
                    <tr key={student.id}>
                      <td>{index + 1}</td>
                      <td>{student.studentCode}</td>
                      <td>{student.name}</td>
                      <td>{student.className}</td>
                      <td>{student.grade}</td>
                      <td>{new Date(student.dateOfBirth).toLocaleDateString('vi-VN')}</td>
                      <td>
                        <span className={`status-badge ${vaccinationStatus.status}`}>
                          {vaccinationStatus.label}
                        </span>
                      </td>
                      <td className="action-cell">
                        <button 
                          className="btn-icon btn-view" 
                          onClick={() => handleViewRecords(student)}
                          title="Xem hồ sơ tiêm chủng"
                        >
                          <i className="fas fa-file-medical"></i> Xem hồ sơ
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="empty-table">Không tìm thấy học sinh nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Modal for Vaccination Records */}
      {showModal && selectedStudent && (
        <div className="modal-backdrop">
          <div className="modal-content large-modal">
            <div className="modal-header">
              <h3>Hồ sơ tiêm chủng - {selectedStudent.name}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              {/* Student info */}
              <div className="student-info-container">
                <div className="info-row">
                  <div className="info-item">
                    <span className="info-label">Mã học sinh:</span>
                    <span className="info-value">{selectedStudent.studentCode}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Họ và tên:</span>
                    <span className="info-value">{selectedStudent.name}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Lớp:</span>
                    <span className="info-value">{selectedStudent.className}</span>
                  </div>
                </div>
                <div className="info-row">
                  <div className="info-item">
                    <span className="info-label">Ngày sinh:</span>
                    <span className="info-value">
                      {new Date(selectedStudent.dateOfBirth).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Giới tính:</span>
                    <span className="info-value">{selectedStudent.gender === 'M' ? 'Nam' : 'Nữ'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Số điện thoại phụ huynh:</span>
                    <span className="info-value">{selectedStudent.parentPhone || 'Không có'}</span>
                  </div>
                </div>
              </div>

              {/* Vaccination summary */}
              <div className="records-summary">
                <h4>Tổng quan tiêm chủng</h4>
                <div className="summary-stats">
                  <div className="summary-stat">
                    <div className="stat-number">{studentRecords.length || 0}</div>
                    <div className="stat-label">Tổng số mũi tiêm</div>
                  </div>
                  <div className="summary-stat">
                    <div className="stat-number">
                      {studentRecords.filter(record => record.status === 'Hoàn thành').length || 0}
                    </div>
                    <div className="stat-label">Đã tiêm</div>
                  </div>
                  <div className="summary-stat">
                    <div className="stat-number">
                      {studentRecords.filter(record => record.status === 'Dự kiến').length || 0}
                    </div>
                    <div className="stat-label">Dự kiến</div>
                  </div>
                </div>
              </div>

              {/* Records table */}
              <div className="vaccination-records-table">
                <h4>Chi tiết tiêm chủng</h4>
                {studentRecords.length > 0 ? (
                  <table className="records-table">
                    <thead>
                      <tr>
                        <th>STT</th>
                        <th>Vaccine</th>
                        <th>Mũi số</th>
                        <th>Ngày tiêm</th>
                        <th>Trạng thái</th>
                        <th>Người tiêm</th>
                        <th>Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentRecords.map((record, index) => (
                        <tr key={record.id} className={`status-${record.status.toLowerCase().replace(' ', '-')}`}>
                          <td>{index + 1}</td>
                          <td>
                            {record.vaccineName}
                            <div className="vaccine-code">{record.vaccineCode}</div>
                          </td>
                          <td>{record.dose}</td>
                          <td>
                            {record.dateAdministered 
                              ? new Date(record.dateAdministered).toLocaleDateString('vi-VN') 
                              : 'Chưa tiêm'}
                          </td>
                          <td>
                            <span className={`status-badge ${record.status.toLowerCase().replace(' ', '-')}`}>
                              {record.status}
                            </span>
                          </td>
                          <td>{record.administrator || '—'}</td>
                          <td>
                            <div className="record-notes">{record.notes || '—'}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="empty-records">Học sinh chưa có bản ghi tiêm chủng nào</div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setShowModal(false)}>
                <i className="fas fa-check"></i> Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentVaccinationRecords;