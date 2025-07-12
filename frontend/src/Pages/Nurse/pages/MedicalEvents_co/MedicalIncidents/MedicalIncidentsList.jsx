import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useMedicalEvents } from '../../../../../context/NurseContext/MedicalEventsContext';
import MedicalIncidentDetailModal from './MedicalIncidentDetailModal';
import MedicalIncidentAddModal from './MedicalIncidentAddModal';
import MedicalIncidentUpdateModal from './MedicalIncidentUpdateModal';
import './MedicalIncidents.css';
import * as studentService from '../../../../../services/APINurse/studentService';
import { getParentById } from '../../../../../services/APINurse/healthCheckupService';

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
    deleteEvent,
    searchByStudentName,
    searchByFollowUpStatus,
    searchByClassName
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

  // Context đã tự động lấy dữ liệu ban đầu
  useEffect(() => {
    if (!events || events.length === 0) {
      fetchEvents();
    }
  }, [fetchEvents, events]);

  useEffect(() => {
    setDisplayedEvents(events);
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
  };

  // Xử lý thay đổi giá trị tìm kiếm
  const handleSearchValueChange = (e) => {
    setSearchValue(e.target.value);
  };

  // Reset tìm kiếm và hiển thị tất cả
  const handleReset = () => {
    setSearchValue('');
    setSearchStatus({ hasSearched: false, resultCount: 0 });
    fetchEvents(); // Fetches all events, and useEffect syncs it to displayedEvents
  };

  // Xử lý tìm kiếm
  const handleSearch = async () => {
    console.log("=== BẮT ĐẦU TÌM KIẾM ===");
    console.log("Search Type:", searchType);
    console.log("Search Value:", searchValue);
    
    // Client-side search for "class"
    if (searchType === 'class') {
      if (!searchValue.trim()) {
        alert("Vui lòng nhập tên lớp để tìm kiếm");
        return;
      }
      console.log("Thực hiện tìm kiếm theo lớp (Front-end):", searchValue);
      const classNameLower = searchValue.trim().toLowerCase();
      
      const filteredEvents = events.filter(event => {
        // Replicate the working logic from getStudentClassName to find the student
        const student = students.find(s => s.id == event.studentId || s.studentId == event.studentId);
        
        if (student) {
          // If student is found, check if their class name matches the search
          const studentClassName = (student.class || student.className || '').toLowerCase();
          return studentClassName.includes(classNameLower);
        }
        
        return false; // If no student found for the event, don't include it
      });

      setDisplayedEvents(filteredEvents);
      setSearchStatus({
        hasSearched: true,
        resultCount: filteredEvents.length
      });
      console.log("Kết quả tìm kiếm (Front-end):", filteredEvents);
      console.log("=== KẾT THÚC TÌM KIẾM ===");
      return;
    }
    
    // Kiểm tra điều kiện tìm kiếm cho API calls
    if (searchType === 'name' && !searchValue.trim()) {
      alert(`Vui lòng nhập tên học sinh để tìm kiếm`);
      return;
    }
    
    if (searchType === 'followUp' && !searchValue) {
      alert("Vui lòng chọn trạng thái theo dõi");
      return;
    }
    
    try {
      let results = [];
      
      if (searchType === 'name') {
        console.log("Tìm kiếm theo tên học sinh:", searchValue);
        results = await searchByStudentName(searchValue.trim());
      } else if (searchType === 'followUp') {
        console.log("Tìm kiếm theo follow-up:", searchValue);
        const followUpValue = searchValue === 'true';
        results = await searchByFollowUpStatus(followUpValue);
      } else if (searchType === 'class') {
        console.log("Tìm kiếm theo lớp:", searchValue);
        results = await searchByClassName(searchValue.trim());
      }
      
      setSearchStatus({
        hasSearched: true,
        resultCount: results.length
      });
      
      console.log("Kết quả tìm kiếm:", results);
      console.log("=== KẾT THÚC TÌM KIẾM ===");
      
    } catch (error) {
      console.error("Lỗi khi tìm kiếm:", error);
      alert("Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại sau!");
    }
  };

  return (
    <div className="container-fluid">
      {/* Header với Bootstrap */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center bg-light p-3 rounded shadow-sm">
            <h4 className="mb-0 text-primary">
              <i className="fas fa-notes-medical me-2"></i>
              Quản lý sự kiện y tế
            </h4>
            <button 
              className="btn btn-success btn-lg" 
              onClick={handleAddNew}
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
              <h5 className="mb-0">
                <i className="fas fa-search me-2"></i>
                Tìm kiếm sự kiện y tế
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
                <div className="row g-3 align-items-end">
                  {/* Dropdown chọn loại tìm kiếm */}
                  <div className="col-md-3">
                    <label htmlFor="searchType" className="form-label fw-bold">
                      <i className="fas fa-filter me-1"></i>
                      Loại tìm kiếm
                    </label>
                    <select 
                      id="searchType"
                      className="form-select form-select-lg"
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
                  <div className="col-md-5">
                    <label htmlFor="searchValue" className="form-label fw-bold">
                      <i className="fas fa-keyboard me-1"></i>
                      Giá trị tìm kiếm
                    </label>
                    {searchType === 'followUp' ? (
                      <select 
                        id="searchValue"
                        className="form-select form-select-lg"
                        value={searchValue}
                        onChange={handleSearchValueChange}
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
                        placeholder="Nhập tên học sinh cần tìm..."
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      />
                    )}
                  </div>

                  {/* Nút tìm kiếm */}
                  <div className="col-md-2">
                    <button 
                      type="submit"
                      className="btn btn-primary btn-lg w-100"
                      onClick={handleSearch}
                    >
                      <i className="fas fa-search me-2"></i>
                      Tìm kiếm
                    </button>
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
              </form>
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
                <h5 className="mb-0">
                  <i className="fas fa-list me-2"></i>
                  Danh sách sự kiện y tế ({displayedEvents.length} sự kiện)
                </h5>
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
                      {displayedEvents.length > 0 ? displayedEvents.map((event, index) => (
                        <tr key={event.incidentId}>
                          <td className="text-center fw-bold">{index + 1}</td>
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
                                onClick={() => handleDelete(event.incidentId)}
                                title="Xóa"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )) : (
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
