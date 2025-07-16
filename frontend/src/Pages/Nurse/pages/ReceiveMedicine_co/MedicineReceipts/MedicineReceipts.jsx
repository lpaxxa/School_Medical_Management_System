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
import MedicineDetailModal from "./MedicineDetailModal";
import MedicineProcessModal from "./MedicineProcessModal";
import MedicineAdministrationModal from "./MedicineAdministrationModal";
import MedicineImageUploadModal from "./MedicineImageUploadModal";
import MedicineNotification from "./MedicineNotification";
import { useMedicineApproval } from "../../../../../context/NurseContext/MedicineApprovalContext";
import receiveMedicineService from "../../../../../services/APINurse/receiveMedicineService";

// Hàm chuyển đổi status thành text và style - Updated to match backend Status enum
const getStatusInfo = (status) => {
  // Normalize numeric status to string status
  // Xử lý trường hợp status là số (legacy support)
  if (typeof status === 'number') {
    switch (status) {
      case 0:
        status = "PENDING_APPROVAL";
        break;
      case 1:
        status = "APPROVED";
        break;
      case 2:
        status = "REJECTED";
        break;
      default:
        status = "UNKNOWN";
    }
  }
  
  // Xử lý trường hợp status là chuỗi - Complete Status enum support
  switch(status) {
    case "PENDING_APPROVAL":
      return { text: "Chờ phê duyệt", color: "#FFC107", textColor: "#212529" };
    case "APPROVED":
      return { text: "Đã duyệt", color: "#28A745", textColor: "#FFFFFF" };
    case "REJECTED":
      return { text: "Từ chối", color: "#DC3545", textColor: "#FFFFFF" };
    case "FULLY_TAKEN":
      return { text: "Đã dùng hết", color: "#0D6EFD", textColor: "#FFFFFF" };
    case "PARTIALLY_TAKEN":
      return { text: "Đang dùng", color: "#0DCAF0", textColor: "#FFFFFF" };
    case "EXPIRED":
      return { text: "Đã hết hạn", color: "#6C757D", textColor: "#FFFFFF" };
    case "CANCELLED":
      return { text: "Đã hủy", color: "#212529", textColor: "#FFFFFF" };
    default:
      return { text: "Không xác định", color: "#F8F9FA", textColor: "#212529", border: "1px solid #DEE2E6" };
  }
};

