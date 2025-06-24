import React, { useState, useEffect } from 'react';
import { useMedicalEvents } from '../../../../../context/NurseContext/MedicalEventsContext';
import { useInventory } from '../../../../../context/NurseContext/InventoryContext';
import medicalEventsService from '../../../../../services/APINurse/medicalEventsService';
import './MedicalIncidents.css';

const MedicalIncidentsManagement = () => {  // Sử dụng context để quản lý state và API  
  const { 
    events, 
    loading, 
    error,
    fetchEvents,
    fetchEventById,
    addEvent,
    updateEvent,
    deleteEvent,
    searchEvents,
    searchByType,
    searchByStudentName // Thêm function mới
  } = useMedicalEvents();
  const { items: inventoryItems, fetchItems } = useInventory();
  
  // State cục bộ
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // Thêm hai state này để khắc phục lỗi
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
  
  // State cho tìm kiếm mới
  const [searchType, setSearchType] = useState('name'); // 'name', 'studentId', 'severityLevel'
  const [searchValue, setSearchValue] = useState('');
  const [searchPlaceholder, setSearchPlaceholder] = useState('Nhập tên...');
  
  // Thêm state để theo dõi trạng thái tìm kiếm
  const [searchStatus, setSearchStatus] = useState({
    hasSearched: false,
    resultCount: 0
  });
    // Cập nhật placeholder khi loại tìm kiếm thay đổi
  useEffect(() => {
    switch (searchType) {
      case 'name':
        setSearchPlaceholder('Nhập tên...');
        break;
      case 'studentId':
        setSearchPlaceholder('Nhập mã học sinh...');
        break;
      case 'severityLevel':
        setSearchPlaceholder('Nhập mức độ nghiêm trọng...');
        break;
      default:
        setSearchPlaceholder('Nhập từ khóa tìm kiếm...');
    }
  }, [searchType]);
  
  // Context đã tự động lấy dữ liệu ban đầu
  useEffect(() => {
    // Nếu cần refresh dữ liệu cụ thể trong component này
    if (!events || events.length === 0) {
      fetchEvents();
    }
  }, [fetchEvents, events]);
    // State cho modal xem chi tiết
  const [showViewDetailsModal, setShowViewDetailsModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');
  
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
  };  
  
  // Xử lý mở form thêm mới
  const handleAddNew = () => {
    const now = new Date();
    const formattedDateTime = now.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm
    setFormData({
      studentId: '',
      incidentType: '',
      dateTime: formattedDateTime,
      description: '',
      symptoms: '',
      severityLevel: '',
      treatment: '',
      parentNotified: false,
      requiresFollowUp: false,
      followUpNotes: '',
      staffId: '1',
      staffName: '',
      medicationsUsed: [
        { quantityUsed: 0, itemID: 0 }
      ],
      handledById: 1
    });
    setSelectedEvent(null);
    setShowModal(true);
  };
  
  // Xử lý mở form chỉnh sửa
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
        // Đơn giản hóa dữ liệu thuốc, chỉ lấy itemID và quantityUsed
      const simplifiedMedications = medications.map((med) => ({
        itemID: med.itemID || 0,
        quantityUsed: med.quantityUsed || 0
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
        medicationsUsed: simplifiedMedications,
        handledById: eventData.handledById || 1
      });
      
      setSelectedEvent(eventData);
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
  
  // Xử lý thêm thuốc mới vào danh sách - Đơn giản hóa chỉ có ID và số lượng
  const handleAddMedication = () => {
    setFormData(prevData => ({
      ...prevData,
      medicationsUsed: [...prevData.medicationsUsed, { quantityUsed: 0, itemID: 0 }]
    }));
  };
  
  // Xử lý xóa thuốc khỏi danh sách
  const handleRemoveMedication = (index) => {
    setFormData(prevData => ({
      ...prevData,
      medicationsUsed: prevData.medicationsUsed.filter((_, i) => i !== index)
    }));
  };
    
  // Xử lý thay đổi thông tin thuốc - Đơn giản hóa chỉ nhập ID và số lượng
  const handleMedicationChange = (index, field, value) => {
    const updatedMedications = [...formData.medicationsUsed];
    
    if (field === 'itemID' && typeof value === 'string') {
      // When user is typing in the ID field, treat it as search
      updatedMedications[index] = {
        ...updatedMedications[index],
        itemID: value
      };
      
      // Perform search if value has at least 1 character
      if (value.length >= 1) {
        searchMedicationItems(index, value);
      } else {
        // Clear search results if input is empty
        setMedicationSearchResults(prev => ({
          ...prev,
          [index]: []
        }));
      }
    } else {
      // Handle other fields normally
      updatedMedications[index] = {
        ...updatedMedications[index],
        [field]: field === 'quantityUsed' ? parseInt(value, 10) || 0 : value
      };
    }
    
    setFormData({
      ...formData,
      medicationsUsed: updatedMedications
    });
  };
  
  // Add this function to search medications
  const searchMedicationItems = (index, searchTerm) => {
    setMedicationSearchLoading(prev => ({ ...prev, [index]: true }));
    
    try {
      // Filter inventory items that start with the search term
      const searchTermLower = searchTerm.toLowerCase();
      const results = inventoryItems.filter(item => 
        item.itemName && item.itemName.toLowerCase().startsWith(searchTermLower)
      );
      
      // Update search results for this specific medication index
      setMedicationSearchResults(prev => ({
        ...prev,
        [index]: results
      }));
    } catch (error) {
      console.error('Lỗi khi tìm kiếm thuốc:', error);
    } finally {
      setMedicationSearchLoading(prev => ({ ...prev, [index]: false }));
    }
  };
  
  // Add this function to handle medication selection from dropdown
  const handleSelectMedication = (index, item) => {
    const updatedMedications = [...formData.medicationsUsed];
    updatedMedications[index] = {
      ...updatedMedications[index],
      itemID: item.itemId,
      selectedItem: item
    };
    
    setFormData({
      ...formData,
      medicationsUsed: updatedMedications
    });
    
    // Clear search results after selection
    setMedicationSearchResults(prev => ({
      ...prev,
      [index]: []
    }));
  };
  
  // Không còn cần các hàm tìm kiếm và chọn thuốc nữa vì người dùng nhập trực tiếp ID thuốc
  
  // State để lưu trữ lỗi form
  const [formErrors, setFormErrors] = useState({});
  
  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Use the new validation function
      const validation = validateForm(formData);
      if (!validation.isValid) {
        setFormErrors(validation.errors);
        // Scroll to first error
        const firstErrorField = document.querySelector('.form-error');
        if (firstErrorField) {
          firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }
      
      // Clear any previous errors
      setFormErrors({});
        // Tạo đối tượng dữ liệu đúng định dạng API
      // Đảm bảo medicationsUsed là mảng và loại bỏ các mục không hợp lệ
      let validMedications = [];
      
      if (Array.isArray(formData.medicationsUsed)) {
        validMedications = formData.medicationsUsed
          .filter(med => med && typeof med === 'object')
          .filter(med => med.quantityUsed > 0 && med.itemID > 0)
          .map(med => ({
            quantityUsed: parseInt(med.quantityUsed, 10),
            itemID: parseInt(med.itemID, 10)
          }));
      }
      
      const apiData = {
        incidentType: formData.incidentType || '',
        description: formData.description || '',
        symptoms: formData.symptoms || '',
        severityLevel: formData.severityLevel || '',
        treatment: formData.treatment || '',
        parentNotified: Boolean(formData.parentNotified),
        requiresFollowUp: Boolean(formData.requiresFollowUp),
        followUpNotes: formData.followUpNotes || '',
        handledById: formData.handledById || 1,
        studentId: formData.studentId || '',
        medicationsUsed: validMedications
      };
      
      console.log("Dữ liệu gửi lên API:", apiData);
        
      let result;
      if (selectedEvent) {
        // Cập nhật sử dụng context
        result = await updateEvent(selectedEvent.incidentId, apiData);
        alert("Cập nhật sự kiện y tế thành công!");
      } else {
        // Thêm mới sử dụng context
        result = await addEvent(apiData);
        if (!result) {
          throw new Error("Lỗi khi tạo sự kiện y tế");
        }
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
  
  // Hàm lấy class CSS đơn giản - không phân loại mức độ nghiêm trọng
  const getSeverityClass = (severity) => {
    if (!severity || severity === 'string') return '';
    
    // Trả về '' để không áp dụng class CSS bất kỳ
    return '';
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

  // Form validation function
  const validateForm = (data) => {
    const errors = {};
    
    // Required fields validation
    if (!data.studentId || data.studentId.trim() === '') {
      errors.studentId = 'Vui lòng nhập mã học sinh';
    }
    
    if (!data.incidentType || data.incidentType.trim() === '') {
      errors.incidentType = 'Vui lòng nhập loại sự kiện';
    }
    
    if (!data.severityLevel || data.severityLevel.trim() === '') {
      errors.severityLevel = 'Vui lòng nhập mức độ nghiêm trọng';
    }
    
    if (!data.dateTime) {
      errors.dateTime = 'Vui lòng chọn ngày giờ';
    }
    
    // Additional validation for medications if any are added
    if (data.medicationsUsed && data.medicationsUsed.length > 0) {
      const medicationErrors = [];
      
      data.medicationsUsed.forEach((med, index) => {
        if ((med.itemID && med.itemID > 0 && (!med.quantityUsed || med.quantityUsed < 0)) ||
            (med.quantityUsed && med.quantityUsed > 0 && (!med.itemID || med.itemID <= 0))) {
          medicationErrors[index] = 'Vui lòng nhập đầy đủ thông tin thuốc';
        }
      });
      
      if (medicationErrors.length > 0) {
        errors.medicationsUsed = medicationErrors;
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };
  
  // Xử lý thay đổi loại tìm kiếm
  const handleSearchTypeChange = (e) => {
    setSearchType(e.target.value);
    // Reset giá trị tìm kiếm khi thay đổi loại
    setSearchValue('');
    
    // Cập nhật placeholder tương ứng với loại tìm kiếm
    switch (e.target.value) {
      case 'name':
        setSearchPlaceholder('Nhập tên...');
        break;
      case 'studentId':
        setSearchPlaceholder('Nhập mã học sinh...');
        break;
      case 'severityLevel':
        setSearchPlaceholder('Nhập mức độ nghiêm trọng...');
        break;
      default:
        setSearchPlaceholder('Nhập tên...');
    }
  };
  
  // Xử lý thay đổi giá trị tìm kiếm
  const handleSearchValueChange = (e) => {
    setSearchValue(e.target.value);
  };
    // Xử lý tìm kiếm theo loại
  const handleSearch = async () => {
    // Kiểm tra nếu không có giá trị tìm kiếm
    if (!searchValue.trim()) {
      // Reset filter và hiển thị tất cả
      setFilters({
        studentId: '',
        incidentType: '',
        severityLevel: '',
        fromDate: '',
        toDate: '',
        parentNotified: '',
        requiresFollowUp: ''
      });
      fetchEvents();
      return;
    }
    
    try {
      // Thiết lập filter và thực hiện tìm kiếm dựa trên loại tìm kiếm
      switch (searchType) {
        case 'name':
          // Sử dụng API mới cho tìm kiếm theo tên học sinh
          console.log(`Đang tìm kiếm sự kiện theo tên học sinh: ${searchValue}`);
          const nameResults = await searchByStudentName(searchValue.trim());
          
          // Cập nhật trạng thái tìm kiếm
          setSearchStatus({
            hasSearched: true,
            resultCount: nameResults.length
          });
          
          if (nameResults.length === 0) {
            alert("Không tìm thấy sự kiện y tế nào với tên học sinh này.");
          }
          break;
          
        case 'severityLevel':
          // Sử dụng API cho tìm kiếm theo mức độ nghiêm trọng
          console.log(`Đang tìm kiếm sự kiện theo mức độ nghiêm trọng: ${searchValue}`);
          const results = await searchByType(searchValue.trim());
          
          // Cập nhật trạng thái tìm kiếm
          setSearchStatus({
            hasSearched: true,
            resultCount: results.length
          });
          
          if (results.length === 0) {
            alert("Không tìm thấy sự kiện y tế nào với mức độ nghiêm trọng này.");
          }
          break;
          
        case 'studentId':
          // Sử dụng API filters cho tìm kiếm theo ID học sinh
          const newFilters = {
            ...filters,
            studentId: searchValue.trim(),
            incidentType: '',
            severityLevel: '',
          };
          
          // Cập nhật filters
          setFilters(newFilters);
          
          // Thực hiện tìm kiếm với filters
          setTimeout(() => {
            handleApplyFilters();
          }, 0);
          break;
          
        default:
          break;
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm:", error);
      alert("Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại sau!");
    }
  };
  
  return (
    <main className="medical-events-content">
      {/* Bộ lọc */}      <div className="filter-section">
        <div className="medical-events-header">
          {/* Ô tìm kiếm mới với dropdown */}
          <div className="search-container">
            <div className="search-box">
              <select 
                className="search-type-dropdown" 
                value={searchType} 
                onChange={handleSearchTypeChange}
              >
                <option value="name">Tìm kiếm theo tên</option>
                <option value="studentId">Tìm kiếm theo mã học sinh</option>
                <option value="severityLevel">Tìm kiếm theo mức độ nghiêm trọng</option>
              </select>
              <input 
                type="text"
                className="search-input"
                value={searchValue}
                onChange={handleSearchValueChange}
                placeholder={searchPlaceholder}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button className="search-btn" onClick={handleSearch}>
                Tìm kiếm
              </button>
            </div>
          </div>
          
          {/* Nút thêm sự kiện ở cuối bên phải */}
          <button className="add-event-btn" onClick={handleAddNew}>
            <i className="fas fa-plus"></i> Thêm sự kiện
          </button>
        </div>
        
        {/* Filter row gốc nhưng ẩn đi các ô đã chuyển thành tìm kiếm */}
        <div className="filter-row" style={{ display: 'none' }}>
          {/* Ẩn các filter đã chuyển thành tìm kiếm */}
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
            <input 
              type="text"
              name="incidentType"
              value={filters.incidentType}
              onChange={handleFilterChange}
              placeholder="Nhập loại sự kiện"
            />
          </div>
          
          <div className="filter-item">
            <label>Mức độ:</label>
            <input 
              type="text"
              name="severityLevel"
              value={filters.severityLevel}
              onChange={handleFilterChange}
              placeholder="Nhập mức độ nghiêm trọng"
            />
          </div>
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
              {events.length > 0 ? events.map((event, index) => (
                <tr key={event.incidentId}>
                  <td>{event.incidentId}</td>
                  <td>{event.studentId}</td>
                  <td>{event.studentName}</td>
                  <td>{formatDateTime(event.dateTime)}</td>
                  <td>{event.severityLevel || "Không xác định"}</td>
                  <td className="status-cell">
                    {event.parentNotified ? 
                      <i className="fas fa-check-circle status-icon notified"></i> : 
                      <i className="fas fa-question-circle status-icon not-notified"></i>
                    }
                  </td>
                  <td className="status-cell">
                    {event.requiresFollowUp ? 
                      <i className="fas fa-eye status-icon follow-up"></i> : 
                      <i className="fas fa-check-circle status-icon no-follow-up"></i>
                    }
                  </td>
                  <td className="action-cell">
                    <button 
                      className="btn-view" 
                      onClick={() => handleViewDetails(event.incidentId)}
                      title="Xem chi tiết"
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    <button 
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
              )) : (
                <tr>
                  <td colSpan="8" className="no-data">Không có dữ liệu sự kiện y tế</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal xem chi tiết */}
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
                      <span className="detail-value">
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
                  </div>
                </div>
                
                {/* Thông tin chi tiết */}
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
                
                {/* Thông tin thuốc đã sử dụng */}
                <div className="detail-section">
                  <h4 className="detail-section-title">Thuốc đã sử dụng</h4>
                  <div className="medications-list">
                    {selectedEvent.medicationsUsed ? (
                      <div className="medication-item">
                        <div><strong>Thuốc đã sử dụng:</strong> {selectedEvent.medicationsUsed}</div>
                      </div>
                    ) : (
                      <div className="medication-item">
                        <div className="no-medications">Không có thông tin về thuốc đã sử dụng</div>
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
                  {selectedEvent.followUpNotes && (
                    <div className="detail-row">
                      <span className="detail-label">Ghi chú theo dõi:</span>
                      <span className="detail-value">{selectedEvent.followUpNotes}</span>
                    </div>
                  )}
                </div>
                
                {/* Thông tin nhân sự */}
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
                
                {/* Phần hiển thị hình ảnh nếu có */}
                {selectedEvent.imgUrl && (
                  <div className="detail-section">
                    <h4 className="detail-section-title">Hình ảnh</h4>
                    <div className="image-container">
                      <img 
                        src={selectedEvent.imgUrl} 
                        alt="Hình ảnh sự cố y tế" 
                        className="incident-image clickable"
                        onClick={() => {
                          setSelectedImageUrl(selectedEvent.imgUrl);
                          setShowImageModal(true);
                        }}
                        title="Nhấn để xem ảnh đầy đủ"
                      />
                      <div className="image-caption">
                        <i className="fas fa-search-plus"></i> Nhấn vào hình để xem kích thước đầy đủ
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Thông tin bổ sung */}
                <div className="detail-section">
                  <h4 className="detail-section-title">Thông tin bổ sung</h4>
                  <div className="detail-row">
                    <span className="detail-label">ID Phụ huynh:</span>
                    <span className="detail-value">{selectedEvent.parentID || "Không có thông tin"}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowViewDetailsModal(false)}>
                <i className="fas fa-times"></i> Đóng
              </button>
              <button className="btn btn-primary" onClick={() => {
                setShowViewDetailsModal(false);
                setTimeout(() => handleEdit(selectedEvent.incidentId), 300);
              }}>
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
                        <label htmlFor="studentId">Mã học sinh <span className="required">*</span></label>                        <input 
                          type="text" 
                          id="studentId" 
                          name="studentId"
                          value={formData.studentId}
                          onChange={handleInputChange}
                          required
                          placeholder="Nhập mã học sinh"
                          className={formErrors.studentId ? "input-error" : ""}
                        />
                        {formErrors.studentId && (
                          <div className="form-error">
                            <i className="fas fa-exclamation-circle"></i> {formErrors.studentId}
                          </div>
                        )}
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
                          placeholder="Nhập mức độ (Mild, Moderate, Severe...)"                        />
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
                        {formData.medicationsUsed.map((medication, index) => (
                          <div className="medication-item" key={index}>
                            <div className="medication-row">
                              <div className="medication-field">
                                <label>ID thuốc:</label>
                                <div className="medication-search-container">
                                  <input 
                                    type="text" 
                                    value={medication.itemID || ''} 
                                    onChange={(e) => handleMedicationChange(index, 'itemID', e.target.value)}
                                    placeholder="Nhập tên thuốc..."
                                    style={{border: '2px solid #4caf50'}}
                                    autoComplete="off"
                                  />
                                  
                                  {/* Dropdown results */}
                                  {medicationSearchResults[index] && medicationSearchResults[index].length > 0 && (
                                    <div className="medication-search-results">
                                      {medicationSearchResults[index].map((item) => (
                                        <div 
                                          key={item.itemId} // Thuộc tính key đã có, đảm bảo nó là duy nhất
                                          className="medication-search-item"
                                          onClick={() => handleSelectMedication(index, item)}
                                        >
                                          <span className="item-name">{item.itemName}</span>
                                          <span className="item-details">
                                            {item.itemType} • Còn {item.stockQuantity} {item.unit}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  
                                  {medicationSearchLoading[index] && (
                                    <div className="medication-search-loading">
                                      <i className="fas fa-spinner fa-spin"></i> Đang tìm...
                                    </div>
                                  )}
                                </div>
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

      {/* Thông báo kết quả tìm kiếm */}
      {searchStatus.hasSearched && (
        <div className={`search-result-message ${searchStatus.resultCount > 0 ? 'success' : 'no-result'}`}>
          {searchStatus.resultCount > 0 
            ? `Tìm thấy ${searchStatus.resultCount} kết quả` 
            : "Không tìm thấy kết quả nào phù hợp"}
        </div>
      )}
      
      {/* Modal xem hình ảnh */}
      {showImageModal && selectedImageUrl && (
        <div className="modal-overlay" onClick={() => setShowImageModal(false)}>
          <div className="image-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Hình ảnh chi tiết</h3>
              <button 
                className="close-btn" 
                onClick={() => setShowImageModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="image-modal-body">
              <img 
                src={selectedImageUrl} 
                alt="Hình ảnh chi tiết sự cố y tế" 
                className="full-size-image"
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowImageModal(false)}>
                <i className="fas fa-times"></i> Đóng
              </button>
              <a 
                href={selectedImageUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-primary"
              >
                <i className="fas fa-external-link-alt"></i> Mở trong tab mới
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default MedicalIncidentsManagement;
