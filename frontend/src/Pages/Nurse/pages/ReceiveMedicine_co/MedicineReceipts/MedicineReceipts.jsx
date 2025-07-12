import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Form,
  Button,
  Spinner,
  Modal,
  InputGroup,
  Dropdown,
  Alert,
} from "react-bootstrap";
import {
  FaEye,
  FaCheck,
  FaCheckCircle,
  FaSyncAlt,
  FaTimesCircle,
  FaAngleLeft,
  FaAngleRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaPlus,
  FaCamera,
  FaUpload,
  FaTimes,
  FaImage,
} from "react-icons/fa";
import "./MedicineReceipts.css";
import { useMedicineApproval } from "../../../../../context/NurseContext/MedicineApprovalContext";
import receiveMedicineService from "../../../../../services/APINurse/receiveMedicineService";

// Hàm chuyển đổi status thành text và style - Updated to match backend Status enum
const getStatusInfo = (status) => {
  // Xử lý trường hợp status là số (legacy support)
  if (typeof status === 'number') {
    switch (status) {
      case 0:
        return {
          text: "Chờ phê duyệt",
          class: "warning",
        };
      case 1:
        return {
          text: "Đã duyệt",
          class: "info",
        };
      case 2:
        return {
          text: "Từ chối",
          class: "danger",
        };
      default:
        return {
          text: "Không xác định",
          class: "secondary",
        };
    }
  }
  
  // Xử lý trường hợp status là chuỗi - Complete Status enum support
  switch(status) {
    case "PENDING_APPROVAL":
      return {
        text: "Chờ phê duyệt",
        class: "warning",
      };
    case "APPROVED":
      return {
        text: "Đã duyệt",
        class: "info",
      };
    case "REJECTED":
      return {
        text: "Từ chối",
        class: "danger",
      };
    case "FULLY_TAKEN":
      return {
        text: "Đã hoàn thành",
        class: "success",
      };
    case "PARTIALLY_TAKEN":
      return {
        text: "Hoàn thành một phần",
        class: "warning",
      };
    case "EXPIRED":
      return {
        text: "Đã hết hạn",
        class: "danger",
      };
    default:
      return {
        text: "Không xác định",
        class: "secondary",
      };
  }
};

