import React, { useState, useEffect } from 'react';
import './MedicationReceiving.css';

const MedicationReceivingManagement = () => {
  // States
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [isDetailView, setIsDetailView] = useState(false);
  
  // State cho form thêm/sửa
  const [formData, setFormData] = useState({
    studentId: '',
    studentName: '',
    className: '',
    medicationName: '',
    dosage: '',
    frequency: '',
    startDate: '',
    endDate: '',
    parentName: '',
    parentPhone: '',
    specialInstructions: '',
    medicationStatus: 'Mới nhận', // Default status: Mới nhận, Đang sử dụng, Đã hoàn thành, Hết hạn
    handledBy: ''
  });
  
  // State cho bộ lọc
  const [filters, setFilters] = useState({
    studentId: '',
    className: '',
    medicationStatus: '',
    fromDate: '',
    toDate: '',
  });
  
  // Thêm state để theo dõi trạng thái tìm kiếm
  const [searchStatus, setSearchStatus] = useState({
    hasSearched: false,
    resultCount: 0
  });

  // Mô phỏng fetch dữ liệu từ API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Mock data - trong thực tế sẽ thay bằng API call
        const mockMedications = [
          {
            id: 1,
            studentId: 'SV001',
            studentName: 'Nguyễn Văn A',
            className: '10A1',
            medicationName: 'Paracetamol',
            dosage: '500mg',
            frequency: 'Ngày 2 lần sau ăn',
            startDate: '2025-06-01',
            endDate: '2025-06-10',
            parentName: 'Nguyễn Văn B',
            parentPhone: '0912345678',
            specialInstructions: 'Uống với nhiều nước',
            medicationStatus: 'Đang sử dụng',
            handledBy: 'Nguyễn Thị Y Tá',
            createdAt: '2025-06-01T08:30:00'
          },
          {
            id: 2,
            studentId: 'SV002',
            studentName: 'Trần Thị B',
            className: '11A2',
            medicationName: 'Vitamin C',
            dosage: '1 viên',
            frequency: 'Ngày 1 lần sau ăn sáng',
            startDate: '2025-06-03',
            endDate: '2025-06-17',
            parentName: 'Trần Văn C',
            parentPhone: '0987654321',
            specialInstructions: '',
            medicationStatus: 'Mới nhận',
            handledBy: 'Nguyễn Thị Y Tá',
            createdAt: '2025-06-03T09:15:00'
          }
        ];
        
        setMedications(mockMedications);
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
    const medicationData = medications.find(med => med.id === id);
    
    if (medicationData) {
      setSelectedMedication(medicationData);
      setIsDetailView(true);
      setShowModal(true);
    }
  };
  
  // Xử lý mở form thêm mới
  const handleAddNew = () => {
    setFormData({
      studentId: '',
      studentName: '',
      className: '',
      medicationName: '',
      dosage: '',
      frequency: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      parentName: '',
      parentPhone: '',
      specialInstructions: '',
      medicationStatus: 'Mới nhận',
      handledBy: ''
    });
    setSelectedMedication(null);
    setIsDetailView(false);
    setShowModal(true);
  };
  
  // Xử lý mở form chỉnh sửa
  const handleEdit = (id) => {
    const medicationData = medications.find(med => med.id === id);
    
    if (medicationData) {
      setFormData({
        ...medicationData
      });
      
      setSelectedMedication(medicationData);
      setIsDetailView(false);
      setShowModal(true);
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
      if (!formData.studentId || !formData.studentName || !formData.medicationName || !formData.startDate) {
        alert("Vui lòng điền đầy đủ các trường bắt buộc");
        return;
      }
      
      // Mô phỏng lưu dữ liệu
      setTimeout(() => {
        if (selectedMedication) {
          // Cập nhật
          const updatedMedications = medications.map(med => 
            med.id === selectedMedication.id ? {...formData, id: med.id} : med
          );
          setMedications(updatedMedications);
          alert("Cập nhật thông tin thuốc thành công!");
        } else {
          // Thêm mới
          const newMedication = {
            ...formData,
            id: Math.max(...medications.map(med => med.id), 0) + 1,
            createdAt: new Date().toISOString()
          };
          setMedications([...medications, newMedication]);
          alert("Thêm mới thông tin thuốc thành công!");
        }
        
        // Đóng modal
        setShowModal(false);
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error("Lỗi khi lưu thông tin thuốc:", error);
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
      const filteredMedications = medications.filter(med => {
        // Lọc theo mã học sinh
        if (filters.studentId && !med.studentId.toLowerCase().includes(filters.studentId.toLowerCase())) {
          return false;
        }
        
        // Lọc theo lớp
        if (filters.className && !med.className.toLowerCase().includes(filters.className.toLowerCase())) {
          return false;
        }
        
        // Lọc theo trạng thái
        if (filters.medicationStatus && med.medicationStatus !== filters.medicationStatus) {
          return false;
        }
        
        // Lọc theo ngày bắt đầu
        if (filters.fromDate && new Date(med.startDate) < new Date(filters.fromDate)) {
          return false;
        }
        
        // Lọc theo ngày kết thúc
        if (filters.toDate && new Date(med.endDate) > new Date(filters.toDate)) {
          return false;
        }
        
        return true;
      });
      
      // Cập nhật trạng thái tìm kiếm
      setSearchStatus({
        hasSearched: true,
        resultCount: filteredMedications.length
      });
      
      setMedications(filteredMedications);
      setLoading(false);
      
      if (filteredMedications.length === 0) {
        alert("Không tìm thấy thông tin thuốc phù hợp với điều kiện lọc.");
      }
    }, 500);
  };
  
  // Reset bộ lọc
  const handleResetFilters = () => {
    setFilters({
      studentId: '',
      className: '',
      medicationStatus: '',
      fromDate: '',
      toDate: '',
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
          const mockMedications = [
            {
              id: 1,
              studentId: 'SV001',
              studentName: 'Nguyễn Văn A',
              className: '10A1',
              medicationName: 'Paracetamol',
              dosage: '500mg',
              frequency: 'Ngày 2 lần sau ăn',
              startDate: '2025-06-01',
              endDate: '2025-06-10',
              parentName: 'Nguyễn Văn B',
              parentPhone: '0912345678',
              specialInstructions: 'Uống với nhiều nước',
              medicationStatus: 'Đang sử dụng',
              handledBy: 'Nguyễn Thị Y Tá',
              createdAt: '2025-06-01T08:30:00'
            },
            {
              id: 2,
              studentId: 'SV002',
              studentName: 'Trần Thị B',
              className: '11A2',
              medicationName: 'Vitamin C',
              dosage: '1 viên',
              frequency: 'Ngày 1 lần sau ăn sáng',
              startDate: '2025-06-03',
              endDate: '2025-06-17',
              parentName: 'Trần Văn C',
              parentPhone: '0987654321',
              specialInstructions: '',
              medicationStatus: 'Mới nhận',
              handledBy: 'Nguyễn Thị Y Tá',
              createdAt: '2025-06-03T09:15:00'
            }
          ];
          
          setMedications(mockMedications);
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
  
  // Format date only
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN');
  };
  
  // Get class based on status
  const getStatusClass = (status) => {
    switch (status) {
      case 'Mới nhận': return 'status-new';
      case 'Đang sử dụng': return 'status-active';
      case 'Đã hoàn thành': return 'status-completed';
      case 'Hết hạn': return 'status-expired';
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
            <label>Trạng thái:</label>
            <select 
              name="medicationStatus"
              value={filters.medicationStatus}
              onChange={handleFilterChange}
            >
              <option value="">Tất cả</option>
              <option value="Mới nhận">Mới nhận</option>
              <option value="Đang sử dụng">Đang sử dụng</option>
              <option value="Đã hoàn thành">Đã hoàn thành</option>
              <option value="Hết hạn">Hết hạn</option>
            </select>
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
        </div>
        
        <div className="filter-actions">
          <button className="filter-btn apply" onClick={handleApplyFilters}>
            <i className="fas fa-search"></i> Lọc
          </button>
          <button className="filter-btn reset" onClick={handleResetFilters}>
            <i className="fas fa-redo"></i> Đặt lại
          </button>
          <button className="add-event-btn" onClick={handleAddNew}>
            <i className="fas fa-plus"></i> Thêm thông tin
          </button>
        </div>
      </div>
      
      {/* Bảng danh sách thuốc */}
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
                <th>Ngày bắt đầu</th>
                <th>Ngày kết thúc</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {medications.length > 0 ? (
                medications.map((medication, index) => (
                  <tr key={medication.id}>
                    <td>{index + 1}</td>
                    <td>{medication.studentId}</td>
                    <td>{medication.studentName}</td>
                    <td>{medication.className}</td>
                    <td>{medication.medicationName}</td>
                    <td>{medication.dosage}</td>
                    <td>{formatDate(medication.startDate)}</td>
                    <td>{formatDate(medication.endDate)}</td>
                    <td className={getStatusClass(medication.medicationStatus)}>
                      {medication.medicationStatus}
                    </td>
                    <td className="action-cell">
                      <button 
                        className="btn-view" 
                        onClick={() => handleViewDetails(medication.id)}
                        title="Xem chi tiết"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button 
                        className="btn-edit" 
                        onClick={() => handleEdit(medication.id)}
                        title="Chỉnh sửa"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="no-data">Không có dữ liệu thuốc</td>
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
                {isDetailView ? 'Chi tiết thông tin thuốc' : 
                 (selectedMedication ? 'Chỉnh sửa thông tin thuốc' : 'Thêm mới thông tin thuốc')}
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
                // Chi tiết thông tin thuốc
                <div className="event-details">
                  <div className="detail-header">
                    <div className={`status-badge ${getStatusClass(selectedMedication.medicationStatus)}`}>
                      {selectedMedication.medicationStatus}
                    </div>
                    <div className="event-datetime">
                      {formatDateTime(selectedMedication.createdAt)}
                    </div>
                  </div>
                  
                  <div className="detail-section">
                    <h4>Thông tin học sinh</h4>
                    <div className="detail-row">
                      <div className="detail-label">Mã học sinh:</div>
                      <div className="detail-value">{selectedMedication.studentId}</div>
                    </div>
                    <div className="detail-row">
                      <div className="detail-label">Tên học sinh:</div>
                      <div className="detail-value">{selectedMedication.studentName}</div>
                    </div>
                    <div className="detail-row">
                      <div className="detail-label">Lớp:</div>
                      <div className="detail-value">{selectedMedication.className}</div>
                    </div>
                  </div>
                  
                  <div className="detail-section">
                    <h4>Thông tin thuốc</h4>
                    <div className="detail-row">
                      <div className="detail-label">Tên thuốc:</div>
                      <div className="detail-value">{selectedMedication.medicationName}</div>
                    </div>
                    <div className="detail-row">
                      <div className="detail-label">Liều lượng:</div>
                      <div className="detail-value">{selectedMedication.dosage}</div>
                    </div>
                    <div className="detail-row">
                      <div className="detail-label">Tần suất:</div>
                      <div className="detail-value">{selectedMedication.frequency}</div>
                    </div>
                    <div className="detail-row">
                      <div className="detail-label">Ngày bắt đầu:</div>
                      <div className="detail-value">{formatDate(selectedMedication.startDate)}</div>
                    </div>
                    <div className="detail-row">
                      <div className="detail-label">Ngày kết thúc:</div>
                      <div className="detail-value">{formatDate(selectedMedication.endDate)}</div>
                    </div>
                    <div className="detail-row">
                      <div className="detail-label">Hướng dẫn đặc biệt:</div>
                      <div className="detail-value">{selectedMedication.specialInstructions || "Không có"}</div>
                    </div>
                  </div>
                  
                  <div className="detail-section">
                    <h4>Thông tin phụ huynh</h4>
                    <div className="detail-row">
                      <div className="detail-label">Tên phụ huynh:</div>
                      <div className="detail-value">{selectedMedication.parentName}</div>
                    </div>
                    <div className="detail-row">
                      <div className="detail-label">Số điện thoại:</div>
                      <div className="detail-value">{selectedMedication.parentPhone}</div>
                    </div>
                  </div>
                  
                  <div className="detail-section">
                    <h4>Thông tin quản lý</h4>
                    <div className="detail-row">
                      <div className="detail-label">Người tiếp nhận:</div>
                      <div className="detail-value">{selectedMedication.handledBy}</div>
                    </div>
                    <div className="detail-row">
                      <div className="detail-label">Ngày tiếp nhận:</div>
                      <div className="detail-value">{formatDateTime(selectedMedication.createdAt)}</div>
                    </div>
                  </div>
                  
                  <div className="detail-actions">
                    <button 
                      className="btn-edit" 
                      onClick={() => {
                        setIsDetailView(false);
                        handleEdit(selectedMedication.id);
                      }}
                    >
                      <i className="fas fa-edit"></i> Chỉnh sửa
                    </button>
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
                        />
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="frequency">Tần suất sử dụng <span className="required">*</span></label>
                        <input 
                          type="text" 
                          id="frequency" 
                          name="frequency"
                          value={formData.frequency}
                          onChange={handleInputChange}
                          required
                          placeholder="VD: Ngày 2 lần sau ăn"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="medicationStatus">Trạng thái <span className="required">*</span></label>
                        <select 
                          id="medicationStatus" 
                          name="medicationStatus"
                          value={formData.medicationStatus}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="Mới nhận">Mới nhận</option>
                          <option value="Đang sử dụng">Đang sử dụng</option>
                          <option value="Đã hoàn thành">Đã hoàn thành</option>
                          <option value="Hết hạn">Hết hạn</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="startDate">Ngày bắt đầu <span className="required">*</span></label>
                        <input 
                          type="date" 
                          id="startDate" 
                          name="startDate"
                          value={formData.startDate}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="endDate">Ngày kết thúc</label>
                        <input 
                          type="date" 
                          id="endDate" 
                          name="endDate"
                          value={formData.endDate}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    
                    <div className="form-group full-width">
                      <label htmlFor="specialInstructions">Hướng dẫn đặc biệt</label>
                      <textarea 
                        id="specialInstructions" 
                        name="specialInstructions"
                        value={formData.specialInstructions}
                        onChange={handleInputChange}
                        rows="2"
                        placeholder="Hướng dẫn sử dụng đặc biệt nếu có"
                      ></textarea>
                    </div>
                  </div>
                  
                  {/* Thông tin phụ huynh */}
                  <div className="form-section">
                    <h4>Thông tin phụ huynh</h4>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="parentName">Tên phụ huynh <span className="required">*</span></label>
                        <input 
                          type="text" 
                          id="parentName" 
                          name="parentName"
                          value={formData.parentName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="parentPhone">Số điện thoại <span className="required">*</span></label>
                        <input 
                          type="text" 
                          id="parentPhone" 
                          name="parentPhone"
                          value={formData.parentPhone}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Thông tin quản lý */}
                  <div className="form-section">
                    <h4>Thông tin quản lý</h4>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="handledBy">Người tiếp nhận <span className="required">*</span></label>
                        <input 
                          type="text" 
                          id="handledBy" 
                          name="handledBy"
                          value={formData.handledBy}
                          onChange={handleInputChange}
                          required
                          placeholder="Nhập tên và chức vụ"
                        />
                      </div>
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
                        <><i className="fas fa-save"></i> {selectedMedication ? 'Cập nhật' : 'Lưu'}</>
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

export default MedicationReceivingManagement;
