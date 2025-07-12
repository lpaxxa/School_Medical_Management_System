import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Table, Form, Button,
  Spinner, Alert, Modal, InputGroup, Badge
} from 'react-bootstrap';
import {
  FaSearch, FaEye, FaImage,
  FaCheckCircle, FaTimesCircle, FaExclamationTriangle, 
  FaExclamationCircle, FaAngleLeft, FaAngleRight,
  FaAngleDoubleLeft, FaAngleDoubleRight
} from 'react-icons/fa';
import './MedicationHistory.css';
import { useMedicationAdministration } from '../../../../../context/NurseContext/MedicineApprovalContext';
import { toast } from 'react-toastify';


const MedicationHistory = () => {
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

  // Helper function to normalize Vietnamese text by removing diacritics
  const removeVietnameseDiacritics = (text) => {
    if (!text) return '';
    return text
      .toLowerCase()
      .normalize('NFD') // Decompose characters
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      // Additional Vietnamese-specific replacements
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd');
  };

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
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
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

  // Handle search - fetch all data when searching, use paginated data when not searching
  const handleSearch = async (searchValue) => {
    setSearchTerm(searchValue);
    
    if (searchValue.trim() === '') {
      // Clear search - go back to paginated view
      setSearchResults([]);
      setIsSearching(false);
      fetchMedicationAdministrations(currentPage, pageSize);
    } else {
      // Search mode - fetch all data to search through
      setIsSearching(true);
      try {
        // Fetch a large number of records to get all data
        // Note: You may want to create a specific search endpoint instead of fetching all records
        await fetchMedicationAdministrations(1, 1000);
        
        // Wait a bit for the state to update, then filter
        setTimeout(() => {
          if (administrations && administrations.length > 0) {
            // Use the same normalization logic for search
            const normalizedSearchTerm = removeVietnameseDiacritics(searchValue);
            
            const filtered = administrations.filter(medication => {
              return (
                (medication.studentName && removeVietnameseDiacritics(medication.studentName).includes(normalizedSearchTerm)) ||
                (medication.medicationName && removeVietnameseDiacritics(medication.medicationName).includes(normalizedSearchTerm)) ||
                (medication.administeredBy && removeVietnameseDiacritics(medication.administeredBy).includes(normalizedSearchTerm))
              );
            });
            
            setSearchResults(filtered);
          } else {
            setSearchResults([]);
          }
          setIsSearching(false);
        }, 100);
        
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
        setIsSearching(false);
      }
    }
  };

  // Handle viewing image
  const handleViewImage = (imageUrl) => {
    if (imageUrl) {
      setSelectedImage(imageUrl);
      setShowImageModal(true);
    }
  };
  // Handle pagination change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchMedicationAdministrations(page, pageSize);
    }
  };


  // Use either search results or normal paginated data
  const displayedAdministrations = searchTerm === '' ? 
    (administrations || []) : 
    searchResults;

  console.log('🔍 MedicationHistory - Displayed data:', {
    originalCount: administrations?.length || 0,
    displayedCount: displayedAdministrations.length,
    searchTerm,
    isSearching,
    hasData: !!administrations
  });

  return (
    <Container fluid className="py-4">
      <Card className="shadow-sm">
        <Card.Header className="bg-white py-3">
          <Row className="align-items-center">
            <Col>
              <h5 className="mb-0 fw-bold text-primary">Lịch sử dùng thuốc (Chỉ xem)</h5>
              <small className="text-muted">Chế độ chỉ xem - không thể thêm, sửa hoặc xóa</small>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body>
          {/* Search and filter controls */}
          <Row className="mb-4">
            <Col lg={6} md={8} className="mb-3 mb-lg-0">
              <InputGroup>
                <InputGroup.Text className="bg-light">
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Tìm kiếm theo tên học sinh, tên thuốc..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </InputGroup>
            </Col>
          </Row>

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
          {loading || isSearching ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">{isSearching ? 'Đang tìm kiếm...' : 'Đang tải dữ liệu...'}</p>
            </div>
          ) : (
            <div className="table-responsive">
              {!displayedAdministrations || displayedAdministrations.length === 0 ? (
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
                  <tbody>
                    {displayedAdministrations.map((medication) => (
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

              {/* Arrow Navigation Pagination */}
              {searchTerm === '' ? (
                // Show backend pagination when no search filter is applied
                totalPages > 1 && (
                  <div className="pagination-container">
                    <div className="pagination-info">
                      Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
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
                )
              ) : (
                // Show filtered results info when search is active
                displayedAdministrations.length > 0 && (
                  <div className="pagination-container">
                    <div className="pagination-info">
                      {displayedAdministrations.length} results found 
                      {searchTerm && ` for "${searchTerm}"`}
                    </div>
                  </div>
                )
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
        dialogClassName="medication-history-image-modal-dialog"
      >
        <Modal.Header closeButton>
          <Modal.Title>Ảnh xác nhận dùng thuốc</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {selectedImage ? (
            <div>
              <img 
                src={selectedImage} 
                alt="Ảnh xác nhận dùng thuốc" 
                className="img-fluid"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y4ZjlmYSIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2Yjc0ODMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5LaG9uZyB0aGUgdGFpIGFuaDwvdGV4dD4KPC9zdmc+';
                  e.target.alt = 'Không thể tải ảnh';
                }}
              />
              <div className="mt-3">
                <small className="text-muted">
                  Click vào ảnh để phóng to hoặc nhấn ESC để đóng
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
          <Button variant="secondary" onClick={() => setShowImageModal(false)}>
            Đóng
          </Button>
          {selectedImage && (
            <Button 
              variant="primary" 
              onClick={() => window.open(selectedImage, '_blank')}
            >
              Mở ảnh gốc
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MedicationHistory;