const MedicineReceipts = () => {
  // CSS để fix dropdown arrows - styled like MedicalIncidentsList
  const dropdownStyles = `
    .medicine-receipts-dropdown {
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m1 6 7 7 7-7'/%3e%3c/svg%3e") !important;
      background-repeat: no-repeat !important;
      background-position: right 0.75rem center !important;
      background-size: 16px 12px !important;
      padding-right: 2.25rem !important;
      appearance: none !important;
      -webkit-appearance: none !important;
      -moz-appearance: none !important;
    }
    
    .medicine-receipts-dropdown::-ms-expand {
      display: none !important;
    }
    
    /* Xóa bỏ tất cả các icon dropdown khác */
    .medicine-receipts-dropdown::after,
    .medicine-receipts-dropdown::before {
      display: none !important;
    }
  `;

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
  const [searchStudentName, setSearchStudentName] = useState("");
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

  // Notification state
  const [notification, setNotification] = useState({
    show: false,
    type: 'success',
    title: '',
    message: '',
  });

  // Helper function to show notifications
  const showNotification = (type, title, message = '') => {
    setNotification({
      show: true,
      type,
      title,
      message,
    });
  };

  // Helper function to hide notifications
  const hideNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

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
    // If e is null, reset the image (called from X button)
    if (e === null) {
      setSelectedImage(null);
      setImagePreview(null);
      // Reset file input if it exists
      const fileInput = document.querySelector('input[type="file"][accept="image/*"]');
      if (fileInput) {
        fileInput.value = '';
      }
      return;
    }

    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showNotification('error', 'Lỗi file', 'Vui lòng chọn file ảnh hợp lệ');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        showNotification('error', 'Lỗi kích thước', 'Kích thước file không được vượt quá 5MB');
        return;
      }

      setSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Handle administration form submission
  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setAdminLoading(true);
      
      // Validate required fields
      if (!formData.medicationInstructionId) {
        showNotification('warning', 'Thiếu thông tin', 'Vui lòng chọn yêu cầu thuốc');
        return;
      }
      
      if (!formData.administeredAt) {
        showNotification('warning', 'Thiếu thông tin', 'Vui lòng chọn thời gian thực hiện');
        return;
      }

      // Prepare data for API
      const selectedDateTime = new Date(formData.administeredAt);
      const currentTime = new Date();

      // Validate datetime is valid
      if (isNaN(selectedDateTime.getTime())) {
        showNotification('warning', 'Thời gian không hợp lệ', 'Vui lòng chọn thời gian hợp lệ');
        return;
      }

      // Validate against start date
      if (selectedRequest && selectedRequest.startDate) {
        const startDate = new Date(selectedRequest.startDate);
        startDate.setHours(0, 0, 0, 0); // Set to beginning of start date
        
        if (selectedDateTime < startDate) {
          const formattedStartDate = startDate.toLocaleDateString('vi-VN');
          showNotification('warning', 'Thời gian không hợp lệ', `Thời gian ghi nhận không được trước ngày bắt đầu: ${formattedStartDate}`);
          return;
        }
      }
      
      // Validate against end date if exists
      if (selectedRequest && selectedRequest.endDate) {
        const endDate = new Date(selectedRequest.endDate);
        endDate.setHours(23, 59, 59, 999); // Set to end of end date
        
        if (selectedDateTime > endDate) {
          const formattedEndDate = endDate.toLocaleDateString('vi-VN');
          showNotification('warning', 'Thời gian không hợp lệ', `Thời gian ghi nhận không được sau ngày kết thúc: ${formattedEndDate}`);
          return;
        }
      }
      
      // Validate against future time - only check if it's more than 5 minutes in the future to account for clock differences
      const futureThreshold = new Date(currentTime.getTime() + 5 * 60 * 1000); // 5 minutes buffer
      if (selectedDateTime > futureThreshold) {
        showNotification('warning', 'Thời gian không hợp lệ', 'Thời gian ghi nhận không được quá xa trong tương lai');
        return;
      }
      
      const submitData = {
        medicationInstructionId: Number(formData.medicationInstructionId),
        administeredAt: selectedDateTime.toISOString(),
        notes: formData.notes || '',
        imgUrl: formData.imgUrl || ''
      };

      console.log('Submitting medication administration:', submitData);

      // Create medication administration record
      const result = await receiveMedicineService.createMedicationAdministration(submitData);
      
      if (result.success) {
        console.log('✅ Medication administration created successfully:', result.data);
        
        // If image is selected, upload it
        if (selectedImage && result.data?.id) {
          setPendingAdministrationId(result.data.id);
          setShowImageModal(true);
        } else {
          // Success without image
          showNotification('success', 'Thành công!', `Đã ghi nhận việc cung cấp thuốc thành công! Mã bản ghi: #${result.data?.id}`);
          setShowAdminModal(false);
          resetAdminForm();
          
          // Reload page after successful submission
          setTimeout(() => {
            window.location.reload();
          }, 2000); // Wait 2 seconds for user to see the success message
        }
      } else {
        // Display server error message on screen
        const errorMessage = result.message || 'Không thể ghi nhận việc cung cấp thuốc';
        showNotification('error', 'Lỗi xử lý', errorMessage);
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
            } else if (serverMessage.includes('Invalid date format') || serverMessage.includes('date')) {
              errorMessage = 'Định dạng thời gian không hợp lệ. Vui lòng chọn lại thời gian.';
            } else if (serverMessage.includes('required') || serverMessage.includes('missing')) {
              errorMessage = 'Thiếu thông tin bắt buộc. Vui lòng kiểm tra lại form.';
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
      showNotification('error', 'Lỗi hệ thống', errorMessage);
    } finally {
      setAdminLoading(false);
    }
  };

  // Handle image upload
  const handleImageUpload = async () => {
    if (!selectedImage || !pendingAdministrationId) {
      showNotification('error', 'Thiếu thông tin', 'Thiếu thông tin để tải lên ảnh');
      return;
    }

    try {
      setUploadLoading(true);

      const result = await receiveMedicineService.uploadConfirmationImage(
        pendingAdministrationId,
        selectedImage
      );

      if (result.success) {
        showNotification('success', 'Tải ảnh thành công!', `Đã tải lên ảnh xác nhận thành công! Mã bản ghi: #${pendingAdministrationId}`);
        setShowImageModal(false);
        setShowAdminModal(false);
        resetAdminForm();
        setPendingAdministrationId(null);
        
        // Reload page after successful upload
        setTimeout(() => {
          window.location.reload();
        }, 2000); // Wait 2 seconds for user to see the success message
      } else {
        showNotification('error', 'Lỗi tải ảnh', result.message || 'Không thể tải lên ảnh xác nhận');
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      showNotification('error', 'Lỗi hệ thống', 'Có lỗi xảy ra khi tải lên ảnh');
    } finally {
      setUploadLoading(false);
    }
  };

  // Handle skip image upload
  const handleSkipImage = () => {
    showNotification('success', 'Thành công!', 'Đã ghi nhận việc cung cấp thuốc thành công!');
    setShowImageModal(false);
    setShowAdminModal(false);
    resetAdminForm();
    setPendingAdministrationId(null);
    
    // Reload page after skipping image
    setTimeout(() => {
      window.location.reload();
    }, 2000); // Wait 2 seconds for user to see the success message
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
        showNotification('warning', 'Quyết định không hợp lệ', 'Chỉ có thể là APPROVED hoặc REJECTED');
        return;
      }

      if (processData.decision === "REJECTED" && !processData.reason?.trim()) {
        showNotification('warning', 'Thiếu thông tin', 'Vui lòng nhập lý do từ chối');
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
        const successMessage = processData.decision === "APPROVED" ? "phê duyệt" : "từ chối";
        showNotification('success', 'Xử lý thành công!', `Đã ${successMessage} yêu cầu thuốc thành công!`);
        fetchMedicineRequests();
      } else {
        showNotification('error', 'Lỗi xử lý', `Không thể xử lý yêu cầu: ${result.message || "Đã xảy ra lỗi"}`);
      }
    } catch (err) {
      console.error("Lỗi khi xử lý yêu cầu thuốc:", err);
      showNotification('error', 'Lỗi hệ thống', 'Có lỗi xảy ra khi xử lý yêu cầu thuốc. Vui lòng thử lại sau.');
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

    // Filter by student name
    let studentNameMatch = true;
    if (searchStudentName.trim() !== "") {
      studentNameMatch = medicine.studentName && 
        medicine.studentName.toLowerCase().includes(searchStudentName.toLowerCase().trim());
    }

    // Filter by date range
    let dateMatch = true;
    if (dateRange.startDate || dateRange.endDate) {
      const medicineDate = new Date(medicine.startDate);
      
      if (dateRange.startDate) {
        const startDate = new Date(dateRange.startDate);
        startDate.setHours(0, 0, 0, 0); // Start of day
        dateMatch = dateMatch && medicineDate >= startDate;
      }
      
      if (dateRange.endDate) {
        const endDate = new Date(dateRange.endDate);
        endDate.setHours(23, 59, 59, 999); // End of day
        dateMatch = dateMatch && medicineDate <= endDate;
      }
    }

    return statusMatch && studentNameMatch && dateMatch;
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
    console.log("Viewing receipt details:", receipt);
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

  // Clear all filters
  const clearDateFilters = () => {
    setFilterStatus("all");
    setSearchStudentName("");
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
      {/* Inject dropdown styles */}
      <style dangerouslySetInnerHTML={{ __html: dropdownStyles }} />
      
      {/* Enhanced Filter Section - Styled like MedicalIncidentsList */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header text-white" style={{background: 'linear-gradient(135deg, #015C92 0%, #2D82B5 100%)'}}>
              <h5 className="mb-0" style={{color: 'white'}}>
                <i className="fas fa-filter me-2"></i>
                Tìm kiếm và lọc đơn nhận thuốc
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3 align-items-end">
                {/* Status Filter */}
                <div className="col-md-3">
                  <label htmlFor="filterStatus" className="form-label fw-bold">
                    <i className="fas fa-tasks me-1"></i>
                    Trạng thái
                  </label>
                  <Form.Select
                    id="filterStatus"
                    className="form-select form-select-lg medicine-receipts-dropdown"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">Tất cả</option>
                    <option value="PENDING_APPROVAL">Chờ phê duyệt</option>
                    <option value="APPROVED">Đã duyệt</option>
                    <option value="REJECTED">Từ chối</option>
                    <option value="FULLY_TAKEN">Đã dùng hết</option>
                    <option value="PARTIALLY_TAKEN">Đang dùng</option>
                    <option value="EXPIRED">Đã hết hạn</option>
                    <option value="CANCELLED">Đã hủy</option>
                  </Form.Select>
                </div>

                {/* Student Name Search */}
                <div className="col-md-3">
                  <label htmlFor="searchStudentName" className="form-label fw-bold">
                    <i className="fas fa-user me-1"></i>
                    Tên học sinh
                  </label>
                  <Form.Control
                    id="searchStudentName"
                    type="text"
                    className="form-control form-control-lg"
                    placeholder="Nhập tên học sinh..."
                    value={searchStudentName}
                    onChange={(e) => setSearchStudentName(e.target.value)}
                  />
                </div>

                {/* Date Range Filter */}
                <div className="col-md-4">
                  <label className="form-label fw-bold">
                    <i className="fas fa-calendar-alt me-1"></i>
                    Khoảng thời gian
                  </label>
                  <div className="d-flex gap-2 align-items-center">
                    <Form.Control
                      type="date"
                      className="form-control form-control-lg"
                      placeholder="Từ ngày"
                      value={dateRange.startDate}
                      onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                    />
                    <span className="mx-2 fw-bold text-muted">-</span>
                    <Form.Control
                      type="date"
                      className="form-control form-control-lg"
                      placeholder="Đến ngày"
                      value={dateRange.endDate}
                      onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                    />
                  </div>
                </div>

                {/* Reset Button */}
                <div className="col-md-2">
                  <Button
                    variant="outline-secondary"
                    className="btn btn-outline-secondary btn-lg w-100"
                    onClick={clearDateFilters}
                    title="Xóa bộ lọc"
                  >
                    <i className="fas fa-redo me-2"></i>
                    Đặt lại
                  </Button>
                </div>
              </div>

              {/* Results Info */}
              {totalItems > 0 && (
                <div className="row mt-3">
                  <div className="col-12">
                    <div className="alert alert-info mb-0">
                      <i className="fas fa-info-circle me-2"></i>
                      Tìm thấy <strong>{totalItems}</strong> đơn nhận thuốc
                      {filterStatus !== "all" && (
                        <span> với trạng thái <strong>{getStatusInfo(filterStatus).text}</strong></span>
                      )}
                      {searchStudentName.trim() !== "" && (
                        <span> cho học sinh có tên chứa "<strong>{searchStudentName}</strong>"</span>
                      )}
                      {(dateRange.startDate || dateRange.endDate) && (
                        <span> trong khoảng thời gian được chọn</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <Card.Header className="py-3" style={{background: 'linear-gradient(135deg, #015C92 0%, #2D82B5 100%)'}}>
          <Row className="align-items-center">
            <Col>
              <h5 className="mb-0 fw-bold" style={{color: 'white'}}>
                <i className="fas fa-list me-2"></i>
                Danh sách đơn nhận thuốc ({totalItems} đơn)
              </h5>
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
                              // Debug: Log the medicine object to console to see available fields
                              console.log('Medicine object for ID', medicine.id, ':', medicine);
                              console.log('prescriptionImageUrl:', medicine.prescriptionImageUrl);
                              console.log('medicationImageUrl:', medicine.medicationImageUrl);
                              console.log('imageUrl:', medicine.imageUrl);
                              
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
      <MedicineAdministrationModal
        show={showAdminModal}
        onHide={() => {
          setShowAdminModal(false);
          resetAdminForm();
        }}
        selectedRequest={selectedRequest}
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleAdminSubmit}
        loading={adminLoading}
        selectedImage={selectedImage}
        imagePreview={imagePreview}
        onImageSelect={handleImageSelect}
        getCurrentDateTime={getCurrentDateTime}
        getMinDateTime={getMinDateTime}
        getMaxDateTime={getMaxDateTime}
      />

      {/* Image Upload Modal */}
      <MedicineImageUploadModal
        show={showImageModal}
        onHide={() => setShowImageModal(false)}
        onUpload={handleImageUpload}
        onSkip={handleSkipImage}
        selectedImage={selectedImage}
        imagePreview={imagePreview}
        uploadLoading={uploadLoading}
        pendingAdministrationId={pendingAdministrationId}
      />

      {/* Simple Detail Modal */}
      <MedicineDetailModal 
        show={showDetail && selectedReceipt}
        onHide={handleCloseDetail}
        selectedReceipt={selectedReceipt}
        getStatusInfo={getStatusInfo}
        canRecordAdministration={canRecordAdministration}
        handleRecordAdministration={handleRecordAdministration}
        handleProcessClick={handleProcessClick}
      />

      {/* Modal xử lý yêu cầu thuốc */}
      <MedicineProcessModal 
        show={showProcessModal}
        onHide={() => setShowProcessModal(false)}
        processData={processData}
        onChange={handleProcessDataChange}
        onConfirm={handleConfirmProcess}
      />

      {/* Medicine Image Viewing Modal */}
      <Modal 
        show={showMedicineImageModal} 
        onHide={() => setShowMedicineImageModal(false)} 
        centered 
        size="lg"
        className="medicine-parent-image-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Ảnh thuốc từ phụ huynh</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedMedicineImage ? (
            <div className="parent-image-container">
              <img 
                src={selectedMedicineImage} 
                alt="Ảnh thuốc từ phụ huynh" 
                className="parent-medicine-image"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y4ZjlmYSIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2Yjc0ODMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5LaG9uZyB0aGUgdGFpIGFuaDwvdGV4dD4KPC9zdmc+';
                  e.target.alt = 'Không thể tải ảnh';
                }}
              />
            </div>
          ) : (
            <div className="no-image-placeholder">
              <FaImage className="no-image-icon" />
              <p className="mb-0">Không có ảnh để hiển thị</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowMedicineImageModal(false)}
          >
            <FaTimes className="me-2" />
            Đóng
          </Button>
          {selectedMedicineImage && (
            <Button 
              variant="primary" 
              onClick={() => window.open(selectedMedicineImage, '_blank')}
            >
              <FaEye className="me-2" />
              Mở ảnh gốc
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Notification Component - Replaces toast notifications */}
      <MedicineNotification 
        show={notification.show}
        onHide={hideNotification}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </Container>
  );
};

export default MedicineReceipts;

