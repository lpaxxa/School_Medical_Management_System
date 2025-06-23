import React, { useState, useEffect } from 'react';
import './MedicationAdministration.css';

const MedicationAdministrationManagement = () => {
  // States
  const [administrationRecords, setAdministrationRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isDetailView, setIsDetailView] = useState(false);
  
  // State cho form thêm/sửa
  const [formData, setFormData] = useState({
    studentId: '',
    studentName: '',
    className: '',
    medicationName: '',
    dosage: '',
    administrationTime: '',
    administeredBy: '',
    remarks: '',
    administrationStatus: 'Đã cho uống' // Default status: Đã cho uống, Đã từ chối, Không có mặt
  });
  
  // State cho bộ lọc
  const [filters, setFilters] = useState({
    studentId: '',
    className: '',
    medicationName: '',
    fromDate: '',
    toDate: '',
    administrationStatus: ''
  });
  
  // Thêm state để theo dõi trạng thái tìm kiếm
  const [searchStatus, setSearchStatus] = useState({
    hasSearched: false,
    resultCount: 0
  });
  
  // State chứa danh sách thuốc đang dùng cho học sinh để chọn
  const [availableMedications, setAvailableMedications] = useState([]);
  
  // Mô phỏng fetch dữ liệu từ API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Mock data - trong thực tế sẽ thay bằng API call
        const mockAdministrationRecords = [
          {
            id: 1,
            studentId: 'SV001',
            studentName: 'Nguyễn Văn A',
            className: '10A1',
            medicationId: 1,
            medicationName: 'Paracetamol',
            dosage: '500mg - 1 viên',
            administrationTime: '2025-06-05T08:30:00',
            administeredBy: 'Y tá Minh',
            remarks: 'Học sinh uống đầy đủ',
            administrationStatus: 'Đã cho uống',
            createdAt: '2025-06-05T08:32:00'
          },
          {
            id: 2,
            studentId: 'SV001',
            studentName: 'Nguyễn Văn A',
            className: '10A1',
            medicationId: 1,
            medicationName: 'Paracetamol',
            dosage: '500mg - 1 viên',
            administrationTime: '2025-06-05T13:30:00',
            administeredBy: 'Y tá Hoa',
            remarks: 'Học sinh uống đầy đủ',
            administrationStatus: 'Đã cho uống',
            createdAt: '2025-06-05T13:35:00'
          },
          {
            id: 3,
            studentId: 'SV002',
            studentName: 'Trần Thị B',
            className: '11A2',
            medicationId: 2,
            medicationName: 'Vitamin C',
            dosage: '1 viên',
            administrationTime: '2025-06-05T08:45:00',
            administeredBy: 'Y tá Minh',
            remarks: 'Học sinh nghỉ học hôm nay',
            administrationStatus: 'Không có mặt',
            createdAt: '2025-06-05T08:50:00'
          }
        ];
        
        // Mock dữ liệu thuốc có sẵn để chọn khi thêm mới
        const mockAvailableMedications = [
          {
            id: 1,
            studentId: 'SV001',
            studentName: 'Nguyễn Văn A',
            medicationName: 'Paracetamol',
            dosage: '500mg - 1 viên',
            frequency: 'Ngày 2 lần sau ăn sáng và trưa'
          },
          {
            id: 2,
            studentId: 'SV002',
            studentName: 'Trần Thị B',
            medicationName: 'Vitamin C',
            dosage: '1 viên',
            frequency: 'Ngày 1 lần sau ăn sáng'
          },
          {
            id: 3,
            studentId: 'SV003',
            studentName: 'Lê Văn C',
            medicationName: 'Thuốc nhỏ mắt',
            dosage: '1 giọt mỗi bên',
            frequency: 'Ngày 3 lần'
          }
        ];
        
        setAdministrationRecords(mockAdministrationRecords);
        setAvailableMedications(mockAvailableMedications);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Xử lý mở modal chi tiết
  const handleViewDetails = (id) => {
    const recordData = administrationRecords.find(record => record.id === id);
    
    if (recordData) {
      setSelectedRecord(recordData);
      setIsDetailView(true);
      setShowModal(true);
    }  };
  
  // Xử lý mở form thêm mới
  const handleAddNew = () => {
    const now = new Date();
    const formattedDateTime = now.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm
    
    setFormData({
      studentId: '',
      studentName: '',
      className: '',
      medicationId: '',
      medicationName: '',
      dosage: '',
      administrationTime: formattedDateTime, // Format YYYY-MM-DDThh:mm
      administeredBy: '',
      remarks: '',
      administrationStatus: 'Đã cho uống',
      createdAt: formattedDateTime // Thêm thời gian tạo
    });
    setSelectedRecord(null);
    setIsDetailView(false);
    setShowModal(true);
  };
  
  // Xử lý chọn thuốc từ danh sách có sẵn
  const handleMedicationSelect = (e) => {
    const medicationId = parseInt(e.target.value, 10);
    
    if (medicationId) {
      const selectedMedication = availableMedications.find(med => med.id === medicationId);
      
      if (selectedMedication) {
        setFormData({
          ...formData,
          medicationId: medicationId,
          studentId: selectedMedication.studentId,
          studentName: selectedMedication.studentName,
          medicationName: selectedMedication.medicationName,
          dosage: selectedMedication.dosage
        });
      }
    } else {
      // Reset form if "Chọn thuốc" is selected
      setFormData({
        ...formData,
        medicationId: '',
        studentId: '',
        studentName: '',
        medicationName: '',
        dosage: ''
      });
    }
  };
  
  // Xử lý thay đổi form input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Validate form data
      if (!formData.studentId || !formData.medicationName || !formData.administrationTime || !formData.administeredBy) {
        alert("Vui lòng điền đầy đủ các trường bắt buộc");
        return;
      }
      
      // Mô phỏng lưu dữ liệu
      setTimeout(() => {
        if (selectedRecord) {
          // Cập nhật
          const updatedRecords = administrationRecords.map(record => 
            record.id === selectedRecord.id ? {...formData, id: record.id} : record
          );
          setAdministrationRecords(updatedRecords);
          alert("Cập nhật thông tin dùng thuốc thành công!");
        } else {
          // Thêm mới
          const newRecord = {
            ...formData,
            id: Math.max(...administrationRecords.map(record => record.id), 0) + 1,
            createdAt: new Date().toISOString()
          };
          setAdministrationRecords([...administrationRecords, newRecord]);
          alert("Thêm mới thông tin dùng thuốc thành công!");
        }
        
        // Đóng modal
        setShowModal(false);
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error("Lỗi khi lưu thông tin dùng thuốc:", error);
      alert("Có lỗi xảy ra khi lưu dữ liệu!");
      setLoading(false);
    }
  };
  
  // Xử lý thay đổi bộ lọc
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };
  
  // Áp dụng bộ lọc
  const handleApplyFilters = () => {
    setLoading(true);
    
    // Mô phỏng lọc dữ liệu
    setTimeout(() => {
      const filteredRecords = administrationRecords.filter(record => {
        // Lọc theo mã học sinh
        if (filters.studentId && !record.studentId.toLowerCase().includes(filters.studentId.toLowerCase())) {
          return false;
        }
        
        // Lọc theo lớp
        if (filters.className && !record.className.toLowerCase().includes(filters.className.toLowerCase())) {
          return false;
        }
        
        // Lọc theo tên thuốc
        if (filters.medicationName && !record.medicationName.toLowerCase().includes(filters.medicationName.toLowerCase())) {
          return false;
        }
        
        // Lọc theo trạng thái
        if (filters.administrationStatus && record.administrationStatus !== filters.administrationStatus) {
          return false;
        }
        
        // Lọc theo ngày bắt đầu
        if (filters.fromDate) {
          const recordDate = new Date(record.administrationTime).setHours(0, 0, 0, 0);
          const fromDate = new Date(filters.fromDate).setHours(0, 0, 0, 0);
          if (recordDate < fromDate) {
            return false;
          }
        }
        
        // Lọc theo ngày kết thúc
        if (filters.toDate) {
          const recordDate = new Date(record.administrationTime).setHours(0, 0, 0, 0);
          const toDate = new Date(filters.toDate).setHours(0, 0, 0, 0);
          if (recordDate > toDate) {
            return false;
          }
        }
        
        return true;
      });
      
      // Cập nhật trạng thái tìm kiếm
      setSearchStatus({
        hasSearched: true,
        resultCount: filteredRecords.length
      });
      
      setAdministrationRecords(filteredRecords);
      setLoading(false);
      
      if (filteredRecords.length === 0) {
        alert("Không tìm thấy thông tin dùng thuốc phù hợp với điều kiện lọc.");
      }
    }, 500);
  };
  
  // Reset bộ lọc
  const handleResetFilters = () => {
    setFilters({
      studentId: '',
      className: '',
      medicationName: '',
      fromDate: '',
      toDate: '',
      administrationStatus: ''
    });
    
    // Reset search status
    setSearchStatus({
      hasSearched: false,
      resultCount: 0
    });
    
    // Mô phỏng reload dữ liệu
    setLoading(true);
    setTimeout(() => {
      const fetchData = async () => {
        try {
          // Mock data - trong thực tế sẽ thay bằng API call
          const mockAdministrationRecords = [
            {
              id: 1,
              studentId: 'SV001',
              studentName: 'Nguyễn Văn A',
              className: '10A1',
              medicationId: 1,
              medicationName: 'Paracetamol',
              dosage: '500mg - 1 viên',
              administrationTime: '2025-06-05T08:30:00',
              administeredBy: 'Y tá Minh',
              remarks: 'Học sinh uống đầy đủ',
              administrationStatus: 'Đã cho uống',
              createdAt: '2025-06-05T08:32:00'
            },
            {
              id: 2,
              studentId: 'SV001',
              studentName: 'Nguyễn Văn A',
              className: '10A1',
              medicationId: 1,
              medicationName: 'Paracetamol',
              dosage: '500mg - 1 viên',
              administrationTime: '2025-06-05T13:30:00',
              administeredBy: 'Y tá Hoa',
              remarks: 'Học sinh uống đầy đủ',
              administrationStatus: 'Đã cho uống',
              createdAt: '2025-06-05T13:35:00'
            },
            {
              id: 3,
              studentId: 'SV002',
              studentName: 'Trần Thị B',
              className: '11A2',
              medicationId: 2,
              medicationName: 'Vitamin C',
              dosage: '1 viên',
              administrationTime: '2025-06-05T08:45:00',
              administeredBy: 'Y tá Minh',
              remarks: 'Học sinh nghỉ học hôm nay',
              administrationStatus: 'Không có mặt',
              createdAt: '2025-06-05T08:50:00'
            }
          ];
          
          setAdministrationRecords(mockAdministrationRecords);
        } catch (error) {
          console.error("Lỗi khi lấy dữ liệu:", error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchData();
    }, 500);
  };
  
  // Format date time
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return '';
    const date = new Date(dateTimeStr);
    return `${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}`;
  };
  
  // Get class based on status
  const getStatusClass = (status) => {
    switch (status) {
      case 'Đã cho uống': return 'status-completed';
      case 'Đã từ chối': return 'status-expired';
      case 'Không có mặt': return 'status-active';
      default: return '';
    }
  };

  return (
    <main className="medical-events-content">
      {/* Bộ lọc */}
      <div className="filter-section">
        <div className="filter-row">
          <div className="filter-item">
            <label>Mã học sinh:</label>
            <input 
              type="text" 
              name="studentId"
              value={filters.studentId}
              onChange={handleFilterChange}
              placeholder="Nhập mã học sinh..."
            />
          </div>
          
          <div className="filter-item">
            <label>Lớp:</label>
            <input 
              type="text" 
              name="className"
              value={filters.className}
              onChange={handleFilterChange}
              placeholder="Nhập tên lớp..."
            />
          </div>
          
          <div className="filter-item">
            <label>Tên thuốc:</label>
            <input 
              type="text" 
              name="medicationName"
              value={filters.medicationName}
              onChange={handleFilterChange}
              placeholder="Nhập tên thuốc..."
            />
          </div>
        </div>
        
        <div className="filter-row">
          <div className="filter-item">
            <label>Từ ngày:</label>
            <input 
              type="date" 
              name="fromDate"
              value={filters.fromDate}
              onChange={handleFilterChange}
            />
          </div>
          
          <div className="filter-item">
            <label>Đến ngày:</label>
            <input 
              type="date" 
              name="toDate"
              value={filters.toDate}
              onChange={handleFilterChange}
            />
          </div>
          
          <div className="filter-item">
            <label>Trạng thái:</label>
            <select 
              name="administrationStatus"
              value={filters.administrationStatus}
              onChange={handleFilterChange}
            >
              <option value="">Tất cả</option>
              <option value="Đã cho uống">Đã cho uống</option>
              <option value="Đã từ chối">Đã từ chối</option>
              <option value="Không có mặt">Không có mặt</option>
            </select>
          </div>
        </div>
        
        <div className="filter-actions">
          <button className="filter-btn apply" onClick={handleApplyFilters}>
            <i className="fas fa-search"></i> Lọc
          </button>
          <button className="filter-btn reset" onClick={handleResetFilters}>
            <i className="fas fa-redo"></i> Đặt lại
          </button>
          <button className="add-event-btn" onClick={handleAddNew}>
            <i className="fas fa-plus"></i> Thêm bản ghi
          </button>
        </div>
      </div>
      
      {/* Bảng danh sách lịch sử dùng thuốc */}
      {loading ? (
        <div className="loading">Đang tải dữ liệu...</div>
      ) : (
        <div className="events-table-container">
          <table className="events-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Mã học sinh</th>
                <th>Tên học sinh</th>
                <th>Lớp</th>
                <th>Tên thuốc</th>
                <th>Liều lượng</th>
                <th>Thời gian dùng</th>
                <th>Người cho uống</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {administrationRecords.length > 0 ? (
                administrationRecords.map((record, index) => (
                  <tr key={record.id}>
                    <td>{index + 1}</td>
                    <td>{record.studentId}</td>
                    <td>{record.studentName}</td>
                    <td>{record.className}</td>
                    <td>{record.medicationName}</td>
                    <td>{record.dosage}</td>
                    <td>{formatDateTime(record.administrationTime)}</td>
                    <td>{record.administeredBy}</td>                    <td>
                      <span className={`status-badge ${getStatusClass(record.administrationStatus)}`}>
                        {record.administrationStatus}
                      </span>
                    </td>
                    <td className="action-cell">
                      <button 
                        className="btn-view" 
                        onClick={() => handleViewDetails(record.id)}
                        title="Xem chi tiết"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="no-data">Không có dữ liệu lịch sử dùng thuốc</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal xem chi tiết hoặc thêm/sửa */}
      {showModal && (
        <div className="modal-overlay" onClick={() => !loading && setShowModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {isDetailView ? 'Chi tiết lịch sử dùng thuốc' : 
                 (selectedRecord ? 'Chỉnh sửa bản ghi' : 'Thêm mới bản ghi')}
              </h3>
              <button 
                className="close-btn" 
                onClick={() => setShowModal(false)}
                disabled={loading}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              {isDetailView ? (
                // Chi tiết lịch sử dùng thuốc
                <div className="event-details">
                  <div className="detail-header">
                    <div className={`status-badge ${getStatusClass(selectedRecord.administrationStatus)}`}>
                      {selectedRecord.administrationStatus}
                    </div>
                    <div className="event-datetime">
                      {formatDateTime(selectedRecord.administrationTime)}
                    </div>
                  </div>
                  
                  <div className="detail-section">
                    <h4>Thông tin học sinh</h4>
                    <div className="detail-row">
                      <div className="detail-label">Mã học sinh:</div>
                      <div className="detail-value">{selectedRecord.studentId}</div>
                    </div>
                    <div className="detail-row">
                      <div className="detail-label">Tên học sinh:</div>
                      <div className="detail-value">{selectedRecord.studentName}</div>
                    </div>
                    <div className="detail-row">
                      <div className="detail-label">Lớp:</div>
                      <div className="detail-value">{selectedRecord.className}</div>
                    </div>
                  </div>
                  
                  <div className="detail-section">
                    <h4>Thông tin thuốc</h4>
                    <div className="detail-row">
                      <div className="detail-label">Tên thuốc:</div>
                      <div className="detail-value">{selectedRecord.medicationName}</div>
                    </div>
                    <div className="detail-row">
                      <div className="detail-label">Liều lượng:</div>
                      <div className="detail-value">{selectedRecord.dosage}</div>
                    </div>
                  </div>
                  
                  <div className="detail-section">
                    <h4>Thông tin cho uống thuốc</h4>
                    <div className="detail-row">
                      <div className="detail-label">Thời gian cho uống:</div>
                      <div className="detail-value">{formatDateTime(selectedRecord.administrationTime)}</div>
                    </div>
                    <div className="detail-row">
                      <div className="detail-label">Người cho uống:</div>
                      <div className="detail-value">{selectedRecord.administeredBy}</div>
                    </div>
                    <div className="detail-row">
                      <div className="detail-label">Ghi chú:</div>
                      <div className="detail-value">{selectedRecord.remarks || "Không có"}</div>
                    </div>
                    <div className="detail-row">
                      <div className="detail-label">Trạng thái:</div>
                      <div className="detail-value status">
                        <div className={`status-badge ${getStatusClass(selectedRecord.administrationStatus)}`}>
                          {selectedRecord.administrationStatus}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="detail-section">
                    <h4>Thông tin quản lý</h4>
                    <div className="detail-row">
                      <div className="detail-label">Ngày ghi nhận:</div>
                      <div className="detail-value">{formatDateTime(selectedRecord.createdAt)}</div>
                    </div>
                  </div>
                  
                  <div className="detail-actions">
                    <button 
                      className="btn-close" 
                      onClick={() => setShowModal(false)}
                    >
                      <i className="fas fa-times"></i> Đóng
                    </button>
                  </div>
                </div>
              ) : (
                // Form thêm/sửa
                <form onSubmit={handleSubmit} className="event-form">
                  {/* Chọn thuốc từ danh sách có sẵn */}
                  <div className="form-section">
                    <h4>Chọn thuốc</h4>
                    <div className="form-row">
                      <div className="form-group full-width">
                        <label htmlFor="medicationId">Thuốc có sẵn <span className="required">*</span></label>
                        <select 
                          id="medicationId" 
                          name="medicationId"
                          value={formData.medicationId}
                          onChange={handleMedicationSelect}
                          required
                        >
                          <option value="">Chọn thuốc</option>
                          {availableMedications.map((med) => (
                            <option key={med.id} value={med.id}>
                              {med.studentName} - {med.medicationName} ({med.dosage})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  {/* Thông tin học sinh */}
                  <div className="form-section">
                    <h4>Thông tin học sinh</h4>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="studentId">Mã học sinh <span className="required">*</span></label>
                        <input 
                          type="text" 
                          id="studentId" 
                          name="studentId"
                          value={formData.studentId}
                          onChange={handleInputChange}
                          required
                          readOnly={!!formData.medicationId}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="studentName">Tên học sinh <span className="required">*</span></label>
                        <input 
                          type="text" 
                          id="studentName" 
                          name="studentName"
                          value={formData.studentName}
                          onChange={handleInputChange}
                          required
                          readOnly={!!formData.medicationId}
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="className">Lớp <span className="required">*</span></label>
                        <input 
                          type="text" 
                          id="className" 
                          name="className"
                          value={formData.className}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Thông tin thuốc */}
                  <div className="form-section">
                    <h4>Thông tin thuốc</h4>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="medicationName">Tên thuốc <span className="required">*</span></label>
                        <input 
                          type="text" 
                          id="medicationName" 
                          name="medicationName"
                          value={formData.medicationName}
                          onChange={handleInputChange}
                          required
                          readOnly={!!formData.medicationId}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="dosage">Liều lượng <span className="required">*</span></label>
                        <input 
                          type="text" 
                          id="dosage" 
                          name="dosage"
                          value={formData.dosage}
                          onChange={handleInputChange}
                          required
                          readOnly={!!formData.medicationId}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Thông tin cho uống thuốc */}
                  <div className="form-section">
                    <h4>Thông tin cho uống thuốc</h4>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="administrationTime">Thời gian cho uống <span className="required">*</span></label>
                        <input 
                          type="datetime-local" 
                          id="administrationTime" 
                          name="administrationTime"
                          value={formData.administrationTime}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="administeredBy">Người cho uống <span className="required">*</span></label>
                        <input 
                          type="text" 
                          id="administeredBy" 
                          name="administeredBy"
                          value={formData.administeredBy}
                          onChange={handleInputChange}
                          required
                          placeholder="Nhập tên và chức vụ"
                        />
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="administrationStatus">Trạng thái <span className="required">*</span></label>
                        <select 
                          id="administrationStatus" 
                          name="administrationStatus"
                          value={formData.administrationStatus}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="Đã cho uống">Đã cho uống</option>
                          <option value="Đã từ chối">Đã từ chối</option>
                          <option value="Không có mặt">Không có mặt</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="form-group full-width">
                      <label htmlFor="remarks">Ghi chú</label>
                      <textarea 
                        id="remarks" 
                        name="remarks"
                        value={formData.remarks}
                        onChange={handleInputChange}
                        rows="2"
                        placeholder="Thêm ghi chú nếu có"
                      ></textarea>
                    </div>
                  </div>
                  
                  {/* Form actions */}
                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="btn-cancel" 
                      onClick={() => setShowModal(false)}
                      disabled={loading}
                    >
                      <i className="fas fa-times"></i> Hủy
                    </button>
                    <button 
                      type="submit" 
                      className="btn-save"
                      disabled={loading}
                    >
                      {loading ? (
                        <><i className="fas fa-spinner fa-spin"></i> Đang lưu...</>
                      ) : (
                        <><i className="fas fa-save"></i> {selectedRecord ? 'Cập nhật' : 'Lưu'}</>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hiển thị thông báo tìm kiếm */}
      {searchStatus.hasSearched && (
        <div className={`search-result-message ${searchStatus.resultCount > 0 ? 'success' : 'no-result'}`}>
          {searchStatus.resultCount > 0 
            ? `Tìm thấy ${searchStatus.resultCount} kết quả` 
            : "Không tìm thấy kết quả nào phù hợp"}
        </div>
      )}
    </main>
  );
};

export default MedicationAdministrationManagement;
