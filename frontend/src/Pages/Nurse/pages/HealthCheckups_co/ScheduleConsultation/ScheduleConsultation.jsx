import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Card, Modal, Spinner, Form, Row, Col } from 'react-bootstrap';
import { useHealthCheckup } from '../../../../../context/NurseContext/HealthCheckupContext';
import { toast } from 'react-toastify';
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

  // Render pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <Button
          key={i}
          variant={currentPage === i ? "primary" : "outline-primary"}
          size="sm"
          onClick={() => handlePageChange(i)}
          className="mx-1"
        >
          {i}
        </Button>
      );
    }

    return (
      <div className="d-flex flex-column align-items-center mt-3">
        <div className="pagination-info mb-2">
          <small className="text-muted">
            Trang {currentPage} / {totalPages} - Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredCheckups.length)} trong {filteredCheckups.length} bản ghi
          </small>
        </div>
        <div className="pagination-controls">
          <Button
            variant="outline-primary"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="me-2"
          >
            ← Trước
          </Button>
          {pages}
          <Button
            variant="outline-primary"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="ms-2"
          >
            Tiếp →
          </Button>
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
      toast.error('Không thể tải thông tin chi tiết. Vui lòng thử lại sau.');
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
    } catch (error) {
      console.error('Error fetching checkup details for edit:', error);
      toast.error('Không thể tải thông tin để chỉnh sửa. Vui lòng thử lại sau.');
    } finally {
      setDetailLoading(false);
    }
  };
  
  // Handle submit updated data
  const handleUpdateSubmit = async (updatedData) => {
    setSubmitting(true);
    try {
        await updateMedicalCheckup(updatedData.id, updatedData);
        toast.success(`Đã cập nhật hồ sơ cho học sinh ${updatedData.studentName} thành công!`);
        setShowEditModal(false);
        refreshMedicalCheckups();
    } catch (error) {
        console.error("Failed to update checkup", error);
        const errorMessage = error?.response?.data || error?.message || 'Cập nhật thất bại. Vui lòng thử lại.';
        toast.error(errorMessage);
    } finally {
        setSubmitting(false);
    }
  };
  
  // Handle open send notification modal
  const handleSendNotification = (checkup) => {
    setSelectedCheckup(checkup);
    setShowNotificationModal(true);
  };
  
  // Handle open batch notification modal
  const handleBatchNotification = () => {
    setShowBatchNotificationModal(true);
  };

  // Handle confirm sending notification
  const confirmSendNotification = async () => {
    if (!selectedCheckup) return;
    setSubmitting(true);
    try {
      await notifyParent(selectedCheckup.id);
      toast.success(`Đã gửi thông báo cho phụ huynh em ${selectedCheckup.studentName}`);
      setShowNotificationModal(false);
    } catch (error) {
      toast.error(`Lỗi khi gửi thông báo: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle confirm batch notification
  const confirmBatchNotification = async () => {
    if (filteredCheckups.length === 0) {
      toast.error('Không có dữ liệu để gửi thông báo');
      return;
    }
    
    setSubmitting(true);
    try {
      const checkupIds = filteredCheckups.map(checkup => checkup.id);
      await batchNotifyParents(checkupIds);
      toast.success(`Đã gửi thông báo cho ${filteredCheckups.length} phụ huynh`);
      setShowBatchNotificationModal(false);
    } catch (error) {
      toast.error(`Lỗi khi gửi thông báo: ${error.message}`);
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
    <div className="medical-checkup-list-container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Danh sách khám sức khỏe</h2>
        <div className="d-flex align-items-center gap-3">
          <span className="text-muted">
            Hiển thị {currentCheckups.length} / {filteredCheckups.length} bản ghi
          </span>
          <Button variant="info" onClick={handleBatchNotification}>
            <i className="fas fa-bullhorn me-2"></i> Gửi thông báo cho {filteredCheckups.length} người
          </Button>
        </div>
      </div>
      
      <div className="filter-container mb-3">
        <div className="row">
          <div className="col-md-3">
            <Form.Control
              type="text"
              placeholder="Tìm kiếm theo tên, mã học sinh hoặc lớp..."
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
              <option value="">Tất cả trạng thái</option>
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
      <CheckupDetailModal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        details={selectedCheckup}
        loading={detailLoading}
      />
      
      {/* Edit Modal */}
      <ScheduleEditCheckupModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        checkupData={editFormData}
        onSubmit={handleUpdateSubmit}
        loading={submitting}
        getStudentIdFromName={getStudentIdFromName}
      />

      {/* Send Notification Modal */}
      <Modal show={showNotificationModal} onHide={() => setShowNotificationModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title style={{color : 'red'}}>Xác nhận gửi thông báo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCheckup && <p>Bạn có chắc chắn muốn gửi thông báo cho phụ huynh của em <strong>{selectedCheckup.studentName}</strong>?</p>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNotificationModal(false)}>Hủy</Button>
          <Button variant="primary" onClick={confirmSendNotification} disabled={submitting}>
            {submitting ? 'Đang gửi...' : 'Xác nhận gửi'}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Batch Notification Modal */}
      <Modal show={showBatchNotificationModal} onHide={() => setShowBatchNotificationModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title  style={{color : 'red'}}>Xác nhận gửi thông báo hàng loạt</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Bạn có chắc chắn muốn gửi thông báo cho <strong>{filteredCheckups.length}</strong> phụ huynh dựa trên kết quả lọc hiện tại?</p>
          <div className="mt-3">
            <strong>Thông tin lọc hiện tại:</strong>
            <ul className="mt-2">
              {searchTerm && <li>Tìm kiếm: "{searchTerm}"</li>}
              {statusFilter && <li>Trạng thái: {statusFilter === 'COMPLETED' ? 'Đã hoàn thành' : 'Cần theo dõi'}</li>}
              {dateFilter && <li>Ngày khám: {new Date(dateFilter).toLocaleDateString('vi-VN')}</li>}
              {campaignFilter && <li>Chiến dịch: "{campaignFilter}"</li>}
            </ul>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBatchNotificationModal(false)}>Hủy</Button>
          <Button variant="primary" onClick={confirmBatchNotification} disabled={submitting}>
            {submitting ? 'Đang gửi...' : `Gửi cho ${filteredCheckups.length} người`}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

// Component for the Edit Modal, now defined within the same file
const ScheduleEditCheckupModal = ({ show, onHide, checkupData, onSubmit, loading, getStudentIdFromName }) => {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (checkupData) {
            const formattedData = {
                ...checkupData,
                checkupDate: checkupData.checkupDate ? new Date(checkupData.checkupDate).toISOString().split('T')[0] : '',
                specialCheckupItems: checkupData.specialCheckupItems || [],
                // Mặc định đặt followUpNeeded và parentNotified là true
                followUpNeeded: true,
                parentNotified: true,
            };
            setFormData(formattedData);
        }
    }, [checkupData]);

     useEffect(() => {
        if (formData.height > 0 && formData.weight > 0) {
            const heightInMeters = formData.height / 100;
            const bmi = (formData.weight / (heightInMeters * heightInMeters)).toFixed(2);
            setFormData(prev => ({ ...prev, bmi }));
        }
    }, [formData.height, formData.weight]);


    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Đảm bảo followUpNeeded và parentNotified luôn là true
        const submissionData = {
            ...formData,
            followUpNeeded: true,
            parentNotified: true
        };
        onSubmit(submissionData);
    };

    if (!checkupData) return null;

    return (
        <Modal 
            show={show} 
            onHide={onHide} 
            size="xl" 
            backdrop="static" 
            scrollable 
            id="schedule-edit-modal"
            className="schedule-edit-checkup-modal"
            centered
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
            <Modal.Header closeButton className="schedule-edit-modal-header">
                <Modal.Title style={{color : 'red'}} className="schedule-edit-modal-title">
                    Chỉnh sửa Hồ sơ khám: {formData.studentName}
                </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit} className="schedule-edit-form">
                <Modal.Body 
                    style={{maxHeight: '60vh', overflowY: 'auto', flex: '1 1 auto'}}
                    className="schedule-edit-modal-body"
                >
                    <div className="form-section schedule-form-section">
                        <h5>Thông tin chung (Không thể thay đổi)</h5>
                        <Row>
                            <Col md={4}><p><strong>Mã học sinh:</strong> {getStudentIdFromName(formData.studentName)}</p></Col>
                            <Col md={4}><p><strong>Học sinh:</strong> {formData.studentName}</p></Col>
                            <Col md={4}><p><strong>Lớp:</strong> {formData.studentClass}</p></Col>
                        </Row>
                        <Row>
                            <Col md={12}><p><strong>Chiến dịch:</strong> {formData.campaignTitle}</p></Col>
                        </Row>
                    </div>

                    <div className="form-section schedule-form-section">
                        <h5>Thông tin khám</h5>
                        <Row>
                            <Col md={6}>
                                <Form.Group controlId="scheduleCheckupDate">
                                    <Form.Label>Ngày khám</Form.Label>
                                    <Form.Control type="date" name="checkupDate" value={formData.checkupDate || ''} onChange={handleChange} required />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="scheduleCheckupStatus">
                                    <Form.Label>Trạng thái khám</Form.Label>
                                    <Form.Select name="checkupStatus" value={formData.checkupStatus || ''} onChange={handleChange} required>
                                        <option value="COMPLETED">Đã hoàn thành</option>
                                        <option value="NEED_FOLLOW_UP">Cần theo dõi</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={12}>
                                <Form.Group controlId="scheduleCheckupType">
                                    <Form.Label>Loại hình khám</Form.Label>
                                    <Form.Control type="text" name="checkupType" value={formData.checkupType || ''} onChange={handleChange} required />
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>

                    <div className="form-section schedule-form-section">
                        <h5>Các chỉ số sức khỏe</h5>
                        <Row>
                            <Col md={4}><Form.Group><Form.Label>Chiều cao (cm)</Form.Label><Form.Control type="number" name="height" value={formData.height || ''} onChange={handleChange} /></Form.Group></Col>
                            <Col md={4}><Form.Group><Form.Label>Cân nặng (kg)</Form.Label><Form.Control type="number" name="weight" value={formData.weight || ''} onChange={handleChange} /></Form.Group></Col>
                            <Col md={4}><Form.Group><Form.Label>BMI</Form.Label><Form.Control type="number" name="bmi" value={formData.bmi || ''} readOnly /></Form.Group></Col>
                        </Row>
                        <Row>
                            <Col md={4}><Form.Group><Form.Label>Huyết áp</Form.Label><Form.Control type="text" name="bloodPressure" value={formData.bloodPressure || ''} onChange={handleChange} /></Form.Group></Col>
                            <Col md={4}><Form.Group><Form.Label>Thị lực (Trái)</Form.Label><Form.Control type="text" name="visionLeft" value={formData.visionLeft || ''} onChange={handleChange} /></Form.Group></Col>
                            <Col md={4}><Form.Group><Form.Label>Thị lực (Phải)</Form.Label><Form.Control type="text" name="visionRight" value={formData.visionRight || ''} onChange={handleChange} /></Form.Group></Col>
                        </Row>
                        <Row>
                            <Col md={4}><Form.Group><Form.Label>Thính lực</Form.Label><Form.Control type="text" name="hearingStatus" value={formData.hearingStatus || ''} onChange={handleChange} /></Form.Group></Col>
                            <Col md={4}><Form.Group><Form.Label>Nhịp tim</Form.Label><Form.Control type="number" name="heartRate" value={formData.heartRate || ''} onChange={handleChange} /></Form.Group></Col>
                            <Col md={4}><Form.Group><Form.Label>Nhiệt độ (°C)</Form.Label><Form.Control type="number" step="0.1" name="bodyTemperature" value={formData.bodyTemperature || ''} onChange={handleChange} /></Form.Group></Col>
                        </Row>
                    </div>

                    <div className="form-section schedule-form-section">
                        <h5>Kết luận & Đề nghị</h5>
                        <Form.Group controlId="scheduleDiagnosis" className="mb-3">
                            <Form.Label>Chẩn đoán</Form.Label>
                            <Form.Control as="textarea" rows={3} name="diagnosis" value={formData.diagnosis || ''} onChange={handleChange} />
                        </Form.Group>
                        <Form.Group controlId="scheduleRecommendations">
                            <Form.Label>Đề nghị</Form.Label>
                            <Form.Control as="textarea" rows={3} name="recommendations" value={formData.recommendations || ''} onChange={handleChange} />
                        </Form.Group>
                        
                        {/* Hidden fields for followUpNeeded and parentNotified - always set to true */}
                        <input type="hidden" name="followUpNeeded" value="true" />
                        <input type="hidden" name="parentNotified" value="true" />
                        
                        {/* Removed checkboxes as they are now set to true by default */}
                        {/*
                        <Row className="mt-3">
                            <Col md={6}>
                                <Form.Group controlId="scheduleFollowUpNeeded">
                                    <Form.Check type="checkbox" name="followUpNeeded" label="Cần theo dõi thêm" checked={formData.followUpNeeded || false} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="scheduleParentNotified">
                                    <Form.Check 
                                        type="checkbox" 
                                        name="parentNotified" 
                                        label="Đã thông báo phụ huynh" 
                                        checked={formData.parentNotified || false} 
                                        onChange={handleChange} 
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        */}
                    </div>

                </Modal.Body>
                <Modal.Footer className="schedule-edit-modal-footer">
                    <Button variant="secondary" onClick={onHide} disabled={loading} className="schedule-close-btn">
                        Đóng
                    </Button>
                    <Button variant="primary" type="submit" disabled={loading} className="schedule-save-btn">
                        {loading ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Đang cập nhật...</> : 'Cập nhật hồ sơ'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default MedicalCheckupList;