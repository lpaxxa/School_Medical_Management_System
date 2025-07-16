import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Card, Modal, Spinner, Form, Row, Col } from 'react-bootstrap';
import { useHealthCheckup } from '../../../../../context/NurseContext/HealthCheckupContext';
import Swal from 'sweetalert2';
import './ScheduleConsultation.css';
import './ScheduleEditModal.css';
import CheckupDetailModal from './CheckupDetailModal';

const MedicalCheckupList = ({ refreshData }) => {
  // Get data from context
  const { 
    medicalCheckups, 
    loading, 
    error, 
    fetchMedicalCheckupById, 
    updateMedicalCheckup,
    sendParentNotification,
    refreshMedicalCheckups,
    notifyParent,
    batchNotifyParents,
    // Student Records functions
    getStudentIdByName,
    fetchAllStudents,
    searchStudentsByName,
  } = useHealthCheckup();

  // State for detail modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCheckup, setSelectedCheckup] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  
  // State for edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  
  // State for validation
  const [validated, setValidated] = useState(false);
  const [errors, setErrors] = useState({});
  
  // State for single notification modal
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  
  // State for batch notification modal
  const [showBatchNotificationModal, setShowBatchNotificationModal] = useState(false);
  
  // State for filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [campaignFilter, setCampaignFilter] = useState('');
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // State for student ID lookup
  const [studentIdMap, setStudentIdMap] = useState({});
  const [loadingStudentIds, setLoadingStudentIds] = useState(false);

  // Load data when component mounts
  useEffect(() => {
    refreshMedicalCheckups();
    loadStudentIds();
  }, []);

  // Load student IDs for name lookup
  const loadStudentIds = async () => {
    try {
      setLoadingStudentIds(true);
      const allStudents = await fetchAllStudents();
      
      // Create a map from student name to student ID
      const idMap = {};
      allStudents.forEach(student => {
        if (student.name && student.studentId) {
          idMap[student.name.toLowerCase().trim()] = student.studentId;
        }
      });
      
      setStudentIdMap(idMap);
    } catch (error) {
      console.error('Error loading student IDs:', error);
    } finally {
      setLoadingStudentIds(false);
    }
  };

  // Get student ID by name from the map
  const getStudentIdFromName = (studentName) => {
    if (!studentName) return 'N/A';
    const normalizedName = studentName.toLowerCase().trim();
    return studentIdMap[normalizedName] || 'N/A';
  };

  // Filter checkups based on search term, status, date, and campaign
  const filteredCheckups = medicalCheckups.filter(checkup => {
    const matchesSearch = 
      checkup.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      checkup.studentId?.toString().includes(searchTerm) ||
      checkup.studentClass?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || checkup.checkupStatus === statusFilter;
    
    const matchesDate = dateFilter === '' ||
      (checkup.checkupDate && new Date(checkup.checkupDate).toISOString().split('T')[0] === dateFilter);
    
    const matchesCampaign = campaignFilter === '' ||
      checkup.campaignTitle?.toLowerCase().includes(campaignFilter.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesDate && matchesCampaign;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredCheckups.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCheckups = filteredCheckups.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFilter, campaignFilter]);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Simple pagination with "1 / 3" style
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="d-flex justify-content-between align-items-center mt-4 px-3">
        {/* Showing entries info */}
        <div className="text-muted">
          <small>
            Showing {startIndex + 1} to {Math.min(endIndex, filteredCheckups.length)} of {filteredCheckups.length} checkups
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
            <i className="fas fa-angle-double-left"></i>
          </button>

          {/* Previous page button */}
          <button
            className="btn btn-outline-secondary btn-sm"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            title="Trang trước"
            style={{ minWidth: '40px' }}
          >
            <i className="fas fa-angle-left"></i>
          </button>

          {/* Current page indicator */}
          <div
            className="px-3 py-1 text-white rounded"
            style={{
              minWidth: '60px',
              textAlign: 'center',
              fontSize: '14px',
              fontWeight: '500',
              background: 'linear-gradient(135deg, #015C92 0%, #2D82B5 100%)'
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
            <i className="fas fa-angle-right"></i>
          </button>

          {/* Last page button */}
          <button
            className="btn btn-outline-secondary btn-sm"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(totalPages)}
            title="Trang cuối"
            style={{ minWidth: '40px' }}
          >
            <i className="fas fa-angle-double-right"></i>
          </button>
        </div>
      </div>
    );
  };

  // Handle view checkup details
  const handleViewCheckupDetail = async (checkup) => {
    try {
      setDetailLoading(true);
      setSelectedCheckup(null);
      
      const checkupDetail = await fetchMedicalCheckupById(checkup.id);
      
      setSelectedCheckup(checkupDetail);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error fetching checkup details:', error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Không thể tải thông tin chi tiết. Vui lòng thử lại sau.',
      });
    } finally {
      setDetailLoading(false);
    }
  };

  // Handle edit checkup
  const handleEditCheckup = async (checkup) => {
    try {
      setDetailLoading(true);
      const checkupDetail = await fetchMedicalCheckupById(checkup.id);
      
      setEditFormData({ ...checkupDetail, specialCheckupItems: checkupDetail.specialCheckupItems || [] });
      setShowEditModal(true);
      setValidated(false); // Reset validation state
      setErrors({});
    } catch (error) {
      console.error('Error fetching checkup details for edit:', error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Không thể tải thông tin để chỉnh sửa. Vui lòng thử lại sau.',
      });
    } finally {
      setDetailLoading(false);
    }
  };

  const validateForm = (data) => {
    const newErrors = {};
    if (!data.checkupDate) newErrors.checkupDate = 'Ngày khám là bắt buộc.';
    if (!data.checkupStatus) newErrors.checkupStatus = 'Trạng thái khám là bắt buộc.';
    
    // Numeric fields validation
    const numericFields = ['height', 'weight', 'bmi', 'bodyTemperature', 'heartRate'];
    numericFields.forEach(field => {
        if (data[field] && (isNaN(data[field]) || Number(data[field]) <= 0)) {
            newErrors[field] = 'Giá trị phải là một số dương.';
        }
    });

    // Blood pressure validation
    if (data.bloodPressure && !/^\d+\/\d+$/.test(data.bloodPressure)) {
        newErrors.bloodPressure = 'Định dạng huyết áp không hợp lệ (ví dụ: 120/80).';
    }

    // Vision validation for both eyes
    if (data.visionLeft && !/^\d+\/\d+$/.test(data.visionLeft)) {
        newErrors.visionLeft = 'Định dạng không hợp lệ (VD: 10/10).';
    }
    if (data.visionRight && !/^\d+\/\d+$/.test(data.visionRight)) {
        newErrors.visionRight = 'Định dạng không hợp lệ (VD: 10/10).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle submit updated data
  const handleUpdateSubmit = async (updatedData) => {
    setValidated(true);
    if (!validateForm(updatedData)) {
        Swal.fire({
            icon: 'error',
            title: 'Dữ liệu không hợp lệ',
            text: 'Vui lòng kiểm tra lại các thông tin đã nhập.',
        });
        return;
    }

    setSubmitting(true);
    try {
        await updateMedicalCheckup(updatedData.id, updatedData);
        Swal.fire({
            icon: 'success',
            title: 'Thành công!',
            text: `Đã cập nhật hồ sơ cho học sinh ${updatedData.studentName} thành công!`,
            timer: 2000,
            showConfirmButton: false,
        });
        setShowEditModal(false);
        refreshMedicalCheckups();
    } catch (error) {
        console.error("Failed to update checkup", error);
        const errorMessage = error?.response?.data || error?.message || 'Cập nhật thất bại. Vui lòng thử lại.';
        Swal.fire({
            icon: 'error',
            title: 'Cập nhật thất bại',
            text: errorMessage,
        });
    } finally {
        setSubmitting(false);
    }
  };
  
  // Handle open send notification modal
  const handleSendNotification = (checkup) => {
    Swal.fire({
      title: 'Xác nhận gửi thông báo',
      html: `Bạn có chắc chắn muốn gửi thông báo kết quả khám cho phụ huynh của em <strong>${checkup.studentName}</strong> không?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Đúng, gửi đi!',
      cancelButtonText: 'Hủy',
    }).then((result) => {
      if (result.isConfirmed) {
        confirmSendNotification(checkup);
      }
    });
  };
  
  // Handle open batch notification modal
  const handleBatchNotification = () => {
    const checkupsToNotify = filteredCheckups.filter(c => c.checkupStatus === 'COMPLETED' || c.checkupStatus === 'NEED_FOLLOW_UP');
    if(checkupsToNotify.length === 0) {
        Swal.fire('Không có hồ sơ nào', 'Không có hồ sơ nào ở trạng thái "Đã hoàn thành" hoặc "Cần theo dõi" để gửi thông báo.', 'info');
        return;
    }

    Swal.fire({
      title: 'Xác nhận gửi hàng loạt',
      html: `Bạn có chắc chắn muốn gửi thông báo cho phụ huynh của <strong>${checkupsToNotify.length} học sinh</strong> có hồ sơ đã hoàn thành hoặc cần theo dõi không?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Đúng, gửi cho tất cả!',
      cancelButtonText: 'Hủy',
    }).then((result) => {
      if (result.isConfirmed) {
        confirmBatchNotification();
      }
    });
  };

  // Handle confirm sending notification
  const confirmSendNotification = async (checkup) => {
    if (!checkup) return;
    setSubmitting(true);
    try {
      await notifyParent(checkup.id);
      Swal.fire(
        'Đã gửi!',
        `Đã gửi thông báo cho phụ huynh em ${checkup.studentName}.`,
        'success'
      );
    } catch (error) {
      Swal.fire(
        'Lỗi!',
        `Lỗi khi gửi thông báo: ${error.message}`,
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle confirm batch notification
  const confirmBatchNotification = async () => {
    setSubmitting(true);
    try {
      const checkupIds = filteredCheckups
        .filter(c => c.checkupStatus === 'COMPLETED' || c.checkupStatus === 'NEED_FOLLOW_UP')
        .map(c => c.id);
        
      if (checkupIds.length === 0) {
        Swal.fire('Không có hồ sơ nào', 'Không có hồ sơ phù hợp để gửi thông báo.', 'info');
        return;
      }

      await batchNotifyParents(checkupIds);
      Swal.fire(
        'Đã gửi hàng loạt!',
        `Đã gửi thông báo thành công cho ${checkupIds.length} phụ huynh.`,
        'success'
      );
      refreshMedicalCheckups();
    } catch (error) {
      Swal.fire(
        'Lỗi!',
        `Gửi hàng loạt thất bại: ${error.message}`,
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Handle refresh button - reset all filters and reload data
  const handleRefresh = () => {
    setSearchTerm('');
    setStatusFilter('');
    setDateFilter('');
    setCampaignFilter('');
    setCurrentPage(1);
    refreshMedicalCheckups();
    loadStudentIds(); // Reload student IDs as well
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'NEED_FOLLOW_UP': return 'warning';
      default: return 'secondary';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  return (
    <>
      <style>
        {`
          /* Fix dropdown arrow for Form.Select */
          .form-select {
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m1 6 7 7 7-7'/%3e%3c/svg%3e") !important;
            background-repeat: no-repeat !important;
            background-position: right 0.75rem center !important;
            background-size: 16px 12px !important;
            padding-right: 2.25rem !important;
            appearance: none !important;
            -webkit-appearance: none !important;
            -moz-appearance: none !important;
          }

          .form-select:focus {
            border-color: #86b7fe !important;
            outline: 0 !important;
            box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25) !important;
          }

          .form-select:disabled {
            background-color: #e9ecef !important;
            opacity: 1 !important;
          }
        `}
      </style>
      <div className="medical-checkup-list-container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Danh sách khám sức khỏe</h2>
        <div className="d-flex align-items-center gap-3">
          <span className="text-muted">
            Hiển thị {currentCheckups.length} / {filteredCheckups.length} bản ghi
          </span>
          <Button variant="info" className="me-2" onClick={() => handleBatchNotification()} style={{color : 'white'}}>
            <i className="fas fa-paper-plane me-2"></i>
            Gửi thông báo cho {filteredCheckups.length} người
          </Button>
          <Button variant="outline-secondary" onClick={handleRefresh}>
            <i className="fas fa-sync-alt"></i>
          </Button>
        </div>
      </div>
      
      <div className="filter-container mb-3">
        <div className="row">
          <div className="col-md-3">
            <Form.Control
              type="text"
              placeholder="Tìm kiếm theo tên, mã học sinh"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-2"
            />
          </div>
          <div className="col-md-2">
            <Form.Select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="mb-2"
            >
              <option value="">Trạng thái</option>
              <option value="COMPLETED">Đã hoàn thành</option>
              <option value="NEED_FOLLOW_UP">Cần theo dõi</option>
            </Form.Select>
          </div>
          <div className="col-md-2">
            <Form.Control
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="mb-2"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="col-md-3">
            <Form.Control
              type="text"
              placeholder="Tìm kiếm theo tên chiến dịch..."
              value={campaignFilter}
              onChange={(e) => setCampaignFilter(e.target.value)}
              className="mb-2"
            />
          </div>
          <div className="col-md-2">
            <Button 
              variant="primary" 
              className="w-100"
              onClick={handleRefresh}
            >
              <i className="fas fa-sync-alt"></i> Làm mới
            </Button>
          </div>
        </div>
      </div>
      
      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Đang tải...</span>
          </Spinner>
        </div>
      )}
      
      {error && !loading && (
        <div className="alert alert-danger">{error}</div>
      )}
      
      {!loading && !error && (
        <Card>
          <Card.Body>
            <div className="table-responsive">
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Mã học sinh</th>
                    <th>Tên học sinh</th>
                    <th>Lớp</th>
                    <th>Trạng thái</th>
                    <th>Ngày khám</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCheckups.length > 0 ? (
                    currentCheckups.map((checkup, index) => (
                      <tr key={checkup.id}>
                        <td>{startIndex + index + 1}</td>
                        <td>
                          {loadingStudentIds ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            getStudentIdFromName(checkup.studentName)
                          )}
                        </td>
                        <td>{checkup.studentName}</td>
                        <td>{checkup.studentClass}</td>
                        <td>
                          <Badge bg={getStatusVariant(checkup.checkupStatus)}>
                            {checkup.checkupStatus === 'COMPLETED' ? 'Đã hoàn thành' : 'Cần theo dõi'}
                          </Badge>
                        </td>
                        <td>{formatDate(checkup.checkupDate)}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button variant="info" size="sm" onClick={() => handleViewCheckupDetail(checkup)} title="Xem chi tiết">
                              <i className="fas fa-eye"></i>
                            </Button>
                            <Button variant="warning" size="sm" onClick={() => handleEditCheckup(checkup)} title="Chỉnh sửa">
                              <i className="fas fa-edit"></i>
                            </Button>
                            {checkup.checkupStatus === 'NEED_FOLLOW_UP' && (
                              <Button variant="primary" size="sm" onClick={() => handleSendNotification(checkup)} title="Gửi thông báo">
                                <i className="fas fa-paper-plane"></i>
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-3">Không tìm thấy dữ liệu</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}
      
      {/* Pagination */}
      {!loading && !error && renderPagination()}
      
      {/* Detail Modal */}
      {selectedCheckup && (
      <CheckupDetailModal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
          checkup={selectedCheckup}
      />
      )}
      
      {/* Edit Modal */}
      {showEditModal && (
      <ScheduleEditCheckupModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        checkupData={editFormData}
        onSubmit={handleUpdateSubmit}
        loading={submitting}
          validated={validated}
          errors={errors}
          setCheckupData={setEditFormData}
        />
      )}
    </div>
    </>
  );
};

// =================================================================
// Edit Checkup Modal Component
// =================================================================
const ScheduleEditCheckupModal = ({ show, onHide, checkupData, onSubmit, loading, validated, errors, setCheckupData }) => {
    
    const [formData, setFormData] = useState(checkupData);

    useEffect(() => {
        setFormData(checkupData);
    }, [checkupData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (setCheckupData) {
            setCheckupData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        // Handles both ISO strings and simple date strings
        return new Date(dateString).toISOString().split('T')[0];
    };

    return (
        <Modal 
            show={show} 
            onHide={onHide} 
            size="xl" 
            dialogClassName="schedule-edit-checkup-modal"
            aria-labelledby="edit-checkup-modal"
            centered
        >
            <Modal.Header closeButton className="schedule-edit-modal-header">
                <Modal.Title id="edit-checkup-modal" className="schedule-edit-modal-title">
                    Chỉnh sửa Hồ sơ khám: {formData.studentName}
                </Modal.Title>
            </Modal.Header>
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Modal.Body className="schedule-edit-modal-body">
                    {/* General Info Section */}
                    <div className="schedule-form-section">
                        <h5>Thông tin chung (Không thể thay đổi)</h5>
                        <Row>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Mã học sinh</Form.Label>
                                    <Form.Control type="text" value={formData.studentId || ''} readOnly disabled />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Học sinh</Form.Label>
                                    <Form.Control type="text" value={formData.studentName || ''} readOnly disabled />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Lớp</Form.Label>
                                    <Form.Control type="text" value={formData.studentClass || ''} readOnly disabled />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                             <Col md={12}>
                                <Form.Group>
                                    <Form.Label>Chiến dịch khám</Form.Label>
                                    <Form.Control as="textarea" rows={2} value={formData.campaignTitle || ''} readOnly disabled />
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>

                    {/* Checkup Info Section */}
                    <div className="schedule-form-section">
                        <h5>Thông tin khám</h5>
                        <Row>
                            <Col md={4}>
                                <Form.Group controlId="checkupDate">
                                    <Form.Label>Ngày khám</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="checkupDate"
                                        value={formatDateForInput(formData.checkupDate)}
                                        onChange={handleChange}
                                        required
                                        isInvalid={!!errors.checkupDate}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.checkupDate}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                 <Form.Group controlId="checkupStatus">
                                    <Form.Label>Trạng thái khám</Form.Label>
                                    <Form.Select
                                        name="checkupStatus"
                                        value={formData.checkupStatus || ''}
                                        onChange={handleChange}
                                        required
                                        isInvalid={!!errors.checkupStatus}
                                    >
                                        <option value="">Chọn trạng thái</option>
                                        <option value="COMPLETED">Đã hoàn thành</option>
                                        <option value="NEED_FOLLOW_UP">Cần theo dõi</option>
                                        <option value="CANCELLED">Đã hủy</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.checkupStatus}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                             <Col md={4}>
                                <Form.Group controlId="checkupType">
                                    <Form.Label>Loại hình khám</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="checkupType"
                                        value={formData.checkupType || ''}
                                        onChange={handleChange}
                                        placeholder="Ví dụ: Định kỳ giữa năm"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>

                    {/* Health Metrics Section */}
                    <div className="schedule-form-section">
                        <h5>Kết quả khám</h5>
                        <Row>
                            <Col md={3} sm={6}>
                                <Form.Group controlId="height">
                                    <Form.Label>Chiều cao (cm)</Form.Label>
                                    <Form.Control type="number" name="height" value={formData.height || ''} onChange={handleChange} isInvalid={!!errors.height} />
                                    <Form.Control.Feedback type="invalid">{errors.height}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={3} sm={6}>
                                <Form.Group controlId="weight">
                                    <Form.Label>Cân nặng (kg)</Form.Label>
                                    <Form.Control type="number" name="weight" value={formData.weight || ''} onChange={handleChange} isInvalid={!!errors.weight} />
                                    <Form.Control.Feedback type="invalid">{errors.weight}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={3} sm={6}>
                                <Form.Group controlId="bmi">
                                    <Form.Label>BMI</Form.Label>
                                    <Form.Control type="number" name="bmi" value={formData.bmi || ''} onChange={handleChange} isInvalid={!!errors.bmi} />
                                    <Form.Control.Feedback type="invalid">{errors.bmi}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                             <Col md={3} sm={6}>
                                <Form.Group controlId="bodyTemperature">
                                    <Form.Label>Nhiệt độ (°C)</Form.Label>
                                    <Form.Control type="number" name="bodyTemperature" value={formData.bodyTemperature || ''} onChange={handleChange} isInvalid={!!errors.bodyTemperature} />
                                    <Form.Control.Feedback type="invalid">{errors.bodyTemperature}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={3} sm={6}>
                                <Form.Group controlId="heartRate">
                                    <Form.Label>Nhịp tim (bpm)</Form.Label>
                                    <Form.Control type="number" name="heartRate" value={formData.heartRate || ''} onChange={handleChange} isInvalid={!!errors.heartRate} />
                                    <Form.Control.Feedback type="invalid">{errors.heartRate}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={3} sm={6}>
                                <Form.Group controlId="bloodPressure">
                                    <Form.Label>Huyết áp</Form.Label>
                                    <Form.Control type="text" name="bloodPressure" placeholder="VD: 120/80" value={formData.bloodPressure || ''} onChange={handleChange} isInvalid={!!errors.bloodPressure} />
                                     <Form.Control.Feedback type="invalid">{errors.bloodPressure}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={3} sm={6}>
                                <Form.Group controlId="visionLeft">
                                    <Form.Label>Thị lực (Trái)</Form.Label>
                                    <Form.Control type="text" name="visionLeft" placeholder="VD: 10/10" value={formData.visionLeft || ''} onChange={handleChange} isInvalid={!!errors.visionLeft} />
                                    <Form.Control.Feedback type="invalid">{errors.visionLeft}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={3} sm={6}>
                                <Form.Group controlId="visionRight">
                                    <Form.Label>Thị lực (Phải)</Form.Label>
                                    <Form.Control type="text" name="visionRight" placeholder="VD: 10/10" value={formData.visionRight || ''} onChange={handleChange} isInvalid={!!errors.visionRight} />
                                    <Form.Control.Feedback type="invalid">{errors.visionRight}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>

                    {/* Diagnosis and Notes Section */}
                    <div className="schedule-form-section">
                        <h5>Chẩn đoán và Đề nghị</h5>
                         <Row>
                            <Col md={12}>
                                <Form.Group controlId="diagnosis">
                            <Form.Label>Chẩn đoán</Form.Label>
                            <Form.Control as="textarea" rows={3} name="diagnosis" value={formData.diagnosis || ''} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={12}>
                                <Form.Group controlId="notes">
                                    <Form.Label>Đề nghị của bác sĩ</Form.Label>
                                    <Form.Control as="textarea" rows={3} name="notes" value={formData.notes || ''} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>
                </Modal.Body>
                <Modal.Footer className="schedule-edit-modal-footer">
                    <Button variant="secondary" onClick={onHide} className="schedule-close-btn" disabled={loading}>
                        Đóng
                    </Button>
                    <Button variant="primary" type="submit" className="schedule-save-btn" disabled={loading}>
                        {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Lưu thay đổi'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default MedicalCheckupList;