const MedicineReceipts = () => {
  const {
    medicineRequests,
    loading,
    error,
    fetchMedicineRequests,
    processMedicineRequest,
  } = useMedicineApproval();

  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [pendingProcessId, setPendingProcessId] = useState(null);
  const [processData, setProcessData] = useState({
    decision: "APPROVED",
    reason: "",
  });

  // Medication Administration states
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showMedicineImageModal, setShowMedicineImageModal] = useState(false);
  const [selectedMedicineImage, setSelectedMedicineImage] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [pendingAdministrationId, setPendingAdministrationId] = useState(null);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState(null);
  
  // State for form data
  const [formData, setFormData] = useState({
    medicationInstructionId: '',
    administeredAt: '',
    notes: '',
    imgUrl: ''
  });

  // State for image upload
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  // State for dropdown z-index fix
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Default to 10 records per page

  // Date filter state
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  // Helper function to get current time in datetime-local format
  const getCurrentDateTime = () => {
    const now = new Date();
    // Subtract 1 minute to ensure we're not in the future
    now.setMinutes(now.getMinutes() - 1);
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Helper function to get minimum allowed date (start date)
  const getMinDateTime = () => {
    if (!selectedRequest || !selectedRequest.startDate) {
      return '';
    }
    
    const startDate = new Date(selectedRequest.startDate);
    const year = startDate.getFullYear();
    const month = String(startDate.getMonth() + 1).padStart(2, '0');
    const day = String(startDate.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}T00:00`;
  };

  // Helper function to get maximum allowed date (end date or current time)
  const getMaxDateTime = () => {
    const currentDate = new Date();
    
    if (selectedRequest && selectedRequest.endDate) {
      const endDate = new Date(selectedRequest.endDate);
      endDate.setHours(23, 59, 59, 999);
      
      // Allow selection up to the end date, even if it's in the future
      // But don't allow times beyond current time if end date is today or future
      const maxDate = endDate;
      
      const year = maxDate.getFullYear();
      const month = String(maxDate.getMonth() + 1).padStart(2, '0');
      const day = String(maxDate.getDate()).padStart(2, '0');
      
      // If end date is today, limit to current time, otherwise allow full end date
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endDateDay = new Date(endDate);
      endDateDay.setHours(0, 0, 0, 0);
      
      if (endDateDay.getTime() === today.getTime()) {
        // End date is today, limit to current time
        const hours = String(currentDate.getHours()).padStart(2, '0');
        const minutes = String(currentDate.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      } else {
        // End date is not today, allow full end date
        return `${year}-${month}-${day}T23:59`;
      }
    }
    
    // If no end date, use current time
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchMedicineRequests();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdownId && !event.target.closest('.dropdown')) {
        setOpenDropdownId(null);
      }
    };

    if (openDropdownId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openDropdownId]);

  // Medication Administration functions
  const handleRecordAdministration = (request) => {
    setSelectedRequest(request);
    setFormData({
      medicationInstructionId: request.id,
      administeredAt: getCurrentDateTime(),
      notes: '',
      imgUrl: ''
    });
    setShowAdminModal(true);
  };

  // Reset form to initial state
  const resetAdminForm = () => {
    setFormData({
      medicationInstructionId: '',
      administeredAt: getCurrentDateTime(),
      notes: '',
      imgUrl: ''
    });
    setSelectedImage(null);
    setImagePreview(null);
    setAdminError(null);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setAdminError('Vui lòng chọn file ảnh hợp lệ');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setAdminError('Kích thước file không được vượt quá 5MB');
        return;
      }
      
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
      
      setAdminError(null);
    }
  };

  // Handle administration form submission
  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setAdminLoading(true);
      setAdminError(null);
      
      // Validate required fields
      if (!formData.medicationInstructionId) {
        setAdminError('Vui lòng chọn yêu cầu thuốc');
        return;
      }
      
      if (!formData.administeredAt) {
        setAdminError('Vui lòng chọn thời gian thực hiện');
        return;
      }

      // Prepare data for API
      const selectedDateTime = new Date(formData.administeredAt);
      const currentTime = new Date();
      
      // Validate against start date
      if (selectedRequest && selectedRequest.startDate) {
        const startDate = new Date(selectedRequest.startDate);
        startDate.setHours(0, 0, 0, 0); // Set to beginning of start date
        
        if (selectedDateTime < startDate) {
          const formattedStartDate = startDate.toLocaleDateString('vi-VN');
          setAdminError(`Thời gian ghi nhận không được trước ngày bắt đầu: ${formattedStartDate}`);
          return;
        }
      }
      
      // Validate against end date if exists
      if (selectedRequest && selectedRequest.endDate) {
        const endDate = new Date(selectedRequest.endDate);
        endDate.setHours(23, 59, 59, 999); // Set to end of end date
        
        if (selectedDateTime > endDate) {
          const formattedEndDate = endDate.toLocaleDateString('vi-VN');
          setAdminError(`Thời gian ghi nhận không được sau ngày kết thúc: ${formattedEndDate}`);
          return;
        }
      }
      
      // Validate against future time (but allow future dates within medication period)
      if (selectedDateTime > currentTime) {
        setAdminError('Thời gian ghi nhận không được là thời gian tương lai');
        return;
      }
      
      const submitData = {
        medicationInstructionId: Number(formData.medicationInstructionId),
        administeredAt: selectedDateTime.toISOString(),
        notes: formData.notes || '',
        imgUrl: formData.imgUrl || ''
      };

      // Create medication administration record
      const result = await receiveMedicineService.createMedicationAdministration(submitData);
      
      if (result.success) {
        // If image is selected, upload it
        if (selectedImage && result.data?.id) {
          setPendingAdministrationId(result.data.id);
          setShowImageModal(true);
        } else {
          // Success without image
          alert(`✅ Đã ghi nhận việc cung cấp thuốc thành công!\n\n📋 Mã bản ghi: #${result.data?.id}`);
          setShowAdminModal(false);
          resetAdminForm();
          
          // Trigger a custom event to refresh history data
          window.dispatchEvent(new CustomEvent('medicationAdministrationCreated'));
        }
      } else {
        // Display server error message on screen
        const errorMessage = result.message || 'Không thể ghi nhận việc cung cấp thuốc';
        setAdminError(errorMessage);
      }
    } catch (err) {
      console.error('Error submitting medication administration:', err);
      
      // Enhanced error handling to display server response
      let errorMessage = 'Có lỗi xảy ra khi ghi nhận việc cung cấp thuốc';
      
      if (err.response) {
        // Server responded with error status
        const status = err.response.status;
        const serverMessage = err.response.data;
        
        if (status === 400) {
          // Handle 400 Bad Request specifically
          if (typeof serverMessage === 'string') {
            // Direct error message from server
            if (serverMessage.includes('Administration date cannot be before medication start date')) {
              errorMessage = 'Thời gian ghi nhận không được trước ngày bắt đầu của đơn thuốc';
            } else if (serverMessage.includes('Administration date cannot be after medication end date')) {
              errorMessage = 'Thời gian ghi nhận không được sau ngày kết thúc của đơn thuốc';
            } else if (serverMessage.includes('Administration date cannot be in the future')) {
              errorMessage = 'Thời gian ghi nhận không được là thời gian tương lai';
            } else {
              errorMessage = `Lỗi xác thực: ${serverMessage}`;
            }
          } else if (serverMessage && serverMessage.message) {
            // Structured error response
            errorMessage = `Lỗi xác thực: ${serverMessage.message}`;
          } else if (serverMessage && serverMessage.error) {
            errorMessage = `Lỗi xác thực: ${serverMessage.error}`;
          } else {
            errorMessage = 'Dữ liệu gửi lên không hợp lệ. Vui lòng kiểm tra lại thông tin.';
          }
        } else if (status === 401) {
          errorMessage = 'Bạn không có quyền thực hiện thao tác này';
        } else if (status === 403) {
          errorMessage = 'Truy cập bị từ chối';
        } else if (status === 404) {
          errorMessage = 'Không tìm thấy đơn thuốc này';
        } else if (status === 422) {
          errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
        } else if (status >= 500) {
          errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau.';
        } else {
          errorMessage = `Lỗi ${status}: ${serverMessage || 'Không thể thực hiện thao tác'}`;
        }
      } else if (err.request) {
        // Network error
        errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
      } else {
        // Other error
        errorMessage = err.message || 'Có lỗi không xác định xảy ra';
      }
      
      // Display the error message on screen
      setAdminError(errorMessage);
    } finally {
      setAdminLoading(false);
    }
  };

  // Handle image upload
  const handleImageUpload = async () => {
    if (!selectedImage || !pendingAdministrationId) {
      setAdminError('Thiếu thông tin để tải lên ảnh');
      return;
    }

    try {
      setUploadLoading(true);
      setAdminError(null);

      const result = await receiveMedicineService.uploadConfirmationImage(
        pendingAdministrationId,
        selectedImage
      );

      if (result.success) {
        alert(`✅ Đã tải lên ảnh xác nhận thành công!\n\n📋 Mã bản ghi: #${pendingAdministrationId}`);
        setShowImageModal(false);
        setShowAdminModal(false);
        resetAdminForm();
        setPendingAdministrationId(null);
        
        // Trigger a custom event to refresh history data
        window.dispatchEvent(new CustomEvent('medicationAdministrationCreated'));
      } else {
        setAdminError(result.message || 'Không thể tải lên ảnh xác nhận');
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setAdminError('Có lỗi xảy ra khi tải lên ảnh');
    } finally {
      setUploadLoading(false);
    }
  };

  // Handle skip image upload
  const handleSkipImage = () => {
    alert('Đã ghi nhận việc cung cấp thuốc thành công!');
    setShowImageModal(false);
    setShowAdminModal(false);
    resetAdminForm();
    setPendingAdministrationId(null);
  };

  // Handle viewing medicine image sent by parents
  const handleViewMedicineImage = (imageUrl) => {
    if (imageUrl) {
      setSelectedMedicineImage(imageUrl);
      setShowMedicineImageModal(true);
    }
  };

  // Xử lý khi nhân viên muốn xử lý yêu cầu thuốc (phê duyệt hoặc từ chối)
  const handleProcessClick = (id, initialDecision = "APPROVED") => {
    setPendingProcessId(id);
    setProcessData({
      decision: initialDecision,
      reason: "",
    });
    setShowProcessModal(true);
  };

  // Xử lý khi nhân viên thay đổi dữ liệu form xử lý
  const handleProcessDataChange = (e) => {
    const { name, value } = e.target;
    setProcessData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Xử lý khi nhân viên xác nhận xử lý yêu cầu thuốc
  const handleConfirmProcess = async () => {
    try {
      if (!["APPROVED", "REJECTED"].includes(processData.decision)) {
        alert("Quyết định không hợp lệ. Chỉ có thể là APPROVED hoặc REJECTED");
        return;
      }

      if (processData.decision === "REJECTED" && !processData.reason?.trim()) {
        alert("Vui lòng nhập lý do từ chối");
        return;
      }

      const requestData = {
        decision: processData.decision,
        reason: processData.decision === "REJECTED" ? processData.reason : null,
        reasonProvidedWhenRequired: processData.decision === "REJECTED",
      };

      const result = await processMedicineRequest(pendingProcessId, requestData);

      if (result.success) {
        setShowProcessModal(false);
        alert(`Đã ${processData.decision === "APPROVED" ? "phê duyệt" : "từ chối"} yêu cầu thuốc thành công!`);
        fetchMedicineRequests();
      } else {
        alert(`Không thể xử lý yêu cầu: ${result.message || "Đã xảy ra lỗi"}`);
      }
    } catch (err) {
      console.error("Lỗi khi xử lý yêu cầu thuốc:", err);
      alert("Có lỗi xảy ra khi xử lý yêu cầu thuốc. Vui lòng thử lại sau.");
    }
  };

  // Lọc và sắp xếp đơn thuốc theo trạng thái và ngày
  const filteredMedicineRequests = medicineRequests.filter((medicine) => {
    // Filter by status
    let statusMatch = true;
    if (filterStatus !== "all") {
      if (typeof medicine.status === "number") {
        // Legacy numeric status support
        switch (filterStatus) {
          case "PENDING_APPROVAL":
            statusMatch = medicine.status === 0;
            break;
          case "APPROVED":
            statusMatch = medicine.status === 1;
            break;
          case "REJECTED":
            statusMatch = medicine.status === 2;
            break;
          // Add more numeric mappings if needed for new statuses
          default:
            statusMatch = false;
        }
      } else {
        // String status comparison - supports all Status enum values
        statusMatch = medicine.status === filterStatus;
      }
    }

    // Filter by date range - check for overlap between medicine period and filter range
    let dateMatch = true;
    if (dateRange.startDate || dateRange.endDate) {
      const medicineStartDate = new Date(medicine.startDate);
      medicineStartDate.setHours(0, 0, 0, 0); // Normalize to start of day
      
      const medicineEndDate = medicine.endDate ? new Date(medicine.endDate) : new Date(medicine.startDate);
      medicineEndDate.setHours(23, 59, 59, 999); // Normalize to end of day
      
      // Set up filter dates
      let filterStartDate = null;
      let filterEndDate = null;
      
      if (dateRange.startDate) {
        filterStartDate = new Date(dateRange.startDate);
        filterStartDate.setHours(0, 0, 0, 0); // Start of day
      }
      
      if (dateRange.endDate) {
        filterEndDate = new Date(dateRange.endDate);
        filterEndDate.setHours(23, 59, 59, 999); // End of day
      }
      
      // Check for overlap between medicine period and filter period
      // Medicine overlaps with filter if:
      // - Medicine end date >= filter start date (or no filter start date)
      // - Medicine start date <= filter end date (or no filter end date)
      if (filterStartDate && medicineEndDate < filterStartDate) {
        dateMatch = false; // Medicine ends before filter starts
      }
      
      if (filterEndDate && medicineStartDate > filterEndDate) {
        dateMatch = false; // Medicine starts after filter ends
      }
    }

    return statusMatch && dateMatch;
  }).sort((a, b) => {
    // Sort by end date: current (newest) to older
    // Handle cases where endDate might be null or undefined
    const dateA = a.endDate ? new Date(a.endDate) : new Date(0); // Use epoch date for null endDate
    const dateB = b.endDate ? new Date(b.endDate) : new Date(0); // Use epoch date for null endDate
    
    // Sort in descending order (newest first)
    return dateB.getTime() - dateA.getTime();
  });

  // Pagination logic
  const totalItems = filteredMedicineRequests.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedRequests = filteredMedicineRequests.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Handle page size change
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, dateRange.startDate, dateRange.endDate]);

  // Xem chi tiết đơn nhận thuốc
  const handleViewDetail = (receipt) => {
    setSelectedReceipt(receipt);
    setShowDetail(true);
  };

  // Đóng form chi tiết
  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedReceipt(null);
  };

  // Handle selection from dropdown
  const handleActionSelect = (id, action) => {
    setOpenDropdownId(null); // Close dropdown
    handleProcessClick(id, action);
  };

  // Handle dropdown show/hide for z-index fix
  const handleDropdownToggle = (id, isOpen) => {
    setOpenDropdownId(isOpen ? id : null);
  };

  // Handle date range changes
  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Clear date filters
  const clearDateFilters = () => {
    setDateRange({
      startDate: "",
      endDate: "",
    });
    setCurrentPage(1);
  };

  // Check if medication administration can be recorded
  const canRecordAdministration = (status, medicine = null) => {
    // Basic status check first
    const validStatuses = status === "APPROVED" || status === 1 || status === "PARTIALLY_TAKEN";
    
    if (!validStatuses) {
      return false;
    }
    
    // If medicine object is provided and has endDate, check if it's in the past
    if (medicine && medicine.endDate) {
      const endDate = new Date(medicine.endDate);
      endDate.setHours(23, 59, 59, 999); // Set to end of the end date
      const currentTime = new Date();
      
      // If end date has passed, don't allow recording (even for PARTIALLY_TAKEN)
      if (currentTime > endDate) {
        return false;
      }
    }
    
    // Allow recording for:
    // - APPROVED: Medication approved and ready to start administering
    // - PARTIALLY_TAKEN: Some doses given, but more doses still needed (and not past end date)
    // 
    // Do NOT allow recording for:
    // - REJECTED: Medication request was rejected
    // - EXPIRED: Medication period expired without any doses
    // - FULLY_TAKEN: All required doses have been completed
    // - PENDING_APPROVAL: Still waiting for approval
    // - PARTIALLY_TAKEN with past end date: Can no longer administer medication
    return true;
  };

  // Check if request is approved (legacy function, still used in detail modal)
  const isApproved = (status) => {
    return status === "APPROVED" || status === 1;
  };

  return (
    <Container fluid className="medicine-receipts-container p-4">
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white py-3">
          <Row className="align-items-center">
            <Col>
              <h5 className="mb-0 fw-bold">Đơn nhận thuốc</h5>
            </Col>
            <Col xs="auto" className="d-flex align-items-center">
              <Form.Group className="me-3 mb-0">
                <InputGroup>
                  <InputGroup.Text>Trạng thái:</InputGroup.Text>
                  <Form.Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">Tất cả</option>
                    <option value="PENDING_APPROVAL">Chờ phê duyệt</option>
                    <option value="APPROVED">Đã duyệt</option>
                    <option value="REJECTED">Từ chối</option>
                    <option value="FULLY_TAKEN">Đã hoàn thành</option>
                    <option value="PARTIALLY_TAKEN">Hoàn thành một phần</option>
                    <option value="EXPIRED">Đã hết hạn</option>
                  </Form.Select>
                </InputGroup>
              </Form.Group>
              <Button
                variant="outline-primary"
                onClick={fetchMedicineRequests}
                className="d-flex align-items-center"
              >
                <FaSyncAlt className="me-1" /> Làm mới
              </Button>
            </Col>
          </Row>
          
          {/* Compact Date Range Filter */}
          <Row className="mt-3 justify-content-end">
            <Col xs="auto">
              <div className="date-range-filter">
                <div className="date-inputs">
                  <Form.Control
                    type="date"
                    size="sm"
                    placeholder="Từ ngày"
                    value={dateRange.startDate}
                    onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                    className="date-input"
                  />
                  <span className="date-separator">-</span>
                  <Form.Control
                    type="date"
                    size="sm"
                    placeholder="Đến ngày"
                    value={dateRange.endDate}
                    onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                    className="date-input"
                  />
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={clearDateFilters}
                    className="clear-dates-btn"
                    title="Xóa bộ lọc ngày"
                  >
                    ×
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Đang tải dữ liệu...</p>
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : (
            <div className="medicine-receipts-list">
              {totalItems === 0 ? (
                <Alert variant="info">Không có đơn nhận thuốc nào</Alert>
              ) : (
                <>
                  <div className="mb-3 d-flex justify-content-between align-items-center">
                    
                  </div>
                  
                  <Table hover responsive className="align-middle mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th>ID</th>
                        <th>Tên học sinh</th>
                        <th>Người yêu cầu</th>
                        <th>Ngày bắt đầu</th>
                        <th>Ngày kết thúc</th>
                        <th className="medicine-image-column">Ảnh thuốc</th>
                        <th >Trạng thái</th>
                        <th className="text-center">Ghi nhận</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedRequests.map((medicine) => {
                      const statusInfo = getStatusInfo(medicine.status);
                      const isDropdownOpen = openDropdownId === medicine.id;
                      return (
                        <tr 
                          key={medicine.id}
                          className={isDropdownOpen ? 'dropdown-active' : ''}
                        >
                          <td className="fw-bold">{medicine.id}</td>
                          <td>{medicine.studentName}</td>
                          <td>{medicine.requestedBy}</td>
                          <td>
                            {new Date(medicine.startDate).toLocaleDateString("vi-VN")}
                          </td>
                          <td>
                            {medicine.endDate ? new Date(medicine.endDate).toLocaleDateString("vi-VN") : "Không có"}
                          </td>
                          <td className="text-center medicine-image-column">
                            {(() => {
                              const hasImage = medicine.prescriptionImageUrl || medicine.medicationImageUrl || medicine.imageUrl;
                              return hasImage ? (
                                <Button
                                  variant="outline-info"
                                  size="sm"
                                  className="medicine-image-btn"
                                  title="Xem ảnh thuốc"
                                  onClick={() => handleViewMedicineImage(medicine.prescriptionImageUrl || medicine.medicationImageUrl || medicine.imageUrl)}
                                >
                                  <FaEye className="me-1" />
                                  Xem ảnh
                                </Button>
                              ) : (
                                <span className="badge bg-secondary no-medicine-image-badge">
                                  <FaImage className="me-1" />
                                  Không có ảnh
                                </span>
                              );
                            })()}
                          </td>
                          <td>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "0.5rem 0.75rem",
                                borderRadius: "30px",
                                fontWeight: "600",
                                fontSize: "0.85rem",
                                textAlign: "center",
                                minWidth: "120px",
                                backgroundColor:
                                  statusInfo.text === "Chờ phê duyệt"
                                    ? "#FFC107"
                                    : statusInfo.text === "Đã duyệt"
                                    ? "#17A2B8"
                                    : statusInfo.text === "Từ chối"
                                    ? "#DC3545"
                                    : statusInfo.text === "Đã hoàn thành"
                                    ? "#28A745"
                                    : statusInfo.text === "Hoàn thành một phần"
                                    ? "#FFC107"
                                    : statusInfo.text === "Đã hết hạn"
                                    ? "#DC3545"
                                    : "#6C757D",
                                color:
                                  statusInfo.text === "Chờ phê duyệt" ||
                                  statusInfo.text === "Hoàn thành một phần" ||
                                  statusInfo.text === "Không xác định"
                                    ? "#212529"
                                    : "#FFFFFF",
                                border:
                                  statusInfo.text === "Không xác định"
                                    ? "1px solid #DEE2E6"
                                    : "none",
                              }}
                            >
                              {statusInfo.text}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex justify-content-center gap-2">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleViewDetail(medicine)}
                                title="Xem chi tiết"
                              >
                                <FaEye />
                              </Button>

                              {/* Show Record Administration button for approved and partially taken requests */}
                              {canRecordAdministration(medicine.status, medicine) && (
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  onClick={() => handleRecordAdministration(medicine)}
                                  title={medicine.status === "PARTIALLY_TAKEN" ? "Tiếp tục ghi nhận cung cấp thuốc" : "Ghi nhận cung cấp thuốc"}
                                >
                                  <FaPlus />
                                </Button>
                              )}

                              {/* Show Approve/Reject actions for pending requests */}
                              {(medicine.status === "PENDING_APPROVAL" || medicine.status === 0) && (
                                <Dropdown
                                  onToggle={(isOpen) => handleDropdownToggle(medicine.id, isOpen)}
                                  show={openDropdownId === medicine.id}
                                >
                                  <Dropdown.Toggle
                                    variant="outline-warning"
                                    size="sm"
                                    id={`dropdown-${medicine.id}`}
                                    onClick={() => handleDropdownToggle(medicine.id, openDropdownId !== medicine.id)}
                                  >
                                    <FaCheck />
                                  </Dropdown.Toggle>

                                  <Dropdown.Menu>
                                    <Dropdown.Item
                                      onClick={() => handleActionSelect(medicine.id, "APPROVED")}
                                    >
                                      <FaCheckCircle className="text-success me-2" /> Phê duyệt
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                      onClick={() => handleActionSelect(medicine.id, "REJECTED")}
                                    >
                                      <FaTimesCircle className="text-danger me-2" /> Từ chối
                                    </Dropdown.Item>
                                  </Dropdown.Menu>
                                </Dropdown>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
                
                {/* Arrow Navigation Pagination */}
                {totalItems > 0 && (
                  <div className="pagination-container">
                    <div className="pagination-info">
                      Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} entries
                    </div>
                    
                    <div className="pagination-controls">
                      <div className="pagination-nav">
                        <button
                          className="pagination-arrow first-last"
                          disabled={currentPage === 1}
                          onClick={() => handlePageChange(1)}
                          title="First page"
                        >
                          <FaAngleDoubleLeft />
                        </button>
                        
                        <button
                          className="pagination-arrow"
                          disabled={currentPage === 1}
                          onClick={() => handlePageChange(currentPage - 1)}
                          title="Previous page"
                        >
                          <FaAngleLeft />
                        </button>
                        
                        <div className="current-page-indicator">
                          {currentPage} / {totalPages || 1}
                        </div>
                        
                        <button
                          className="pagination-arrow"
                          disabled={currentPage === totalPages || totalPages <= 1}
                          onClick={() => handlePageChange(currentPage + 1)}
                          title="Next page"
                        >
                          <FaAngleRight />
                        </button>
                        
                        <button
                          className="pagination-arrow first-last"
                          disabled={currentPage === totalPages || totalPages <= 1}
                          onClick={() => handlePageChange(totalPages)}
                          title="Last page"
                        >
                          <FaAngleDoubleRight />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
              )}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Medication Administration Modal */}
      <Modal
        show={showAdminModal}
        onHide={() => {
          setShowAdminModal(false);
          resetAdminForm();
        }}
        centered
        dialogClassName="medication-admin-modal-dialog"
      >
        <Modal.Header closeButton>
          <Modal.Title>Ghi nhận cung cấp thuốc</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAdminSubmit}>
          <Modal.Body>
            {adminError && (
              <Alert variant="danger">{adminError}</Alert>
            )}

            {selectedRequest && (
              <Alert variant="info" className="mb-3">
                <strong>Yêu cầu:</strong> #{selectedRequest.id} - {selectedRequest.studentName} - {selectedRequest.medicationName}
              </Alert>
            )}

                        <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Thời gian thực hiện *</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="administeredAt"
                    value={formData.administeredAt}
                    onChange={handleInputChange}
                    min={getMinDateTime()}
                    max={getMaxDateTime()}
                    required
                  />
                  <Form.Text className="text-muted">
                    Thời gian thực tế đã cung cấp thuốc. Trạng thái sẽ được tự động cập nhật dựa trên số lần đã cho thuốc.
                    {selectedRequest && selectedRequest.startDate && (
                      <><br />Không được trước ngày bắt đầu: {new Date(selectedRequest.startDate).toLocaleDateString('vi-VN')}</>
                    )}
                    {selectedRequest && selectedRequest.endDate && (
                      <><br />Không được sau ngày kết thúc: {new Date(selectedRequest.endDate).toLocaleDateString('vi-VN')}</>
                    )}
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ảnh xác nhận</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                  />
                  <Form.Text className="text-muted">
                    Ảnh xác nhận học sinh đã dùng thuốc (tùy chọn, tối đa 5MB)
                  </Form.Text>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                {imagePreview && (
                  <div className="mb-3">
                    <label className="form-label">Xem trước ảnh:</label>
                    <div className="text-center">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{ maxWidth: '150px', maxHeight: '150px' }}
                        className="img-thumbnail"
                      />
                    </div>
                  </div>
                )}
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Ghi chú</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Nhập ghi chú về việc cung cấp thuốc (ví dụ: phản ứng của học sinh, liều lượng thực tế đã cho, bất kỳ vấn đề gì xảy ra...)"
              />
              <Form.Text className="text-muted">
                Ghi chú chi tiết về quá trình cung cấp thuốc, bao gồm phản ứng của học sinh và mọi thông tin quan trọng khác.
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => {
                setShowAdminModal(false);
                resetAdminForm();
              }}
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={adminLoading}
            >
              {adminLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <FaCheck className="me-2" />
                  Ghi nhận
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Image Upload Modal */}
      <Modal
        show={showImageModal}
        onHide={() => setShowImageModal(false)}
        centered
        dialogClassName="image-upload-modal-dialog"
      >
        <Modal.Header closeButton>
          <Modal.Title>Tải lên ảnh xác nhận</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <FaCamera size={48} className="text-primary mb-3" />
            <p>Bạn có muốn tải lên ảnh xác nhận cho bản ghi này không?</p>
            
            {imagePreview && (
              <div className="mb-3">
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ maxWidth: '200px', maxHeight: '200px' }}
                  className="img-thumbnail"
                />
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleSkipImage}
            disabled={uploadLoading}
          >
            Bỏ qua
          </Button>
          <Button
            variant="primary"
            onClick={handleImageUpload}
            disabled={uploadLoading || !selectedImage}
          >
            {uploadLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Đang tải lên...
              </>
            ) : (
              <>
                <FaUpload className="me-2" />
                Tải lên
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Simple Detail Modal */}
      {showDetail && selectedReceipt && (
        <Modal show={true} onHide={handleCloseDetail} centered dialogClassName="detail-modal-dialog">
          <Modal.Header closeButton>
            <Modal.Title>Chi tiết đơn nhận thuốc #{selectedReceipt?.id}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Card className="mb-3">
                  <Card.Header>Thông tin cơ bản</Card.Header>
                  <Card.Body>
                    <p><strong>ID:</strong> {selectedReceipt?.id}</p>
                    <p><strong>Tên thuốc:</strong> {selectedReceipt?.medicationName || "Không có thông tin"}</p>
                    <p><strong>Liều lượng:</strong> {selectedReceipt?.dosageInstructions || "Không có thông tin"}</p>
                    <p><strong>Tần suất:</strong> {selectedReceipt?.frequencyPerDay || "Không có thông tin"}</p>
                    <p><strong>Ngày bắt đầu:</strong> {selectedReceipt?.startDate ? new Date(selectedReceipt.startDate).toLocaleDateString("vi-VN") : "Không có thông tin"}</p>
                    <p><strong>Ngày kết thúc:</strong> {selectedReceipt?.endDate ? new Date(selectedReceipt.endDate).toLocaleDateString("vi-VN") : "Không có thông tin"}</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="mb-3">
                  <Card.Header>Thông tin học sinh</Card.Header>
                  <Card.Body>
                    <p><strong>Học sinh:</strong> {selectedReceipt?.studentName || "Không có thông tin"}</p>
                    <p><strong>Mã học sinh:</strong> {selectedReceipt?.studentId || "Không có thông tin"}</p>
                    <p><strong>Người yêu cầu:</strong> {selectedReceipt?.requestedBy || "Không có thông tin"}</p>
                    <p><strong>Mã tài khoản:</strong> {selectedReceipt?.requestedByAccountId || "Không có thông tin"}</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            
            {selectedReceipt?.specialInstructions && (
              <Card className="mb-3">
                <Card.Header>Hướng dẫn đặc biệt</Card.Header>
                <Card.Body>
                  <p>{selectedReceipt.specialInstructions}</p>
                </Card.Body>
              </Card>
            )}
            
            {selectedReceipt?.rejectionReason && (
              <Card className="mb-3 border-danger">
                <Card.Header className="bg-danger text-white">Lý do từ chối</Card.Header>
                <Card.Body>
                  <p className="text-danger">{selectedReceipt.rejectionReason}</p>
                </Card.Body>
              </Card>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseDetail}>
              Đóng
            </Button>
            {canRecordAdministration(selectedReceipt?.status, selectedReceipt) && (
              <Button 
                variant="success"
                onClick={() => {
                  handleCloseDetail();
                  handleRecordAdministration(selectedReceipt);
                }}
              >
                <FaPlus className="me-2" /> 
                {selectedReceipt?.status === "PARTIALLY_TAKEN" ? "Tiếp tục ghi nhận" : "Ghi nhận cung cấp"}
              </Button>
            )}
            {(selectedReceipt?.status === "PENDING_APPROVAL" || selectedReceipt?.status === 0) && (
              <>
                <Button 
                  variant="success"
                  onClick={() => {
                    handleCloseDetail();
                    handleProcessClick(selectedReceipt.id, "APPROVED");
                  }}
                >
                  <FaCheckCircle className="me-2" /> Phê duyệt
                </Button>
                <Button 
                  variant="danger"
                  onClick={() => {
                    handleCloseDetail();
                    handleProcessClick(selectedReceipt.id, "REJECTED");
                  }}
                >
                  <FaTimesCircle className="me-2" /> Từ chối
                </Button>
              </>
            )}
          </Modal.Footer>
        </Modal>
      )}

      {/* Modal xử lý yêu cầu thuốc */}
      {showProcessModal && (
        <Modal show={true} onHide={() => setShowProcessModal(false)} centered dialogClassName="process-modal-dialog">
          <Modal.Header closeButton>
            <Modal.Title>Xử lý yêu cầu thuốc</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Quyết định:</Form.Label>
                <Form.Select
                  name="decision"
                  value={processData.decision}
                  onChange={handleProcessDataChange}
                >
                  <option value="APPROVED">Phê duyệt</option>
                  <option value="REJECTED">Từ chối</option>
                </Form.Select>
              </Form.Group>

              {processData.decision === "REJECTED" && (
                <Form.Group className="mb-3">
                  <Form.Label>Lý do từ chối:</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="reason"
                    placeholder="Nhập lý do từ chối yêu cầu thuốc..."
                    value={processData.reason}
                    onChange={handleProcessDataChange}
                    required={processData.decision === "REJECTED"}
                  />
                </Form.Group>
              )}
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowProcessModal(false)}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleConfirmProcess}>
              Xác nhận
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Medicine Image Viewing Modal */}
      <Modal 
        show={showMedicineImageModal} 
        onHide={() => setShowMedicineImageModal(false)} 
        centered 
        dialogClassName="medicine-image-modal-dialog"
      >
        <Modal.Header closeButton>
          <Modal.Title>Ảnh thuốc từ phụ huynh</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {selectedMedicineImage ? (
            <div className="w-100">
                              <img 
                  src={selectedMedicineImage} 
                  alt="Ảnh thuốc từ phụ huynh" 
                  className="img-fluid"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y4ZjlmYSIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2Yjc0ODMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5LaG9uZyB0aGUgdGFpIGFuaDwvdGV4dD4KPC9zdmc+';
                  e.target.alt = 'Không thể tải ảnh';
                }}
              />
              <div className="mt-3">
                <small className="text-muted">
                  Ảnh thuốc được gửi từ phụ huynh kèm theo yêu cầu
                </small>
              </div>
            </div>
          ) : (
            <div className="text-muted py-4">
              <FaImage size={48} className="mb-3" />
              <p>Không có ảnh để hiển thị</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMedicineImageModal(false)}>
            Đóng
          </Button>
          {selectedMedicineImage && (
            <Button 
              variant="primary" 
              onClick={() => window.open(selectedMedicineImage, '_blank')}
            >
              Mở ảnh gốc
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MedicineReceipts;

