import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useMedicalEvents } from '../../../../../context/NurseContext/MedicalEventsContext';
import MedicalIncidentDetailModal from './MedicalIncidentDetailModal';
import MedicalIncidentAddModal from './MedicalIncidentAddModal';
import MedicalIncidentUpdateModal from './MedicalIncidentUpdateModal';
import './MedicalIncidents.css';
import * as studentService from '../../../../../services/APINurse/studentService';
import { getParentById } from '../../../../../services/APINurse/healthCheckupService';

// CSS để fix dropdown arrows
const dropdownStyles = `
  .medical-incidents-dropdown {
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m1 6 7 7 7-7'/%3e%3c/svg%3e") !important;
    background-repeat: no-repeat !important;
    background-position: right 0.75rem center !important;
    background-size: 16px 12px !important;
    padding-right: 2.25rem !important;
    appearance: none !important;
    -webkit-appearance: none !important;
    -moz-appearance: none !important;
  }
  
  .medical-incidents-dropdown::-ms-expand {
    display: none !important;
  }
  
  /* Xóa bỏ tất cả các icon dropdown khác */
  .medical-incidents-dropdown::after,
  .medical-incidents-dropdown::before {
    display: none !important;
  }
`;

const MedicalIncidentsList = () => {
  // Sử dụng context để quản lý state và API  
  const { 
    events, 
    loading, 
    error,
    fetchEvents,
    fetchEventById,
    addEvent,
    updateEvent,
    deleteEvent
  } = useMedicalEvents();
  
  // State cục bộ
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [students, setStudents] = useState([]);
  const [displayedEvents, setDisplayedEvents] = useState([]);
  
  // State cho modal xem chi tiết
  const [showViewDetailsModal, setShowViewDetailsModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');
  
  // State cho tìm kiếm
  const [searchType, setSearchType] = useState('name');
  const [searchValue, setSearchValue] = useState('');
  
  // State để theo dõi trạng thái tìm kiếm
  const [searchStatus, setSearchStatus] = useState({
    hasSearched: false,
    resultCount: 0
  });

  // State cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage] = useState(10);

  // Context đã tự động lấy dữ liệu ban đầu
  useEffect(() => {
    if (!events || events.length === 0) {
      fetchEvents();
    }
  }, [fetchEvents, events]);

  useEffect(() => {
    setDisplayedEvents(events);
    setCurrentPage(1); // Reset về trang đầu khi dữ liệu thay đổi
  }, [events]);

  useEffect(() => {
    const fetchStudents = async () => {
        try {
            const studentData = await studentService.getAllStudents();
            if (studentData) {
              const studentList = studentData.content ? studentData.content : studentData;
              setStudents(Array.isArray(studentList) ? studentList : []);
            } else {
              setStudents([]);
            }
        } catch (error) {
            console.error("Lỗi khi tải danh sách học sinh:", error);
            toast.error("Không thể tải danh sách học sinh.");
            setStudents([]);
        }
    };
    fetchStudents();
  }, []);

  // Xử lý mở modal chi tiết
  const handleViewDetails = async (id) => {
    try {
      console.log("=== BẮT ĐẦU XEM CHI TIẾT ===");
      console.log("ID sự kiện:", id);
      console.log("Kiểu dữ liệu ID:", typeof id);
      
      if (!id) {
        throw new Error("ID sự kiện không hợp lệ");
      }
      
      console.log("Gọi fetchEventById với ID:", id);
      const eventData = await fetchEventById(id);
      console.log("Kết quả từ fetchEventById:", eventData);
      
      // Đảm bảo rằng eventData không bị null hoặc undefined
      if (!eventData) {
        console.error("eventData is null or undefined");
        throw new Error("Không thể lấy chi tiết sự kiện - dữ liệu trống");
      }
      
      let parentInfo = null;
      if (eventData.parentID) {
          try {
              parentInfo = await getParentById(eventData.parentID);
          } catch (parentError) {
              console.error("Không thể tải thông tin phụ huynh:", parentError);
          }
      }

      // Kiểm tra cấu trúc dữ liệu từ API
      const processedEvent = {
        incidentId: eventData.incidentId || eventData.id || id,
        incidentType: eventData.incidentType || 'Không xác định',
        dateTime: eventData.dateTime || new Date().toISOString(),
        description: eventData.description || 'Không có mô tả',
        symptoms: eventData.symptoms || 'Không có triệu chứng',
        severityLevel: eventData.severityLevel || 'Chưa xác định',
        treatment: eventData.treatment || 'Chưa có điều trị',
        parentNotified: eventData.parentNotified || false,
        requiresFollowUp: eventData.requiresFollowUp || false,
        followUpNotes: eventData.followUpNotes || '',
        staffId: eventData.staffId || '',
        staffName: eventData.staffName || 'Chưa xác định',
        parentID: eventData.parentID || '',
        parentInfo: parentInfo,
        imgUrl: eventData.imgUrl || '',
        imageMedicalUrl: eventData.imageMedicalUrl || eventData.imgUrl || eventData.imageUrl || '',
        studentId: eventData.studentId || '',
        studentName: eventData.studentName || 'Chưa xác định',
        medicationsUsed: eventData.medicationsUsed || 'Không có thông tin thuốc'
      };
      
      console.log("Dữ liệu đã xử lý:", processedEvent);
      setSelectedEvent(processedEvent);
      console.log("Đã set selectedEvent, mở modal...");
      setShowViewDetailsModal(true);
      console.log("=== KẾT THÚC XEM CHI TIẾT THÀNH CÔNG ===");
    } catch (error) {
      console.error("=== LỖI KHI XEM CHI TIẾT ===");
      console.error("Lỗi:", error);
      console.error("Message:", error.message);
      console.error("Stack:", error.stack);
      console.error("=== KẾT THÚC LỖI ===");
      alert(`Không thể tải chi tiết sự kiện. Lỗi: ${error.message}`);
    }
  };

  // Xử lý mở form thêm mới
  const handleAddNew = () => {
    setSelectedEvent(null);
    setShowAddModal(true);
  };

  // Xử lý mở form cập nhật
  const handleEdit = async (id) => {
    try {
      console.log("=== HANDLE EDIT CALLED ===");
      console.log("Event ID:", id);
      console.log("Event ID type:", typeof id);
      
      // Prevent default navigation if this is somehow being called as a link
      event?.preventDefault?.();
      
      const eventData = await fetchEventById(id);
      console.log("Dữ liệu sự kiện cần cập nhật:", eventData);
      
      if (eventData) {
        setSelectedEvent(eventData);
        setShowUpdateModal(true);
        console.log("Update modal should be open now");
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu cập nhật:", error);
      alert("Không thể lấy dữ liệu để cập nhật!");
    }
  };

  // Handle form submission from the add modal
  const handleAddSubmit = async (formData) => {
    try {
      console.log("Submitting add form data:", formData);
      
      const result = await addEvent(formData);
      
      if (result) {
        // Refresh data - context đã tự động cập nhật state
        fetchEvents();
        
        // Đóng modal
        setShowAddModal(false);
        
        return result; // Return success result
      } else {
        // Nếu không có result, vẫn coi là lỗi
        throw new Error('Không thể thêm sự kiện y tế - không có phản hồi từ server');
      }
      
    } catch (error) {
      console.error("Lỗi khi thêm sự kiện y tế:", error);
      throw error; // Re-throw to let the modal handle the error state
    }
  };

  // Handle form submission from the update modal
  const handleUpdateSubmit = async (formData) => {
    try {
      console.log("Submitting update form data:", formData);
      
      const result = await updateEvent(selectedEvent.incidentId || selectedEvent.id, formData);
      
      if (result) {
        // Refresh data - context đã tự động cập nhật state
        fetchEvents();
        
        // Đóng modal
        setShowUpdateModal(false);
        
        return result; // Return success result
      }
      
    } catch (error) {
      console.error("Lỗi khi cập nhật sự kiện y tế:", error);
      throw error; // Re-throw to let the modal handle the error state
    }
  };

  // Xử lý xóa sự kiện
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sự kiện này không?")) {
      try {
        const result = await deleteEvent(id);
        if (result) {
          toast.success("Xóa sự kiện y tế thành công!");
        }
      } catch (error) {
        console.error("Lỗi khi xóa sự kiện:", error);
        toast.error("Không thể xóa sự kiện. Vui lòng thử lại sau.");
      }
    }
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

  const getStudentClassName = (studentId) => {
    if (!students || students.length === 0) return 'Đang tải...';
    const student = students.find(s => s.id === studentId || s.studentId === studentId);
    return student ? (student.class || student.className || 'Chưa có lớp') : 'Không rõ';
  };

  // Hàm lấy class cho Badge dựa trên mức độ nghiêm trọng
  const getSeverityBadgeClass = (severity) => {
    if (!severity) return "bg-secondary";
    
    const severityLower = severity.toLowerCase();
    if (severityLower.includes('nhẹ') || severityLower === 'mild') {
      return "bg-success";
    } else if (severityLower.includes('trung bình') || severityLower === 'moderate') {
      return "bg-warning text-dark";
    } else if (severityLower.includes('nghiêm trọng') || severityLower === 'severe') {
      return "bg-danger";
    }
    
    return "bg-secondary";
  };

  // Xử lý thay đổi loại tìm kiếm
  const handleSearchTypeChange = (e) => {
    setSearchType(e.target.value);
    setSearchValue('');
    setSearchStatus({ hasSearched: false, resultCount: 0 });
    setCurrentPage(1);
    // Reset về hiển thị tất cả khi thay đổi loại tìm kiếm
    fetchEvents();
  };

  // Xử lý thay đổi giá trị tìm kiếm với realtime search
  const handleSearchValueChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    
    // Tìm kiếm realtime
    if (searchType === 'name' && value.trim()) {
      performSearch(searchType, value.trim());
    } else if (searchType === 'class' && value.trim()) {
      performSearch(searchType, value.trim());
    } else if (!value.trim()) {
      // Nếu không có giá trị, hiển thị tất cả
      handleReset();
    }
  };

  // Hàm thực hiện tìm kiếm (tách riêng để dùng chung)
  const performSearch = async (type, value) => {
    console.log("=== BẮT ĐẦU TÌM KIẾM ===");
    console.log("Search Type:", type);
    console.log("Search Value:", value);
    
    try {
      let results = [];
      
      if (type === 'class') {
        // Client-side search for "class"
        console.log("Thực hiện tìm kiếm theo lớp (Front-end):", value);
        const classNameLower = value.toLowerCase();
        
        results = events.filter(event => {
          const student = students.find(s => s.id == event.studentId || s.studentId == event.studentId);
          
          if (student) {
            const studentClassName = (student.class || student.className || '').toLowerCase();
            return studentClassName.includes(classNameLower);
          }
          
          return false;
        });
        
        setDisplayedEvents(results);
        setSearchStatus({
          hasSearched: true,
          resultCount: results.length
        });
        setCurrentPage(1);
        console.log("Kết quả tìm kiếm (Front-end):", results);
      } else if (type === 'name') {
        console.log("Tìm kiếm theo tên học sinh (Front-end):", value);
        const studentNameLower = value.toLowerCase();
        
        // Tìm kiếm client-side theo tên học sinh
        results = events.filter(event => {
          const studentName = (event.studentName || '').toLowerCase();
          return studentName.includes(studentNameLower);
        });
        
        setDisplayedEvents(results);
        setSearchStatus({
          hasSearched: true,
          resultCount: results.length
        });
        setCurrentPage(1);
        console.log("Kết quả tìm kiếm theo tên (Front-end):", results);
      }
      
      console.log("=== KẾT THÚC TÌM KIẾM ===");
      
    } catch (error) {
      console.error("Lỗi khi tìm kiếm:", error);
      console.log("Có lỗi xảy ra khi tìm kiếm!");
    }
  };

  // Reset tìm kiếm và hiển thị tất cả
  const handleReset = () => {
    setSearchValue('');
    setSearchStatus({ hasSearched: false, resultCount: 0 });
    setCurrentPage(1);
    fetchEvents(); // Fetches all events, and useEffect syncs it to displayedEvents
  };

  // Xử lý tìm kiếm cho dropdown followUp
  const handleFollowUpSearch = async (value) => {
    if (!value) {
      handleReset();
      return;
    }
    
    try {
      console.log("Tìm kiếm theo follow-up (Front-end):", value);
      const followUpValue = value === 'true';
      
      // Tìm kiếm client-side theo trạng thái follow-up
      const results = events.filter(event => {
        return event.requiresFollowUp === followUpValue;
      });
      
      setDisplayedEvents(results);
      setSearchStatus({
        hasSearched: true,
        resultCount: results.length
      });
      setCurrentPage(1);
      
      console.log("Kết quả tìm kiếm follow-up (Front-end):", results);
    } catch (error) {
      console.error("Lỗi khi tìm kiếm follow-up:", error);
    }
  };

  // Tính toán dữ liệu cho phân trang
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = displayedEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(displayedEvents.length / eventsPerPage);

  // Xử lý thay đổi trang
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Tạo array số trang để hiển thị
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pageNumbers.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pageNumbers.push(i);
        }
      }
    }
    
    return pageNumbers;
  };

  return (
    <div className="container-fluid">
      {/* Inject CSS để fix dropdown */}
      <style dangerouslySetInnerHTML={{ __html: dropdownStyles }} />
      
      {/* Header với Bootstrap */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center bg-light p-3 rounded shadow-sm">
            <h4 className="mb-0 text-primary">
              <i className="fas fa-notes-medical me-2"></i>
              Quản lý sự kiện y tế
            </h4>
            <button 
              className="btn btn-lg" 
              onClick={handleAddNew}
              style={{ backgroundColor: '#0d6efd', color: 'white' }}
            >
              <i className="fas fa-plus me-2"></i>
              Thêm sự kiện
            </button>
          </div>
        </div>
      </div>

      {/* Bộ lọc với Bootstrap */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0" style={{color : 'white'}}>
                <i className="fas fa-search me-2"></i>
                Tìm kiếm sự kiện y tế
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3 align-items-end">
                {/* Dropdown chọn loại tìm kiếm */}
                <div className="col-md-4">
                  <label htmlFor="searchType" className="form-label fw-bold">
                    <i className="fas fa-filter me-1"></i>
                    Loại tìm kiếm
                  </label>
                  <select 
                    id="searchType"
                    className="form-select form-select-lg medical-incidents-dropdown"
                    value={searchType} 
                    onChange={handleSearchTypeChange}
                  >
                    <option value="name">
                      Theo tên học sinh
                    </option>
                    <option value="class">
                      Theo lớp
                    </option>
                    <option value="followUp">
                      Theo trạng thái theo dõi
                    </option>
                  </select>
                </div>

                {/* Input tìm kiếm */}
                <div className="col-md-6">
                  <label htmlFor="searchValue" className="form-label fw-bold">
                    <i className="fas fa-keyboard me-1"></i>
                    Giá trị tìm kiếm
                  </label>
                  {searchType === 'followUp' ? (
                    <select 
                      id="searchValue"
                      className="form-select form-select-lg medical-incidents-dropdown"
                      value={searchValue}
                      onChange={(e) => {
                        setSearchValue(e.target.value);
                        handleFollowUpSearch(e.target.value);
                      }}
                    >
                      <option value="">-- Chọn trạng thái --</option>
                      <option value="true">
                        Cần theo dõi
                      </option>
                      <option value="false">
                        Không cần theo dõi
                      </option>
                    </select>
                  ) : (
                    <input 
                      id="searchValue"
                      type="text"
                      className="form-control form-control-lg"
                      value={searchValue}
                      onChange={handleSearchValueChange}
                      placeholder={
                        searchType === 'name' 
                          ? "Nhập tên học sinh..." 
                          : "Nhập tên lớp..."
                      }
                    />
                  )}
                </div>

                {/* Nút reset */}
                <div className="col-md-2">
                  <button 
                    type="button"
                    className="btn btn-outline-secondary btn-lg w-100"
                    onClick={handleReset}
                  >
                    <i className="fas fa-redo me-2"></i>
                    Đặt lại
                  </button>
                </div>
              </div>

              {/* Hiển thị trạng thái tìm kiếm */}
              {searchStatus.hasSearched && (
                <div className="row mt-3">
                  <div className="col-12">
                    <div className="alert alert-info mb-0">
                      <i className="fas fa-info-circle me-2"></i>
                      Tìm thấy <strong>{searchStatus.resultCount}</strong> kết quả
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bảng danh sách sự kiện */}
      <div className="row">
        <div className="col-12">
          {loading ? (
            <div className="d-flex justify-content-center my-5">
              <div className="spinner-border text-primary" role="status" style={{width: '3rem', height: '3rem'}}>
                <span className="visually-hidden">Đang tải...</span>
              </div>
            </div>
          ) : (
            <div className="card shadow-sm">
              <div className="card-header bg-success text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0" style={{color : 'white', marginRight : '20px'}}>
                    <i className="fas fa-list me-2"></i>
                    Danh sách sự kiện y tế ({displayedEvents.length} sự kiện)
                  </h5>
                  <small>
                    Trang {currentPage} / {totalPages} 
                    {displayedEvents.length > 0 && (
                      <> (Hiển thị {indexOfFirstEvent + 1} - {Math.min(indexOfLastEvent, displayedEvents.length)})</>
                    )}
                  </small>
                </div>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-striped table-hover mb-0">
                    <thead className="table-primary">
                      <tr className="text-center">
                        <th scope="col">
                          STT
                        </th>
                        <th scope="col">
                          <i className="fas fa-id-badge me-1"></i>
                          ID
                        </th>
                        <th scope="col">
                          <i className="fas fa-id-card me-1"></i>
                          Mã học sinh
                        </th>
                        <th scope="col">
                          <i className="fas fa-user me-1"></i>
                          Tên học sinh
                        </th>
                        <th scope="col">
                          <i className="fas fa-school me-1"></i>
                          Lớp
                        </th>
                        <th scope="col">
                          <i className="fas fa-clock me-1"></i>
                          Thời gian
                        </th>
                        <th scope="col">
                          <i className="fas fa-exclamation-triangle me-1"></i>
                          Mức độ
                        </th>
                        <th scope="col">
                          <i className="fas fa-bell me-1"></i>
                          Thông báo PH
                        </th>
                        <th scope="col">
                          <i className="fas fa-eye me-1"></i>
                          Theo dõi
                        </th>
                        <th scope="col">
                          <i className="fas fa-cogs me-1"></i>
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentEvents.length > 0 ? currentEvents.map((event, index) => (
                        <tr key={event.incidentId}>
                          <td className="text-center fw-bold">{indexOfFirstEvent + index + 1}</td>
                          <td className="text-center">
                            <span className="badge bg-primary">{event.incidentId}</span>
                          </td>
                          <td>
                            <code>{event.studentId}</code>
                          </td>
                          <td>
                            <strong>{event.studentName}</strong>
                          </td>
                          <td>
                            {getStudentClassName(event.studentId)}
                          </td>
                          <td className="text-center">
                            <small>{formatDateTime(event.dateTime)}</small>
                          </td>
                          <td className="text-center">
                            <span className={`badge ${getSeverityBadgeClass(event.severityLevel)}`}>
                              {event.severityLevel}
                            </span>
                          </td>
                          <td className="text-center">
                            {event.parentNotified ? (
                              <span className="badge bg-success">
                                <i className="fas fa-check me-1"></i> Đã thông báo
                              </span>
                            ) : (
                              <span className="badge bg-warning text-dark">
                                <i className="fas fa-times me-1"></i> Chưa thông báo
                              </span>
                            )}
                          </td>
                          <td className="text-center">
                            {event.requiresFollowUp ? (
                              <span className="badge bg-info">
                                <i className="fas fa-eye me-1"></i> Cần theo dõi
                              </span>
                            ) : (
                              <span className="badge bg-secondary">
                                <i className="fas fa-check-circle me-1"></i> Không cần
                              </span>
                            )}
                          </td>
                          <td className="text-center">
                            <div className="btn-group" role="group">
                              <button
                                className="btn btn-outline-info btn-sm"
                                onClick={() => handleViewDetails(event.incidentId)}
                                title="Xem chi tiết"
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                              <button
                                className="btn btn-outline-warning btn-sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  console.log("Edit button clicked for event:", event.incidentId);
                                  handleEdit(event.incidentId);
                                }}
                                title="Chỉnh sửa"
                                type="button"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDelete(event.incidentId);
                                }}
                                title="Xóa"
                                style={{ 
                                  transition: 'none',
                                  border: '1px solid #dc3545',
                                  color: '#dc3545'
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.backgroundColor = '#dc3545';
                                  e.target.style.color = 'white';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.backgroundColor = 'transparent';
                                  e.target.style.color = '#dc3545';
                                }}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>                        )) : (
                        <tr>
                          <td colSpan="10" className="text-center py-5">
                            <div className="text-muted">
                              <i className="fas fa-info-circle fa-2x mb-3"></i>
                              <h5>Không có dữ liệu</h5>
                              <p>Không tìm thấy sự kiện y tế nào</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Phân trang */}
              {displayedEvents.length > eventsPerPage && (
                <div className="card-footer">
                  <nav aria-label="Phân trang sự kiện y tế">
                    <ul className="pagination justify-content-center mb-0">
                      {/* Nút Previous */}
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button 
                          className="page-link"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <i className="fas fa-chevron-left"></i> Trước
                        </button>
                      </li>
                      
                      {/* Nút trang đầu */}
                      {currentPage > 3 && (
                        <>
                          <li className="page-item">
                            <button 
                              className="page-link"
                              onClick={() => handlePageChange(1)}
                            >
                              1
                            </button>
                          </li>
                          {currentPage > 4 && (
                            <li className="page-item disabled">
                              <span className="page-link">...</span>
                            </li>
                          )}
                        </>
                      )}
                      
                      {/* Các số trang */}
                      {getPageNumbers().map(number => (
                        <li 
                          key={number} 
                          className={`page-item ${currentPage === number ? 'active' : ''}`}
                        >
                          <button 
                            className="page-link"
                            onClick={() => handlePageChange(number)}
                          >
                            {number}
                          </button>
                        </li>
                      ))}
                      
                      {/* Nút trang cuối */}
                      {currentPage < totalPages - 2 && (
                        <>
                          {currentPage < totalPages - 3 && (
                            <li className="page-item disabled">
                              <span className="page-link">...</span>
                            </li>
                          )}
                          <li className="page-item">
                            <button 
                              className="page-link"
                              onClick={() => handlePageChange(totalPages)}
                            >
                              {totalPages}
                            </button>
                          </li>
                        </>
                      )}
                      
                      {/* Nút Next */}
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button 
                          className="page-link"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Sau <i className="fas fa-chevron-right"></i>
                        </button>
                      </li>
                    </ul>
                  </nav>
                  
                  {/* Thông tin phân trang */}
                  <div className="text-center mt-2">
                    <small className="text-muted">
                      Hiển thị {indexOfFirstEvent + 1} - {Math.min(indexOfLastEvent, displayedEvents.length)} 
                      <div style={{marginRight: '20px'}}></div>trong tổng số {displayedEvents.length} sự kiện y tế
                    </small>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <MedicalIncidentDetailModal
        show={showViewDetailsModal}
        selectedEvent={selectedEvent}
        onClose={() => setShowViewDetailsModal(false)}
        onEdit={handleEdit}
        showImageModal={showImageModal}
        setShowImageModal={setShowImageModal}
        selectedImageUrl={selectedImageUrl}
        setSelectedImageUrl={setSelectedImageUrl}
      />

      <MedicalIncidentAddModal
        show={showAddModal}
        selectedEvent={null}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddSubmit}
        loading={loading}
      />

      <MedicalIncidentUpdateModal
        show={showUpdateModal}
        selectedEvent={selectedEvent}
        onClose={() => setShowUpdateModal(false)}
        onSubmit={handleUpdateSubmit}
        loading={loading}
      />
    </div>
  );
};

export default MedicalIncidentsList;
