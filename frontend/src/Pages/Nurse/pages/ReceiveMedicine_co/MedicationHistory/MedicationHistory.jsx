import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Table, Form, Button,
  Spinner, Alert, Modal, InputGroup, Badge
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { 
  FaSearch, FaEye, FaImage, FaTimes,
  FaCheckCircle, FaTimesCircle, FaExclamationTriangle, 
  FaExclamationCircle, FaAngleLeft, FaAngleRight, 
  FaAngleDoubleLeft, FaAngleDoubleRight
} from 'react-icons/fa';
import './MedicationHistory.css';
import { useMedicationAdministration } from '../../../../../context/NurseContext/MedicineApprovalContext';
import { toast } from 'react-toastify';


const MedicationHistory = () => {
  // CSS để fix dropdown arrows - styled like MedicineReceipts
  const dropdownStyles = `
    .medication-history-dropdown {
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m1 6 7 7 7-7'/%3e%3c/svg%3e") !important;
      background-repeat: no-repeat !important;
      background-position: right 0.75rem center !important;
      background-size: 16px 12px !important;
      padding-right: 2.25rem !important;
      appearance: none !important;
      -webkit-appearance: none !important;
      -moz-appearance: none !important;
    }
    
    .medication-history-dropdown::-ms-expand {
      display: none !important;
    }
    
    /* Xóa bỏ tất cả các icon dropdown khác */
    .medication-history-dropdown::after,
    .medication-history-dropdown::before {
      display: none !important;
    }
  `;

  // Use context for read-only access
  const {
    administrations,
    totalItems,
    totalPages,
    currentPage,
    pageSize,
    loading,
    error,
    fetchMedicationAdministrations,
    clearError
  } = useMedicationAdministration();

  console.log('🎯 MedicationHistory - Context data:', {
    administrations: administrations?.length || 0,
    totalItems,
    totalPages,
    currentPage,
    loading,
    error
  });

  // Add useEffect to fetch data on mount
  useEffect(() => {
    console.log('🚀 MedicationHistory - useEffect triggered, calling fetchMedicationAdministrations');
    fetchMedicationAdministrations(1, 10);
    
    // Cleanup function to clear errors when component unmounts
    return () => {
      if (clearError) {
        clearError();
      }
    };
  }, []);

  // Clear error when user interacts
  const handleClearError = () => {
    console.log('🧹 Clearing error');
    if (clearError) {
      clearError();
    }
  };
  
  // State for search and filters only (read-only view)
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // State for viewing image modal
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  // Status mapping for display - Updated to include both backend and mock data statuses
  const statusConfig = {
    // Backend enum statuses
    'PENDING_APPROVAL': { 
      color: 'warning', 
      icon: <FaExclamationTriangle className="me-1" />, 
      text: 'Chờ phê duyệt' 
    },
    'APPROVED': { 
      color: 'info', 
      icon: <FaCheckCircle className="me-1" />, 
      text: 'Đã duyệt' 
    },
    'REJECTED': { 
      color: 'danger', 
      icon: <FaTimesCircle className="me-1" />, 
      text: 'Từ chối' 
    },
    'FULLY_TAKEN': { 
      color: 'success', 
      icon: <FaCheckCircle className="me-1" />, 
      text: 'Đã uống đầy đủ' 
    },
    'PARTIALLY_TAKEN': { 
      color: 'warning', 
      icon: <FaExclamationTriangle className="me-1" />, 
      text: 'Uống một phần' 
    },
    'EXPIRED': { 
      color: 'danger', 
      icon: <FaTimesCircle className="me-1" />, 
      text: 'Đã hết hạn' 
    },
    // Mock data statuses (for fallback when API is not available)
    'SUCCESSFUL': { 
      color: 'success', 
      icon: <FaCheckCircle className="me-1" />, 
      text: 'Thành công' 
    },
    'REFUSED': { 
      color: 'danger', 
      icon: <FaTimesCircle className="me-1" />, 
      text: 'Từ chối' 
    },
    'PARTIAL': { 
      color: 'warning', 
      icon: <FaExclamationTriangle className="me-1" />, 
      text: 'Một phần' 
    }
  };
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Không có thông tin';
    
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Ngày không hợp lệ';
      }
      
      return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Lỗi định dạng ngày';
    }
  };

  // Handle adding new medication administration
  const handleAddMedication = async () => {
    const result = await addMedicationAdministration(modalData);
    if (result.success) {
      toast.success("Thêm mới lịch sử dùng thuốc thành công!");
      setShowModal(false);
      resetModalData();
    } else {
      toast.error(result.error?.message || "Không thể thêm mới lịch sử dùng thuốc.");
    }
  };

  // Handle editing medication administration
  const handleEditMedication = async () => {
    const result = await updateMedicationAdministration(modalData.id, modalData);
    if (result.success) {
      toast.success("Cập nhật lịch sử dùng thuốc thành công!");
      setShowModal(false);
      resetModalData();
    } else {
      toast.error(result.error?.message || "Không thể cập nhật lịch sử dùng thuốc.");
    }
  };

  // Handle deleting medication administration
  const handleDeleteMedication = async () => {
    const result = await deleteMedicationAdministration(deleteId);
    if (result.success) {
      toast.success("Xóa lịch sử dùng thuốc thành công!");
      setShowDeleteModal(false);
    } else {
      toast.error(result.error?.message || "Không thể xóa lịch sử dùng thuốc.");
    }
  };

  // Open add modal
  const openAddModal = () => {
    setIsEditing(false);
    resetModalData();
    setShowModal(true);
  };

  // Open edit modal with medication data
  const openEditModal = (medication) => {
    setIsEditing(true);
    setModalData({
      id: medication.id,
      medicationInstructionId: medication.medicationInstructionId,
      administeredAt: new Date(medication.administeredAt).toISOString().slice(0, 16),
      administrationStatus: medication.administrationStatus,
      notes: medication.notes || ''
    });
    setShowModal(true);
  };

  // Open delete confirmation modal
  const openDeleteModal = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  // Reset modal data
  const resetModalData = () => {
    setModalData({
      medicationInstructionId: '',
      administeredAt: new Date().toISOString().slice(0, 16),
      administrationStatus: 'SUCCESSFUL',
      notes: ''
    });
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setModalData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle viewing image
  const handleViewImage = (imageUrl) => {
    if (imageUrl) {
      setSelectedImage(imageUrl);
      setShowImageModal(true);
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
  };

  // Handle pagination change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchMedicationAdministrations(page, pageSize);
    }
  };

  // Filter by search term with null check
  const filteredAdministrations = administrations && administrations.length > 0 ? 
    administrations.filter(medication => {
      // Search filter
      const searchMatch = searchTerm === '' || 
        (medication.studentName && medication.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (medication.medicationName && medication.medicationName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (medication.administeredBy && medication.administeredBy.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Status filter
      const statusMatch = statusFilter === '' || medication.administrationStatus === statusFilter;
      
      return searchMatch && statusMatch;
    }) : [];

  console.log('🔍 MedicationHistory - Filtered data:', {
    originalCount: administrations?.length || 0,
    filteredCount: filteredAdministrations.length,
    searchTerm,
    hasData: !!administrations
  });

  return (
    <Container fluid className="medication-history-container py-4">
      {/* Inject dropdown styles */}
      <style dangerouslySetInnerHTML={{ __html: dropdownStyles }} />
      
      {/* Enhanced Filter Section - Styled like MedicineReceipts */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header text-white" style={{background: 'linear-gradient(135deg, #015C92 0%, #2D82B5 100%)'}}>
              <h5 className="mb-0" style={{color: 'white'}}>
                <i className="fas fa-filter me-2"></i>
                Tìm kiếm và lọc lịch sử dùng thuốc
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3 align-items-end">
                {/* Status Filter */}
                <div className="col-md-4">
                  <label htmlFor="statusFilter" className="form-label fw-bold">
                    <i className="fas fa-tasks me-1"></i>
                    Trạng thái
                  </label>
                  <Form.Select
                    id="statusFilter"
                    className="form-select form-select-lg medication-history-dropdown"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">Tất cả</option>
                    <option value="PENDING_APPROVAL">Chờ phê duyệt</option>
                    <option value="APPROVED">Đã duyệt</option>
                    <option value="REJECTED">Từ chối</option>
                    <option value="FULLY_TAKEN">Đã uống đầy đủ</option>
                    <option value="PARTIALLY_TAKEN">Uống một phần</option>
                    <option value="EXPIRED">Đã hết hạn</option>
                    <option value="SUCCESSFUL">Thành công</option>
                    <option value="REFUSED">Từ chối</option>
                    <option value="PARTIAL">Một phần</option>
                  </Form.Select>
                </div>

                {/* Search Input */}
                <div className="col-md-6">
                  <label htmlFor="searchTerm" className="form-label fw-bold">
                    <i className="fas fa-search me-1"></i>
                    Tìm kiếm
                  </label>
                  <Form.Control
                    id="searchTerm"
                    type="text"
                    className="form-control form-control-lg"
                    placeholder="Tìm kiếm theo tên học sinh, tên thuốc, người thực hiện..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Reset Button */}
                <div className="col-md-2">
                  <Button
                    variant="outline-secondary"
                    className="btn btn-outline-secondary btn-lg w-100"
                    onClick={clearAllFilters}
                    title="Xóa bộ lọc"
                  >
                    <i className="fas fa-redo me-2"></i>
                    Đặt lại
                  </Button>
                </div>
              </div>

              {/* Results Info */}
              {filteredAdministrations.length > 0 && (
                <div className="row mt-3">
                  <div className="col-12">
                    <div className="alert alert-info mb-0">
                      <i className="fas fa-info-circle me-2"></i>
                      Tìm thấy <strong>{filteredAdministrations.length}</strong> bản ghi lịch sử dùng thuốc
                      {statusFilter !== "" && (
                        <span> với trạng thái <strong>{statusConfig[statusFilter]?.text || statusFilter}</strong></span>
                      )}
                      {searchTerm.trim() !== "" && (
                        <span> cho từ khóa "<strong>{searchTerm}</strong>"</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Card className="shadow-sm">
        <Card.Header className="py-3" style={{background: 'linear-gradient(135deg, #015C92 0%, #2D82B5 100%)'}}>
          <Row className="align-items-center">
            <Col>
              <h5 className="mb-0 fw-bold" style={{color: 'white', marginRight: '20px'}}>
                <i className="fas fa-list me-2"></i>
                Lịch sử dùng thuốc ({filteredAdministrations.length} bản ghi)
              </h5>
              <small style={{color: 'rgba(255, 255, 255, 0.8)'}}>Chế độ chỉ xem - không thể thêm, sửa hoặc xóa</small>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body>
          {/* Error message display */}
          {error && (
            <Alert variant="danger" className="mb-4" dismissible onClose={handleClearError}>
              <Alert.Heading>Lỗi tải dữ liệu</Alert.Heading>
              <p className="mb-2">{error}</p>
              <Button 
                variant="outline-danger" 
                size="sm" 
                onClick={() => fetchMedicationAdministrations(currentPage, pageSize)}
              >
                Thử lại
              </Button>
            </Alert>
          )}

          {/* Medication history table */}
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Đang tải dữ liệu...</p>
            </div>
          ) : (
            <div className="table-responsive">
              {!filteredAdministrations || filteredAdministrations.length === 0 ? (
                <Alert variant="info" className="text-center">
                  <h6>Không có dữ liệu lịch sử dùng thuốc</h6>
                  <p className="mb-0">
                    {searchTerm ? 
                      `Không có kết quả cho từ khóa "${searchTerm}"` : 
                      "Chưa có dữ liệu lịch sử dùng thuốc nào được ghi nhận"}
                  </p>
                </Alert>
              ) : (
                <Table hover className="align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="ps-4">ID</th>
                      <th>Tên học sinh</th>
                      <th>Tên thuốc</th>
                      <th>Thời gian dùng</th>
                      <th>Người thực hiện</th>
                      <th>Trạng thái</th>
                      <th className="text-center image-column">Ảnh xác nhận</th>
                    </tr>
                  </thead>
                  <tbody>                    {filteredAdministrations.map((medication) => (
                      <tr key={medication.id || Math.random()}>
                        <td className="ps-4 fw-bold">{medication.id || 'N/A'}</td>
                        <td>{medication.studentName || 'N/A'}</td>
                        <td>{medication.medicationName || 'N/A'}</td>
                        <td>{formatDate(medication.administeredAt || null)}</td>
                        <td>{medication.administeredBy || 'N/A'}</td>
                        <td>
                          {medication.administrationStatus && statusConfig[medication.administrationStatus] ? (
                            <Badge 
                              bg={statusConfig[medication.administrationStatus].color} 
                              className="d-inline-flex align-items-center py-2 px-3"
                            >
                              {statusConfig[medication.administrationStatus].icon}
                              {statusConfig[medication.administrationStatus].text}
                            </Badge>
                          ) : (
                            <Badge bg="secondary" title={`Trạng thái không xác định: ${medication.administrationStatus || 'null'}`}>
                              Không xác định ({medication.administrationStatus || 'null'})
                            </Badge>
                          )}
                        </td>
                        <td className="text-center image-column">
                          {(medication.imageUrl || medication.confirmationImageUrl) ? (
                            <Button 
                              variant="outline-info" 
                              size="sm" 
                              className="image-btn"
                              title="Xem ảnh xác nhận"
                              onClick={() => handleViewImage(medication.imageUrl || medication.confirmationImageUrl)}
                            >
                              <FaEye className="me-1" />
                              Xem ảnh
                            </Button>
                          ) : (
                            <Badge bg="secondary" className="no-image-badge">
                              <FaImage className="me-1" />
                              Không có ảnh
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}

              {/* Simple Pagination with "1 / 3" style */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-4 px-3">
                  {/* Showing entries info */}
                  <div className="text-muted">
                    <small>
                      Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
                    </small>
                  </div>

                  {/* Pagination controls */}
                  <div className="d-flex align-items-center gap-2">
                    {/* First page button */}
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(1)}
                      title="Trang đầu"
                      style={{ minWidth: '40px' }}
                    >
                      <FaAngleDoubleLeft />
                    </button>

                    {/* Previous page button */}
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                      title="Trang trước"
                      style={{ minWidth: '40px' }}
                    >
                      <FaAngleLeft />
                    </button>

                    {/* Current page indicator */}
                    <div
                      className="px-3 py-1 bg-primary text-white rounded"
                      style={{
                        minWidth: '60px',
                        textAlign: 'center',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                    >
                      {currentPage} / {totalPages}
                    </div>

                    {/* Next page button */}
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                      title="Trang tiếp"
                      style={{ minWidth: '40px' }}
                    >
                      <FaAngleRight />
                    </button>

                    {/* Last page button */}
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(totalPages)}
                      title="Trang cuối"
                      style={{ minWidth: '40px' }}
                    >
                      <FaAngleDoubleRight />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Image Viewing Modal */}
      <Modal 
        show={showImageModal} 
        onHide={() => setShowImageModal(false)} 
        centered 
        size="lg"
        className="medication-history-image-modal"
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>Ảnh xác nhận dùng thuốc</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedImage ? (
            <div className="confirmation-image-container">
              <img 
                src={selectedImage} 
                alt="Ảnh xác nhận dùng thuốc" 
                className="confirmation-medicine-image"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y4ZjlmYSIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2Yjc0ODMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5LaG9uZyB0aGUgdGFpIGFuaDwvdGV4dD4KPC9zdmc+';
                  e.target.alt = 'Không thể tải ảnh';
                }}
                onClick={() => window.open(selectedImage, '_blank')}
              />
            </div>
          ) : (
            <div className="no-confirmation-image-placeholder">
              <FaImage className="no-confirmation-image-icon" />
              <h6 className="mb-2">Không có ảnh xác nhận</h6>
              <p className="mb-0">Không có ảnh xác nhận được tải lên cho lần sử dụng thuốc này</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowImageModal(false)}
          >
            <FaTimes className="me-2" />
            Đóng
          </Button>
          {selectedImage && (
            <Button 
              variant="primary" 
              onClick={() => window.open(selectedImage, '_blank')}
            >
              <FaEye className="me-2" />
              Mở ảnh gốc
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MedicationHistory;
