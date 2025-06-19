import React, { useState, useEffect } from 'react';
import { useMedicalEvents } from '../../../../../context/NurseContext/MedicalEventsContext';
import medicalEventsService from '../../../../../services/medicalEventsService';
import './MedicalIncidents.css';

const MedicalIncidentsManagement = () => {
  // Sử dụng context để quản lý state và API
  const { 
    events, 
    loading, 
    error,
    eventTypes,
    severityLevels,
    fetchEvents,
    fetchEventById,
    addEvent,
    updateEvent,
    deleteEvent,
    searchEvents,
    fetchEventTypes,
    fetchSeverityLevels
  } = useMedicalEvents();
  
  // State cục bộ
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  // Thêm state cho kết quả tìm kiếm thuốc
  const [medicationSearchResults, setMedicationSearchResults] = useState({});
  const [medicationSearchLoading, setMedicationSearchLoading] = useState({});
  // State cho form thêm/sửa sự cố y tế
  const [formData, setFormData] = useState({
    studentId: '',
    incidentType: '',
    dateTime: '',
    description: '', 
    symptoms: '',
    severityLevel: '',
    treatment: '',
    parentNotified: false,
    requiresFollowUp: false,
    followUpNotes: '',
    staffId: '',
    staffName: '',
    medicationsUsed: [
      { quantityUsed: 0, itemID: 0 }
    ],
    handledById: 1
  });
  
  // State cho bộ lọc
  const [filters, setFilters] = useState({
    studentId: '',
    incidentType: '',
    severityLevel: '',
    fromDate: '',
    toDate: '',
    parentNotified: '',
    requiresFollowUp: ''
  });
  
  // Thêm state để theo dõi trạng thái tìm kiếm
  const [searchStatus, setSearchStatus] = useState({
    hasSearched: false,
    resultCount: 0
  });
  
  // Context đã tự động lấy dữ liệu ban đầu
  useEffect(() => {
    // Nếu cần refresh dữ liệu cụ thể trong component này
    if (!events || events.length === 0) {
      fetchEvents();
    }
    if (!eventTypes || eventTypes.length === 0) {
      fetchEventTypes();
    }
    if (!severityLevels || severityLevels.length === 0) {
      fetchSeverityLevels();
    }
  }, [fetchEvents, fetchEventTypes, fetchSeverityLevels, events, eventTypes, severityLevels]);
    // State cho modal xem chi tiết
  const [showViewDetailsModal, setShowViewDetailsModal] = useState(false);
  
  // Xử lý mở modal chi tiết
  const handleViewDetails = async (id) => {
    try {
      // Lấy chi tiết sự kiện từ API thông qua context
      const eventData = await fetchEventById(id);
      console.log("Chi tiết sự kiện từ API:", eventData);
      setSelectedEvent(eventData);
      setShowViewDetailsModal(true); // Hiển thị modal chi tiết riêng
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết sự kiện:", error);
      alert("Không thể tải chi tiết sự kiện. Vui lòng thử lại sau.");
    }
  };  // Xử lý mở form thêm mới
  const handleAddNew = () => {
    const now = new Date();
    const formattedDateTime = now.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm
    setFormData({
      studentId: '',
      incidentType: '', // Để trống để người dùng tự nhập
      dateTime: formattedDateTime, // Format YYYY-MM-DDThh:mm
      description: '',
      symptoms: '',
      severityLevel: '', // Để trống để người dùng tự nhập
      treatment: '',
      parentNotified: false,
      requiresFollowUp: false,
      followUpNotes: '',
      staffId: '1', // Default staff ID, có thể lấy từ đăng nhập người dùng
      staffName: '', // Default staff name, có thể lấy từ đăng nhập người dùng
      medicationsUsed: [
        { quantityUsed: 0, itemID: 0, itemName: '' }
      ],
      handledById: 1
    });
    setSelectedEvent(null);
    setMedicationSearchResults({});
    setShowModal(true);
  };  // Xử lý mở form chỉnh sửa
  const handleEdit = async (id) => {
    try {
      const eventData = await fetchEventById(id);
      console.log("Dữ liệu sự kiện cần chỉnh sửa:", eventData);
      
      // Convert ISO date to local datetime input format
      const dateTimeLocal = eventData.dateTime ? new Date(eventData.dateTime).toISOString().slice(0, 16) : '';
      
      // Format medications if they're in string format
      let medications = eventData.medicationsUsed || [];
      if (typeof medications === 'string') {
        try {
          medications = JSON.parse(medications);
        } catch (e) {
          // If not valid JSON, initialize with default
          medications = [{ quantityUsed: 0, itemID: 0, itemName: '' }];
        }
      } else if (!Array.isArray(medications)) {
        medications = [{ quantityUsed: 0, itemID: 0, itemName: '' }];
      }
      
      // Thêm tên thuốc cho mỗi thuốc nếu chưa có
      const enhancedMedications = await Promise.all(medications.map(async (med) => {
        if (med.itemID && !med.itemName) {
          try {
            // Gọi API để lấy thông tin thuốc theo ID
            const response = await fetch(`/api/medication-items/${med.itemID}`);
            if (response.ok) {
              const data = await response.json();
              return {
                ...med,
                itemName: data.name || '',
                selectedItem: data
              };
            }
          } catch (error) {
            console.error(`Lỗi khi lấy thông tin thuốc ID ${med.itemID}:`, error);
          }
        }
        return { ...med, itemName: med.itemName || '' };
      }));
      
      setFormData({
        incidentId: eventData.incidentId,
        studentId: eventData.studentId || '',
        incidentType: eventData.incidentType || '',
        dateTime: dateTimeLocal,
        description: eventData.description || '',
        symptoms: eventData.symptoms || '',
        severityLevel: eventData.severityLevel || '',
        treatment: eventData.treatment || '',
        parentNotified: eventData.parentNotified || false,
        requiresFollowUp: eventData.requiresFollowUp || false,
        followUpNotes: eventData.followUpNotes || '',
        staffId: eventData.staffId || '',
        staffName: eventData.staffName || '',
        medicationsUsed: enhancedMedications,
        handledById: eventData.handledById || 1
      });
      
      setSelectedEvent(eventData);
      setMedicationSearchResults({});
      setShowModal(true);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu sự kiện:", error);
      alert("Không thể tải dữ liệu sự kiện. Vui lòng thử lại sau.");
    }
  };
    // Xử lý thay đổi form input
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
    // Xử lý thêm thuốc mới vào danh sách
  const handleAddMedication = () => {
    setFormData(prevData => ({
      ...prevData,
      medicationsUsed: [...prevData.medicationsUsed, { quantityUsed: 0, itemID: 0, itemName: '' }]
    }));
  };
  
  // Xử lý xóa thuốc khỏi danh sách
  const handleRemoveMedication = (index) => {
    setFormData(prevData => ({
      ...prevData,
      medicationsUsed: prevData.medicationsUsed.filter((_, i) => i !== index)
    }));
  };
  
  // Xử lý thay đổi thông tin thuốc
  const handleMedicationChange = (index, field, value) => {
    const updatedMedications = [...formData.medicationsUsed];
    
    if (field === 'itemName') {
      // Cập nhật tên thuốc và tìm kiếm
      updatedMedications[index] = {
        ...updatedMedications[index],
        itemName: value
      };
      
      // Tìm kiếm thuốc nếu value có ít nhất 2 ký tự
      if (value.length >= 2) {
        searchMedicationItems(index, value);
      } else {
        // Xóa kết quả tìm kiếm nếu input quá ngắn
        setMedicationSearchResults(prev => ({
          ...prev,
          [index]: []
        }));
      }
    } else {
      // Xử lý các trường khác như quantityUsed
      updatedMedications[index] = {
        ...updatedMedications[index],
        [field]: field === 'quantityUsed' || field === 'itemID' ? parseInt(value, 10) : value
      };
    }
    
    setFormData({
      ...formData,
      medicationsUsed: updatedMedications
    });
  };

  // Hàm tìm kiếm thuốc theo tên
  const searchMedicationItems = async (index, searchTerm) => {
    try {
      setMedicationSearchLoading(prev => ({ ...prev, [index]: true }));
      const response = await fetch(`/api/v1/medication-items/get-by-name/${encodeURIComponent(searchTerm)}`);
      
      if (!response.ok) {
        throw new Error(`Lỗi API: ${response.status}`);
      }
      
      const data = await response.json();
      setMedicationSearchResults(prev => ({
        ...prev,
        [index]: data || []
      }));
    } catch (error) {
      console.error('Lỗi khi tìm kiếm thuốc:', error);
      setMedicationSearchResults(prev => ({
        ...prev,
        [index]: []
      }));
    } finally {
      setMedicationSearchLoading(prev => ({ ...prev, [index]: false }));
    }
  };

  // Hàm chọn thuốc từ kết quả tìm kiếm
  const handleSelectMedication = (index, item) => {
    const updatedMedications = [...formData.medicationsUsed];
    updatedMedications[index] = {
      ...updatedMedications[index],
      itemID: item.id,
      itemName: item.name,
      selectedItem: item
    };
    
    setFormData({
      ...formData,
      medicationsUsed: updatedMedications
    });
    
    // Xóa kết quả tìm kiếm sau khi chọn
    setMedicationSearchResults(prev => ({
      ...prev,
      [index]: []
    }));
  };
  
  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validate form data
      if (!formData.studentId || !formData.incidentType || !formData.dateTime || !formData.severityLevel) {
        alert("Vui lòng điền đầy đủ các trường bắt buộc");
        return;
      }
      
      // Tạo đối tượng dữ liệu đúng định dạng API
      const apiData = {
        incidentType: formData.incidentType,
        description: formData.description,
        symptoms: formData.symptoms,
        severityLevel: formData.severityLevel,
        treatment: formData.treatment,
        parentNotified: formData.parentNotified,
        requiresFollowUp: formData.requiresFollowUp,
        followUpNotes: formData.followUpNotes,
        handledById: formData.handledById || 1,
        studentId: formData.studentId,
        medicationsUsed: formData.medicationsUsed.filter(med => med.quantityUsed > 0 || med.itemID > 0)
      };
      
      console.log("Dữ liệu gửi lên API:", apiData);
      
      let result;
      if (selectedEvent) {
        // Cập nhật sử dụng context
        result = await updateEvent(selectedEvent.incidentId, apiData);
        alert("Cập nhật sự kiện y tế thành công!");
      } else {
        // Thêm mới sử dụng API
        result = await fetch('/api/v1/medical-incidents/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(apiData)
        });
        
        if (!result.ok) {
          throw new Error(`Lỗi khi tạo sự kiện: ${result.status}`);
        }
        
        const data = await result.json();
        alert("Thêm mới sự kiện y tế thành công!");
      }
      
      // Refresh data - context đã tự động cập nhật state
      fetchEvents();
      
      // Đóng modal
      setShowModal(false);
      
    } catch (error) {
      console.error("Lỗi khi lưu sự kiện y tế:", error);
      alert("Có lỗi xảy ra khi lưu dữ liệu! " + (error.message || ''));
    }
  };
  
  // Xử lý thay đổi bộ lọc
  const handleFilterChange = (e) => {
    const { name, value, type } = e.target;
    
    let filterValue = value;
    
    // Xử lý trường hợp đặc biệt
    if (name === 'studentId') {
      // Không làm gì đặc biệt, giữ nguyên giá trị để người dùng có thể nhập tự do
      console.log("StudentID filter changed:", value);
    } else if (name === 'notifiedParent' || name === 'needsFollowUp') {
      // Convert select value to boolean or undefined
      if (value === 'true') filterValue = true;
      else if (value === 'false') filterValue = false;
      else filterValue = ''; // Reset filter
    }
    
    setFilters({
      ...filters,
      [name]: filterValue
    });
  };
  
  // Áp dụng bộ lọc - đã cập nhật cho cấu trúc dữ liệu mới
  const handleApplyFilters = async () => {
    try {
      // Tạo bản sao của bộ lọc và làm sạch các giá trị
      const cleanedFilters = { ...filters };
      
      // Gỡ bỏ khoảng trắng thừa từ giá trị studentId
      if (cleanedFilters.studentId) {
        cleanedFilters.studentId = cleanedFilters.studentId.trim();
      }
      
      // Map các tên trường mới với API
      const apiFilters = {
        studentId: cleanedFilters.studentId || undefined,
        incidentType: cleanedFilters.incidentType || undefined,
        severityLevel: cleanedFilters.severityLevel || undefined,
        fromDate: cleanedFilters.fromDate || undefined,
        toDate: cleanedFilters.toDate || undefined,
        parentNotified: cleanedFilters.parentNotified ? cleanedFilters.parentNotified === 'true' : undefined,
        requiresFollowUp: cleanedFilters.requiresFollowUp ? cleanedFilters.requiresFollowUp === 'true' : undefined
      };
      
      console.log("Applying filters:", apiFilters);
      
      // Sử dụng context để tìm kiếm
      const filteredEvents = await searchEvents(apiFilters);
      console.log("Filtered results:", filteredEvents);
      
      // Cập nhật trạng thái tìm kiếm
      setSearchStatus({
        hasSearched: true,
        resultCount: filteredEvents.length
      });
      
      if (filteredEvents.length === 0) {
        alert("Không tìm thấy sự kiện y tế phù hợp với điều kiện lọc.");
      }
    } catch (error) {
      console.error("Lỗi khi lọc sự kiện:", error);
      alert("Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại!");
    }
  };
  
  // Reset bộ lọc - đã cập nhật cho cấu trúc dữ liệu mới
  const handleResetFilters = async () => {
    // Reset filters
    setFilters({
      studentId: '',
      incidentType: '',
      severityLevel: '',
      fromDate: '',
      toDate: '',
      parentNotified: '',
      requiresFollowUp: ''
    });
    
    // Reset search status
    setSearchStatus({
      hasSearched: false,
      resultCount: 0
    });
    
    // Refresh data từ context
    fetchEvents();
  };
  
  // Format date time
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "Không có thông tin";
    
    try {
      const dateObj = new Date(dateTimeString);
      return dateObj.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error("Lỗi khi định dạng ngày tháng:", error);
      return dateTimeString;
    }
  };
  
  // Hàm lấy class CSS dựa trên mức độ nghiêm trọng
  const getSeverityClass = (severity) => {
    if (!severity) return 'unknown';
    
    const lowLevel = severity.toLowerCase();
    if (lowLevel.includes('nhẹ') || lowLevel === 'low' || lowLevel === 'mild') return 'low';
    if (lowLevel.includes('trung bình') || lowLevel === 'medium' || lowLevel === 'moderate') return 'medium';
    if (lowLevel.includes('cao') || lowLevel === 'high' || lowLevel === 'severe') return 'high';
    if (lowLevel.includes('khẩn cấp') || lowLevel.includes('nguy hiểm') || lowLevel === 'emergency' || lowLevel === 'critical') return 'critical';
    
    return 'unknown';
  };
  
  // Xử lý xóa sự kiện
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sự kiện này không?")) {
      try {
        await deleteEvent(id);
        alert("Xóa sự kiện thành công!");
      } catch (error) {
        console.error("Lỗi khi xóa sự kiện:", error);
        alert("Không thể xóa sự kiện. Vui lòng thử lại sau.");
      }
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
            <label>Loại sự cố:</label>
            <select 
              name="incidentType"
              value={filters.incidentType}
              onChange={handleFilterChange}
            >
              <option value="">Tất cả</option>
              {eventTypes.map((type, index) => (
                <option key={index} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-item">
            <label>Mức độ:</label>
            <select 
              name="severityLevel"
              value={filters.severityLevel}
              onChange={handleFilterChange}
            >
              <option value="">Tất cả</option>
              {severityLevels.map((level, index) => (
                <option key={index} value={level}>{level}</option>
              ))}
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
          <div className="filter-item">
            <label>Thông báo phụ huynh:</label>
            <select 
              name="parentNotified"
              value={filters.parentNotified}
              onChange={handleFilterChange}
            >
              <option value="">Tất cả</option>
              <option value="true">Đã thông báo</option>
              <option value="false">Chưa thông báo</option>
            </select>
          </div>
          
          <div className="filter-item">
            <label>Theo dõi tiếp:</label>
            <select 
              name="requiresFollowUp"
              value={filters.requiresFollowUp}
              onChange={handleFilterChange}
            >
              <option value="">Tất cả</option>
              <option value="true">Cần theo dõi</option>
              <option value="false">Không cần</option>
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
            <i className="fas fa-plus"></i> Thêm sự kiện
          </button>
        </div>
      </div>
      
      {/* Bảng danh sách sự kiện */}
      {loading ? (
        <div className="loading">Đang tải dữ liệu...</div>
      ) : (
        <div className="events-table-container">
          <table className="events-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Mã học sinh</th>
                <th>Tên học sinh</th>
                <th>Ngày giờ</th>
                <th>Mức độ</th>
                <th>Thông báo PH</th>
                <th>Theo dõi</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {events.length > 0 ? (
                events.map((event, index) => (
                  <tr key={event.incidentId}>
                    <td>{event.incidentId}</td>
                    <td>{event.studentId}</td>
                    <td>{event.studentName}</td>
                    <td>{formatDateTime(event.dateTime)}</td>
                    <td>
                      <span className={`status-badge ${getSeverityClass(event.severityLevel)}`}>
                        {event.severityLevel}
                      </span>
                    </td>
                    <td className="status-cell">
                      {event.parentNotified ? 
                        <i className="fas fa-check-circle status-icon notified"></i> : 
                        <i className="fas fa-question-circle status-icon not-notified"></i>
                      }
                    </td>                    <td className="status-cell">
                      {event.requiresFollowUp ? 
                        <i className="fas fa-eye status-icon follow-up"></i> :                        
                        <i className="fas fa-check-circle status-icon no-follow-up"></i>
                      }
                    </td>
                    <td className="action-cell">                      <button 
                        className="btn-view" 
                        onClick={() => handleViewDetails(event.incidentId)}
                        title="Xem chi tiết"
                      >
                        <i className="fas fa-eye"></i>
                      </button>                      <button 
                        className="btn-edit" 
                        onClick={() => handleEdit(event.incidentId)}
                        title="Chỉnh sửa"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        className="btn-delete" 
                        onClick={() => handleDelete(event.incidentId)}
                        title="Xóa sự kiện"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="no-data">Không có dữ liệu sự kiện y tế</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal xem chi tiết - modal riêng biệt */}
      {showViewDetailsModal && selectedEvent && (
        <div className="modal-overlay" onClick={() => setShowViewDetailsModal(false)}>
          <div className="modal-container view-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết sự kiện y tế</h3>
              <button 
                className="close-btn" 
                onClick={() => setShowViewDetailsModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="detail-sections">
                {/* Thông tin cơ bản */}
                <div className="detail-section">
                  <h4 className="detail-section-title">Thông tin cơ bản</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">ID sự kiện:</span>
                      <span className="detail-value">{selectedEvent.incidentId}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Loại sự kiện:</span>
                      <span className="detail-value">{selectedEvent.incidentType}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Ngày giờ:</span>
                      <span className="detail-value">{formatDateTime(selectedEvent.dateTime)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Mức độ:</span>
                      <span className={`detail-value severity-badge ${getSeverityClass(selectedEvent.severityLevel)}`}>
                        {selectedEvent.severityLevel}
                      </span>
                    </div>
                  </div>
                </div>
                  {/* Thông tin học sinh */}
                <div className="detail-section">
                  <h4 className="detail-section-title">Thông tin học sinh</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Mã học sinh:</span>
                      <span className="detail-value">{selectedEvent.studentId}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Tên học sinh:</span>
                      <span className="detail-value">{selectedEvent.studentName}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Giới tính:</span>
                      <span className="detail-value">{selectedEvent.studentGender || "Không có thông tin"}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Khối lớp:</span>
                      <span className="detail-value">{selectedEvent.studentGrade || "Không có thông tin"}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Lớp:</span>
                      <span className="detail-value">{selectedEvent.studentClass || "Không có thông tin"}</span>
                    </div>
                  </div>
                </div>
                
                {/* Thông tin phụ huynh */}
                <div className="detail-section">
                  <h4 className="detail-section-title">Thông tin phụ huynh</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Tên phụ huynh:</span>
                      <span className="detail-value">{selectedEvent.parentName || "Không có thông tin"}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Số điện thoại:</span>
                      <span className="detail-value">{selectedEvent.parentPhone || "Không có thông tin"}</span>
                    </div>
                  </div>
                </div>
                
                {/* Thông tin triệu chứng và điều trị */}
                <div className="detail-section">
                  <h4 className="detail-section-title">Triệu chứng và điều trị</h4>
                  <div className="detail-row">
                    <span className="detail-label">Mô tả:</span>
                    <span className="detail-value">{selectedEvent.description || "Không có mô tả"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Triệu chứng:</span>
                    <span className="detail-value">{selectedEvent.symptoms || "Không ghi nhận triệu chứng"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Điều trị:</span>
                    <span className="detail-value">{selectedEvent.treatment || "Không có thông tin điều trị"}</span>
                  </div>
                </div>
                  {/* Thông tin về thuốc */}
                <div className="detail-section">
                  <h4 className="detail-section-title">Thuốc đã sử dụng</h4>
                  <div className="medications-list">
                    {selectedEvent.medicationsUsed ? (
                      <div className="medication-item">
                        <div><strong>Thuốc đã sử dụng:</strong> {selectedEvent.medicationsUsed}</div>
                      </div>
                    ) : (
                      <div className="medication-item">
                        <div>Không có thông tin về thuốc đã sử dụng</div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Thông tin theo dõi */}
                <div className="detail-section">
                  <h4 className="detail-section-title">Theo dõi và thông báo</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Thông báo phụ huynh:</span>
                      <span className="detail-value status-indicator">
                        {selectedEvent.parentNotified ? (
                          <><i className="fas fa-check-circle status-icon notified"></i> Đã thông báo</>
                        ) : (
                          <><i className="fas fa-question-circle status-icon not-notified"></i> Chưa thông báo</>
                        )}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Cần theo dõi tiếp:</span>
                      <span className="detail-value status-indicator">
                        {selectedEvent.requiresFollowUp ? (
                          <><i className="fas fa-eye status-icon follow-up"></i> Cần theo dõi</>
                        ) : (
                          <><i className="fas fa-check-circle status-icon no-follow-up"></i> Không cần theo dõi</>
                        )}
                      </span>
                    </div>
                  </div>
                  {selectedEvent.requiresFollowUp && selectedEvent.followUpNotes && (
                    <div className="detail-row">
                      <span className="detail-label">Ghi chú theo dõi:</span>
                      <span className="detail-value">{selectedEvent.followUpNotes}</span>
                    </div>
                  )}
                </div>
                
                {/* Thông tin nhân viên xử lý */}
                <div className="detail-section">
                  <h4 className="detail-section-title">Thông tin nhân viên</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">ID nhân viên:</span>
                      <span className="detail-value">{selectedEvent.staffId || "Không có thông tin"}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Tên nhân viên:</span>
                      <span className="detail-value">{selectedEvent.staffName || "Không có thông tin"}</span>
                    </div>
                  </div>
                </div>
                  {/* Cố tình bỏ phần Thông tin bổ sung như trong yêu cầu */}
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowViewDetailsModal(false)}>
                <i className="fas fa-times"></i> Đóng
              </button>
              <button className="btn btn-primary" onClick={() => { setShowViewDetailsModal(false); handleEdit(selectedEvent.incidentId); }}>
                <i className="fas fa-edit"></i> Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xem chi tiết hoặc thêm/sửa */}
      {showModal && (
        <div className="modal-overlay" onClick={() => !loading && setShowModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {selectedEvent ? 'Chỉnh sửa sự kiện y tế' : 'Thêm mới sự kiện y tế'}
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
                {/* Form thêm/sửa */}
                <form onSubmit={handleSubmit} className="event-form">                  {/* Thông tin học sinh */}
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
                          placeholder="Nhập mã học sinh"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Thông tin sự kiện */}
                  <div className="form-section">
                    <h4>Thông tin sự kiện</h4>                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="incidentType">Loại sự kiện <span className="required">*</span></label>
                        <input
                          type="text"
                          id="incidentType"
                          name="incidentType"
                          value={formData.incidentType}
                          onChange={handleInputChange}
                          placeholder="Nhập loại sự kiện"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="severityLevel">Mức độ <span className="required">*</span></label>
                        <input 
                          type="text" 
                          id="severityLevel" 
                          name="severityLevel"
                          value={formData.severityLevel}
                          onChange={handleInputChange}
                          required
                          placeholder="Nhập mức độ (Mild, Moderate, Severe...)"
                          list="severityLevelList"
                        />
                        <datalist id="severityLevelList">
                          {severityLevels.map((level, index) => (
                            <option key={index} value={level} />
                          ))}
                        </datalist>
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="dateTime">Ngày giờ <span className="required">*</span></label>
                        <input 
                          type="datetime-local" 
                          id="dateTime" 
                          name="dateTime"
                          value={formData.dateTime}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="staffName">Nhân viên xử lý <span className="required">*</span></label>
                        <input 
                          type="text" 
                          id="staffName" 
                          name="staffName"
                          value={formData.staffName}
                          onChange={handleInputChange}
                          required
                          placeholder="Nhập tên nhân viên y tế"
                        />
                      </div>
                    </div>

                    <div className="form-group full-width">
                      <label htmlFor="description">Mô tả</label>
                      <textarea 
                        id="description" 
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="2"
                        placeholder="Mô tả chi tiết về sự kiện y tế"
                      ></textarea>
                    </div>
                    
                    <div className="form-group full-width">
                      <label htmlFor="symptoms">Triệu chứng</label>
                      <textarea 
                        id="symptoms" 
                        name="symptoms"
                        value={formData.symptoms}
                        onChange={handleInputChange}
                        rows="2"
                        placeholder="Mô tả các triệu chứng của học sinh"
                      ></textarea>
                    </div>
                    
                    <div className="form-group full-width">
                      <label htmlFor="treatment">Xử lý/Điều trị</label>
                      <textarea 
                        id="treatment" 
                        name="treatment"
                        value={formData.treatment}
                        onChange={handleInputChange}
                        rows="2"
                        placeholder="Mô tả cách xử lý và điều trị"
                      ></textarea>
                    </div>                      <div className="form-group full-width">
                      <label>Thuốc đã dùng</label>
                      <div className="medications-container">
                        {console.log('Rendering medications:', formData.medicationsUsed)}
                        {formData.medicationsUsed.map((medication, index) => (
                          <div className="medication-item" key={index}>
                            <div className="medication-row">                              <div className="medication-field medication-search-field">                                <label>Tìm kiếm theo tên thuốc:</label>
                                <div className="search-container">
                                  <input 
                                    type="text" 
                                    value={medication.itemName || ''} 
                                    onChange={(e) => handleMedicationChange(index, 'itemName', e.target.value)}
                                    placeholder="Nhập tên thuốc để tìm kiếm"
                                    autoComplete="off"
                                    style={{border: '2px solid #4caf50'}}
                                  />
                                  {medicationSearchLoading[index] && (
                                    <div className="search-loading">
                                      <i className="fas fa-spinner fa-spin"></i>
                                    </div>
                                  )}
                                  {medicationSearchResults[index] && medicationSearchResults[index].length > 0 && (
                                    <div className="search-results">
                                      {medicationSearchResults[index].map(item => (
                                        <div 
                                          key={item.id} 
                                          className="search-result-item"
                                          onClick={() => handleSelectMedication(index, item)}
                                        >
                                          <div className="item-name">{item.name}</div>
                                          <div className="item-details">
                                            <span>ID: {item.id}</span>
                                            <span>SL: {item.quantity}</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                {medication.itemID > 0 && (
                                  <div className="selected-item-info">
                                    ID: <span className="id-badge">{medication.itemID}</span>
                                  </div>
                                )}
                              </div>
                              <div className="medication-field">
                                <label>Số lượng:</label>
                                <input 
                                  type="number" 
                                  value={medication.quantityUsed} 
                                  onChange={(e) => handleMedicationChange(index, 'quantityUsed', e.target.value)}
                                  min="0"
                                  placeholder="Số lượng"
                                />
                              </div>
                              <button 
                                type="button" 
                                className="remove-medication-btn"
                                onClick={() => handleRemoveMedication(index)}
                              >
                                <i className="fas fa-times-circle"></i> Xóa
                              </button>
                            </div>
                          </div>
                        ))}
                        <button 
                          type="button" 
                          className="add-medication-btn" 
                          onClick={handleAddMedication}
                        >
                          <i className="fas fa-plus-circle"></i> Thêm thuốc
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Ghi chú và theo dõi */}
                  <div className="form-section">
                    <h4>Ghi chú và theo dõi</h4>                    <div className="form-group full-width">
                      <label htmlFor="followUpNotes">Ghi chú theo dõi</label>
                      <textarea 
                        id="followUpNotes" 
                        name="followUpNotes"
                        value={formData.followUpNotes}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="Thêm ghi chú và hướng dẫn theo dõi nếu có"
                      ></textarea>
                    </div>
                    
                    <div className="form-row checkbox-row">
                      <div className="form-group checkbox-group">
                        <input 
                          type="checkbox" 
                          id="parentNotified" 
                          name="parentNotified"
                          checked={formData.parentNotified}
                          onChange={handleInputChange}
                        />
                        <label htmlFor="parentNotified">Đã thông báo phụ huynh</label>
                      </div>
                      
                      <div className="form-group checkbox-group">
                        <input 
                          type="checkbox" 
                          id="requiresFollowUp" 
                          name="requiresFollowUp"
                          checked={formData.requiresFollowUp}
                          onChange={handleInputChange}
                        />
                        <label htmlFor="requiresFollowUp">Cần theo dõi tiếp</label>
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="staffId">ID nhân viên</label>
                      <input 
                        type="text" 
                        id="staffId" 
                        name="staffId"
                        value={formData.staffId}
                        onChange={handleInputChange}
                        placeholder="ID nhân viên y tế (nếu có)"
                      />
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
                        <><i className="fas fa-save"></i> {selectedEvent ? 'Cập nhật' : 'Lưu'}</>
                      )}
                    </button>
                  </div>
                </form>
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

export default MedicalIncidentsManagement;
