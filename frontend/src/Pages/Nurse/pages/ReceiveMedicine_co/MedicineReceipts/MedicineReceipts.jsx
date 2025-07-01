import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Form,
  Button,
  Badge,
  Spinner,
  Modal,
  InputGroup,
  Dropdown,
  Alert,
  ListGroup, // Thêm ListGroup ở đây
} from "react-bootstrap";
import {
  FaEye,
  FaCheck,
  FaCheckCircle,
  FaSyncAlt,
  FaTimes,
  FaTimesCircle,
  FaExclamationTriangle,
  FaExclamationCircle,
  FaArrowLeft,
  FaCalendarAlt,
  FaUser,
  FaUserCircle,
} from "react-icons/fa";
import "./MedicineReceipts.css";
import { useMedicineApproval } from "../../../../../context/NurseContext/MedicineApprovalContext";

const MedicineReceipts = () => {
  const {
    medicineRequests,
    loading,
    error,
    fetchMedicineRequests,
    processMedicineRequest,
    getStatusInfo,
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
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [pendingAdministrationId, setPendingAdministrationId] = useState(null);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState(null);
  
  // State for form data
  const [formData, setFormData] = useState({
    medicationInstructionId: '',
    administeredAt: '',
    administrationStatus: 'SUCCESSFUL',
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
      administrationStatus: 'SUCCESSFUL',
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
      administrationStatus: 'SUCCESSFUL',
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
        administrationStatus: formData.administrationStatus,
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
      // Validate decision
      if (!["APPROVED", "REJECTED"].includes(processData.decision)) {
        alert("Quyết định không hợp lệ. Chỉ có thể là APPROVED hoặc REJECTED");
        return;
      }

      // Kiểm tra lý do nếu quyết định là từ chối
      if (processData.decision === "REJECTED" && !processData.reason?.trim()) {
        alert("Vui lòng nhập lý do từ chối");
        return;
      }

      // Format data theo đúng cấu trúc API yêu cầu
      const requestData = {
        decision: processData.decision,
        reason: processData.decision === "REJECTED" ? processData.reason : null,
        reasonProvidedWhenRequired: processData.decision === "REJECTED",
      };

      const result = await processMedicineRequest(
        pendingProcessId,
        requestData
      );

      if (result.success) {
        setShowProcessModal(false);
        alert(
          `Đã ${
            processData.decision === "APPROVED" ? "phê duyệt" : "từ chối"
          } yêu cầu thuốc thành công!`
        );
        // Refresh data after processing
        fetchMedicineRequests();
      } else {
        alert(`Không thể xử lý yêu cầu: ${result.message || "Đã xảy ra lỗi"}`);
      }
    } catch (err) {
      console.error("Lỗi khi xử lý yêu cầu thuốc:", err);
      alert("Có lỗi xảy ra khi xử lý yêu cầu thuốc. Vui lòng thử lại sau.");
    }
  };
  // Lọc đơn thuốc theo trạng thái
  const filteredMedicineRequests = medicineRequests.filter((medicine) => {
    if (filterStatus === "all") return true;

    // Xử lý trường hợp status là số hoặc chuỗi
    if (typeof medicine.status === "number") {
      // Chuyển đổi số thành chuỗi tương ứng để so sánh
      switch (medicine.status) {
        case 0:
          return filterStatus === "PENDING_APPROVAL";
        case 1:
          return filterStatus === "APPROVED";
        case 2:
          return filterStatus === "REJECTED";
        case 3:
          return filterStatus === "CANCELLED";
        default:
          return false;
      }
    }

    // Nếu status là chuỗi, so sánh trực tiếp
    return medicine.status === filterStatus;
  });

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


  // Handle selection from dropdown
  const handleActionSelect = (id, action) => {
    setDropdownId(null); // Close dropdown
    handleProcessClick(id, action);
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
                  <InputGroup.Text id="status-filter-label">
                    Trạng thái:
                  </InputGroup.Text>
                  <Form.Select
                    id="status-filter"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    aria-describedby="status-filter-label"
                  >
                    <option value="all">Tất cả</option>
                    <option value="PENDING_APPROVAL">Chờ phê duyệt</option>
                    <option value="APPROVED">Đã duyệt</option>
                    <option value="REJECTED">Từ chối</option>
                    <option value="CANCELLED">Đã hủy</option>
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
        </Card.Header>
        {/* Chi tiết đơn nhận thuốc */}
        {showDetail && selectedReceipt && (
          <MedicineReceiptDetail
            receipt={selectedReceipt}
            onClose={handleCloseDetail}
          />
        )}{" "}
        <Card.Body>
          {/* Hiển thị danh sách đơn nhận thuốc */}
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Đang tải dữ liệu...</p>
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : (
            <div className="medicine-receipts-list">
              {filteredMedicineRequests.length === 0 ? (
                <Alert variant="info">Không có đơn nhận thuốc nào</Alert>
              ) : (
                <Table hover responsive className="align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>ID</th>
                      <th>Tên học sinh</th>
                      <th>Người yêu cầu</th>
                      <th>Ngày bắt đầu</th>
                      <th>Trạng thái</th>
                      <th className="text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMedicineRequests.map((medicine) => {
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
                            {new Date(medicine.startDate).toLocaleDateString(
                              "vi-VN"
                            )}
                          </td>{" "}
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
                                    ? "#28A745"
                                    : statusInfo.text === "Từ chối"
                                    ? "#DC3545"
                                    : statusInfo.text === "Đã hủy"
                                    ? "#6C757D"
                                    : "#F8F9FA",
                                color:
                                  statusInfo.text === "Chờ phê duyệt"
                                    ? "#212529"
                                    : statusInfo.text === "Không xác định"
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

                              {/* Show Record Administration button for approved requests */}
                              {isApproved(medicine.status) && (
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  onClick={() => handleRecordAdministration(medicine)}
                                  title="Ghi nhận cung cấp thuốc"
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
                                    variant="outline-success"
                                    size="sm"
                                    id={`dropdown-${medicine.id}`}
                                    onClick={() => handleDropdownToggle(medicine.id, openDropdownId !== medicine.id)}
                                  >
                                    <FaCheck />
                                  </Dropdown.Toggle>

                                  <Dropdown.Menu>
                                    <Dropdown.Item
                                      onClick={() =>
                                        handleActionSelect(
                                          medicine.id,
                                          "APPROVED"
                                        )
                                      }
                                    >
                                      <FaCheckCircle className="text-success me-2" />{" "}
                                      Phê duyệt
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                      onClick={() =>
                                        handleActionSelect(
                                          medicine.id,
                                          "REJECTED"
                                        )
                                      }
                                    >
                                      <FaTimesCircle className="text-danger me-2" />{" "}
                                      Từ chối
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
              )}
            </div>
          )}
        </Card.Body>
      </Card>
      {/* Modal xử lý yêu cầu thuốc */}
      {showProcessModal && (
        <div className="reason-modal-overlay">
          <div className="reason-modal-container">
            <div className="reason-modal-title">Xử lý yêu cầu thuốc</div>
            <div className="process-form">
              <div className="form-group">
                <label>Quyết định:</label>
                <select
                  name="decision"
                  value={processData.decision}
                  onChange={handleProcessDataChange}
                  className="form-select"
                >
                  <option value="APPROVED">Phê duyệt</option>
                  <option value="REJECTED">Từ chối</option>
                </select>
              </div>

              {processData.decision === "REJECTED" && (
                <div className="form-group">
                  <label>Lý do từ chối:</label>
                  <textarea
                    name="reason"
                    className="reason-textarea"
                    placeholder="Nhập lý do từ chối yêu cầu thuốc..."
                    value={processData.reason}
                    onChange={handleProcessDataChange}
                    required={processData.decision === "REJECTED"}
                  />
                </div>
              )}
            </div>
            <div className="reason-modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowProcessModal(false)}
              >
                Hủy
              </button>
              <button className="btn-primary" onClick={handleConfirmProcess}>
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

// Hàm chuyển đổi status thành text và style
const getStatusInfo = (status) => {
  // Xử lý cả trường hợp status là string và number
  let statusText = status;
  if (typeof status === "number") {
    switch (status) {
      case 0:
        statusText = "PENDING_APPROVAL";
        break;
      case 1:
        statusText = "APPROVED";
        break;
      case 2:
        statusText = "REJECTED";
        break;
      case 3:
        statusText = "CANCELLED";
        break;
      default:
        statusText = "UNKNOWN";
    }
  }

  switch (statusText) {
    case "PENDING_APPROVAL":
      return {
        text: "Chờ phê duyệt",
        class: "status-pending",
        color: "#FFC107", // Màu vàng
        textColor: "#212529", // Chữ đen
      };
    case "APPROVED":
      return {
        text: "Đã duyệt",
        class: "status-approved",
        color: "#28A745", // Màu xanh lá
        textColor: "#FFFFFF", // Chữ trắng
      };
    case "REJECTED":
      return {
        text: "Từ chối",
        class: "status-rejected",
        color: "#DC3545", // Màu đỏ
        textColor: "#FFFFFF", // Chữ trắng
      };
    case "CANCELLED":
      return {
        text: "Đã hủy",
        class: "status-cancelled",
        color: "#6C757D", // Màu xám
        textColor: "#FFFFFF", // Chữ trắng
      };
    default:
      return {
        text: "Không xác định",
        class: "status-unknown",
        color: "#F8F9FA", // Màu xám nhạt
        textColor: "#212529", // Chữ đen
        border: "1px solid #DEE2E6", // Thêm viền
      };
  }
};

// MedicineReceiptDetail component (gộp từ file MedicineReceiptDetail.jsx)
const MedicineReceiptDetail = ({ receipt, onClose }) => {
  const modalRef = useRef(null);

  // Thêm hiệu ứng đóng modal khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "auto";
    };
  }, [onClose]);

  // Xử lý đóng modal khi nhấn ESC
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [onClose]);

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa có";

    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const getStatusInfo = (status) => {
    // Xử lý cả trường hợp status là string và number
    let statusText = status;
    if (typeof status === "number") {
      switch (status) {
        case 0:
          statusText = "PENDING_APPROVAL";
          break;
        case 1:
          statusText = "APPROVED";
          break;
        case 2:
          statusText = "REJECTED";
          break;
        case 3:
          statusText = "CANCELLED";
          break;
        default:
          statusText = "UNKNOWN";
      }
    }

    switch (statusText) {
      case "PENDING_APPROVAL":
        return {
          text: "Chờ phê duyệt",
          color: "#FFC107",
          textColor: "#212529",
        };
      case "APPROVED":
        return {
          text: "Đã duyệt",
          color: "#28A745",
          textColor: "#FFFFFF",
        };
      case "REJECTED":
        return {
          text: "Từ chối",
          color: "#DC3545",
          textColor: "#FFFFFF",
        };
      case "CANCELLED":
        return {
          text: "Đã hủy",
          color: "#6C757D",
          textColor: "#FFFFFF",
        };
      default:
        return {
          text: "Không xác định",
          color: "#F8F9FA",
          textColor: "#212529",
          border: "1px solid #DEE2E6",
        };
    }
  };

  return (
    <Modal
      show={true}
      onHide={onClose}
      size="xl" // Tăng kích thước modal từ "lg" lên "xl"
      centered
      backdrop="static"
      className="medicine-receipt-detail-modal"
      dialogClassName="modal-90w" // Thêm class này để điều chỉnh độ rộng
    >
      <Modal.Header className="bg-primary text-white py-3">
        <Modal.Title>
          <div className="d-flex align-items-center">
            <FaUser className="me-2" />
            Chi tiết đơn nhận thuốc #{receipt?.id}
          </div>
        </Modal.Title>
        <Button
          variant="close"
          className="btn-close-white"
          onClick={onClose}
          aria-label="Close"
        ></Button>
      </Modal.Header>

      <Modal.Body className="p-4">
        {/* Badge trạng thái được thiết kế lớn và nổi bật */}
        <div className="mb-4 d-flex justify-content-center">
          {(() => {
            const statusInfo = getStatusInfo(receipt?.status);
            return (
              <span
                style={{
                  display: "inline-block",
                  padding: "0.7rem 2rem",
                  borderRadius: "30px",
                  fontWeight: "600",
                  fontSize: "1.1rem",
                  textAlign: "center",
                  minWidth: "180px", // Tăng độ rộng tối thiểu
                  backgroundColor: statusInfo.color,
                  color: statusInfo.textColor,
                  border: statusInfo.border || "none",
                  boxShadow: "0 3px 6px rgba(0,0,0,0.15)",
                }}
              >
                {statusInfo.text}
              </span>
            );
          })()}
        </div>

        <Row className="gx-4"> {/* Tăng khoảng cách giữa các cột */}
          {/* Thông tin cơ bản */}
          <Col lg={6} className="mb-4">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Header className="bg-light py-3">
                <h5 className="mb-0 fw-bold"> {/* Tăng kích thước tiêu đề */}
                  <FaCalendarAlt className="me-2 text-primary" />
                  Thông tin cơ bản
                </h5>
              </Card.Header>
              <Card.Body className="p-0">
                <ListGroup variant="flush">
                  <ListGroup.Item className="py-3 d-flex justify-content-between align-items-center">
                    <strong className="text-muted" style={{ minWidth: '140px' }}>ID:</strong>
                    <span className="fw-bold text-end" style={{ flex: '1' }}>{receipt?.id}</span>
                  </ListGroup.Item>

                  <ListGroup.Item className="py-3 d-flex justify-content-between align-items-center">
                    <strong className="text-muted" style={{ minWidth: '140px' }}>Ngày yêu cầu:</strong>
                    <span className="text-end" style={{ flex: '1' }}>{formatDate(receipt?.requestDate)}</span>
                  </ListGroup.Item>

                  <ListGroup.Item className="py-3 bg-light d-flex justify-content-between align-items-center">
                    <strong className="text-muted" style={{ minWidth: '140px' }}>Ngày bắt đầu:</strong>
                    <span className="fw-bold text-end" style={{ flex: '1' }}>{formatDate(receipt?.startDate)}</span>
                  </ListGroup.Item>

                  <ListGroup.Item className="py-3 d-flex justify-content-between align-items-center">
                    <strong className="text-muted" style={{ minWidth: '140px' }}>Ngày kết thúc:</strong>
                    <span className="text-end" style={{ flex: '1' }}>{formatDate(receipt?.endDate)}</span>
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>

          {/* Thông tin học sinh */}
          <Col lg={6} className="mb-4">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Header className="bg-light py-3">
                <h5 className="mb-0 fw-bold"> {/* Tăng kích thước tiêu đề */}
                  <FaUserCircle className="me-2 text-primary" />
                  Thông tin học sinh
                </h5>
              </Card.Header>
              <Card.Body className="p-0">
                <ListGroup variant="flush">
                  <ListGroup.Item className="py-3 d-flex justify-content-between align-items-center">
                    <strong className="text-muted" style={{ minWidth: '140px' }}>Học sinh:</strong>
                    <span className="fw-bold text-end" style={{ flex: '1' }}>{receipt?.studentName}</span>
                  </ListGroup.Item>

                  <ListGroup.Item className="py-3 d-flex justify-content-between align-items-center">
                    <strong className="text-muted" style={{ minWidth: '140px' }}>Lớp:</strong>
                    <span className="text-end" style={{ flex: '1' }}>{receipt?.studentClass || "Không có thông tin"}</span>
                  </ListGroup.Item>

                  <ListGroup.Item className="py-3 bg-light d-flex justify-content-between align-items-center">
                    <strong className="text-muted" style={{ minWidth: '140px' }}>Người yêu cầu:</strong>
                    <span className="text-end" style={{ flex: '1' }}>{receipt?.requestedBy}</span>
                  </ListGroup.Item>

                  <ListGroup.Item className="py-3 d-flex justify-content-between align-items-center">
                    <strong className="text-muted" style={{ minWidth: '140px' }}>Mối quan hệ:</strong>
                    <span className="text-end" style={{ flex: '1' }}>{receipt?.relationship || "Không rõ"}</span>
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Danh sách thuốc */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Header className="bg-light py-3">
            <h5 className="mb-0 fw-bold">
              <FaCheckCircle className="me-2 text-primary" />
              Danh sách thuốc
            </h5>
          </Card.Header>
          <Card.Body className="p-0">
            <div className="table-responsive"> {/* Bọc bảng trong div.table-responsive */}
              <Table hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '5%' }} className="ps-4">#</th>
                    <th style={{ width: '30%' }}>Tên thuốc</th>
                    <th style={{ width: '20%' }}>Liều lượng</th>
                    <th style={{ width: '20%' }}>Tần suất</th>
                    <th style={{ width: '25%' }}>Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {receipt?.medications?.map((med, index) => (
                    <tr key={index}>
                      <td className="ps-4">{index + 1}</td>
                      <td className="fw-bold">{med.name}</td>
                      <td>{med.dosage}</td>
                      <td>{med.frequency}</td>
                      <td>{med.notes || "Không có"}</td>
                    </tr>
                  ))}
                  {(!receipt?.medications || receipt.medications.length === 0) && (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-muted">
                        Không có thông tin thuốc
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>

        {/* Thông tin bổ sung */}
        {(receipt?.reason || receipt?.notes) && (
          <Card className="border-0 shadow-sm mb-0">
            <Card.Header className="bg-light py-3">
              <h5 className="mb-0 fw-bold">
                <FaExclamationCircle className="me-2 text-primary" />
                Thông tin bổ sung
              </h5>
            </Card.Header>
            <Card.Body className="p-4">
              {receipt?.reason && (
                <div className="mb-4">
                  <h6 className="text-muted mb-2">Lý do/Chẩn đoán:</h6>
                  <div className="p-3 bg-light rounded">
                    <p className="mb-0" style={{ lineHeight: '1.5' }}>{receipt.reason}</p>
                  </div>
                </div>
              )}

              {receipt?.notes && (
                <div>
                  <h6 className="text-muted mb-2">Ghi chú:</h6>
                  <div className="p-3 bg-light rounded">
                    <p className="mb-0" style={{ lineHeight: '1.5' }}>{receipt.notes}</p>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        )}
      </Modal.Body>

      <Modal.Footer className="border-0 pt-0 pb-4 px-4 d-flex justify-content-between">
        <Button variant="outline-secondary" onClick={onClose} className="px-4 py-2"> {/* Tăng kích thước nút */}
          <FaArrowLeft className="me-2" /> Quay lại
        </Button>

        {receipt?.status === "PENDING_APPROVAL" && (
          <div>
            <Button variant="success" className="me-3 px-4 py-2"> {/* Tăng kích thước nút */}
              <FaCheck className="me-2" /> Phê duyệt
            </Button>
            <Button variant="danger" className="px-4 py-2"> {/* Tăng kích thước nút */}
              <FaTimes className="me-2" /> Từ chối
            </Button>
          </div>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default MedicineReceipts;
