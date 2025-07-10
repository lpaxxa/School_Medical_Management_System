import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Card, Modal, Spinner, Form, Row, Col } from 'react-bootstrap';
import { useHealthCheckup } from '../../../../../context/NurseContext/HealthCheckupContext';
import { toast } from 'react-toastify';
import './ScheduleConsultation.css';
import CheckupDetailModal from '../Dashboard/CheckupDetailModal';

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
    scheduleConsultation,
    notifyAllParents, // Will be used later
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
  
  // State for scheduling consultation modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [consultationData, setConsultationData] = useState({
    additionalProp1: '',
    additionalProp2: '',
    additionalProp3: '',
  });
  const [scheduling, setScheduling] = useState(false);
  
  // State for filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Load data when component mounts
  useEffect(() => {
    refreshMedicalCheckups();
  }, []);

  // Filter checkups based on search term and status
  const filteredCheckups = medicalCheckups.filter(checkup => {
    const matchesSearch = 
      checkup.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      checkup.studentId?.toString().includes(searchTerm) ||
      checkup.studentClass?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || checkup.checkupStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
  
  // Handle open schedule consultation modal
  const handleScheduleConsultation = (checkup) => {
    setSelectedCheckup(checkup);
    setConsultationData({ additionalProp1: '', additionalProp2: '', additionalProp3: '' });
    setShowScheduleModal(true);
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
  
  // Handle consultation form change
  const handleConsultationChange = (e) => {
    const { name, value } = e.target;
    setConsultationData(prev => ({ ...prev, [name]: value }));
  };

  // Handle submit consultation schedule
  const handleSubmitConsultation = async (e) => {
    e.preventDefault();
    const { additionalProp1, additionalProp2, additionalProp3 } = consultationData;
    if (!additionalProp1 && !additionalProp2 && !additionalProp3) {
      toast.error('Vui lòng nhập ít nhất một thông tin tư vấn.');
      return;
    }
    
    setScheduling(true);
    try {
      await scheduleConsultation(selectedCheckup.id, consultationData);
      toast.success('Đã lên lịch tư vấn thành công!');
      setShowScheduleModal(false);
      refreshMedicalCheckups();
    } catch (error) {
      toast.error(`Lỗi khi lên lịch tư vấn: ${error.message}`);
    } finally {
      setScheduling(false);
    }
  };
  
  // Handle send notification to all (placeholder)
  const handleNotifyAll = () => {
    toast.info('Chức năng "Gửi thông báo tất cả" sẽ được cập nhật sớm.');
    // Example call (when API is ready)
    // notifyAllParents("Your message here");
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
        <Button variant="info" onClick={handleNotifyAll}>
          <i className="fas fa-bullhorn me-2"></i> Gửi thông báo tất cả
        </Button>
      </div>
      
      <div className="filter-container mb-3">
        <div className="row">
          <div className="col-md-6">
            <Form.Control
              type="text"
              placeholder="Tìm kiếm theo tên, mã học sinh hoặc lớp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-2"
            />
          </div>
          <div className="col-md-4">
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
            <Button 
              variant="primary" 
              className="w-100"
              onClick={refreshMedicalCheckups}
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
                  {filteredCheckups.length > 0 ? (
                    filteredCheckups.map((checkup, index) => (
                      <tr key={checkup.id}>
                        <td>{index + 1}</td>
                        <td>{checkup.studentId}</td>
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
                            <Button variant="primary" size="sm" onClick={() => handleSendNotification(checkup)} title="Gửi thông báo">
                              <i className="fas fa-paper-plane"></i>
                            </Button>
                            {checkup.checkupStatus === 'NEED_FOLLOW_UP' && (
                              <Button variant="success" size="sm" onClick={() => handleScheduleConsultation(checkup)} title="Lên lịch tư vấn">
                                <i className="fas fa-calendar-plus"></i>
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
      
      {/* Detail Modal */}
      <CheckupDetailModal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        details={selectedCheckup}
        loading={detailLoading}
      />
      
      {/* Edit Modal */}
      <EditCheckupModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        checkupData={editFormData}
        onSubmit={handleUpdateSubmit}
        loading={submitting}
      />

      {/* Send Notification Modal */}
      <Modal show={showNotificationModal} onHide={() => setShowNotificationModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận gửi thông báo</Modal.Title>
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
      
      {/* Schedule Consultation Modal */}
      <Modal show={showScheduleModal} onHide={() => setShowScheduleModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Lên lịch tư vấn</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitConsultation}>
          <Modal.Body>
            {selectedCheckup && <p>Lên lịch tư vấn cho học sinh: <strong>{selectedCheckup.studentName}</strong></p>}
            <Form.Group className="mb-3">
              <Form.Label>Nội dung tư vấn 1</Form.Label>
              <Form.Control 
                type="text"
                name="additionalProp1"
                value={consultationData.additionalProp1}
                onChange={handleConsultationChange}
                placeholder="Cần mang theo sổ khám bệnh cũ"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nội dung tư vấn 2</Form.Label>
              <Form.Control 
                type="text"
                name="additionalProp2"
                value={consultationData.additionalProp2}
                onChange={handleConsultationChange}
                placeholder="Học sinh có tiền sử dị ứng thuốc"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nội dung tư vấn 3</Form.Label>
              <Form.Control 
                type="text"
                name="additionalProp3"
                value={consultationData.additionalProp3}
                onChange={handleConsultationChange}
                placeholder="Phụ huynh đã xác nhận qua điện thoại"
              />
            </Form.Group>
            <small className="text-muted">Bạn phải điền ít nhất một trong ba nội dung trên.</small>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowScheduleModal(false)}>Hủy</Button>
            <Button variant="primary" type="submit" disabled={scheduling}>
              {scheduling ? 'Đang lưu...' : 'Lên lịch'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

// Component for the Edit Modal, now defined within the same file
const EditCheckupModal = ({ show, onHide, checkupData, onSubmit, loading }) => {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (checkupData) {
            const formattedData = {
                ...checkupData,
                checkupDate: checkupData.checkupDate ? new Date(checkupData.checkupDate).toISOString().split('T')[0] : '',
                specialCheckupItems: checkupData.specialCheckupItems || [],
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
        onSubmit(formData);
    };

    if (!checkupData) return null;

    return (
        <Modal show={show} onHide={onHide} size="xl" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Chỉnh sửa Hồ sơ khám: {formData.studentName}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <div className="form-section">
                        <h5>Thông tin chung (Không thể thay đổi)</h5>
                        <Row>
                            <Col md={4}><p><strong>Học sinh:</strong> {formData.studentName}</p></Col>
                            <Col md={4}><p><strong>Lớp:</strong> {formData.studentClass}</p></Col>
                            <Col md={4}><p><strong>Chiến dịch:</strong> {formData.campaignTitle}</p></Col>
                        </Row>
                    </div>

                    <div className="form-section">
                        <h5>Thông tin khám</h5>
                        <Row>
                            <Col md={4}>
                                <Form.Group controlId="checkupDate">
                                    <Form.Label>Ngày khám</Form.Label>
                                    <Form.Control type="date" name="checkupDate" value={formData.checkupDate || ''} onChange={handleChange} required />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group controlId="checkupType">
                                    <Form.Label>Loại hình khám</Form.Label>
                                    <Form.Control type="text" name="checkupType" value={formData.checkupType || ''} onChange={handleChange} required />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group controlId="checkupStatus">
                                    <Form.Label>Trạng thái khám</Form.Label>
                                    <Form.Select name="checkupStatus" value={formData.checkupStatus || ''} onChange={handleChange} required>
                                        <option value="COMPLETED">Đã hoàn thành</option>
                                        <option value="NEED_FOLLOW_UP">Cần theo dõi</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>

                    <div className="form-section">
                        <h5>Các chỉ số sức khỏe</h5>
                        <Row>
                            <Col md={3}><Form.Group><Form.Label>Chiều cao (cm)</Form.Label><Form.Control type="number" name="height" value={formData.height || ''} onChange={handleChange} /></Form.Group></Col>
                            <Col md={3}><Form.Group><Form.Label>Cân nặng (kg)</Form.Label><Form.Control type="number" name="weight" value={formData.weight || ''} onChange={handleChange} /></Form.Group></Col>
                            <Col md={3}><Form.Group><Form.Label>BMI</Form.Label><Form.Control type="number" name="bmi" value={formData.bmi || ''} readOnly /></Form.Group></Col>
                            <Col md={3}><Form.Group><Form.Label>Huyết áp</Form.Label><Form.Control type="text" name="bloodPressure" value={formData.bloodPressure || ''} onChange={handleChange} /></Form.Group></Col>
                        </Row>
                        <Row>
                            <Col md={3}><Form.Group><Form.Label>Thị lực (Trái)</Form.Label><Form.Control type="text" name="visionLeft" value={formData.visionLeft || ''} onChange={handleChange} /></Form.Group></Col>
                            <Col md={3}><Form.Group><Form.Label>Thị lực (Phải)</Form.Label><Form.Control type="text" name="visionRight" value={formData.visionRight || ''} onChange={handleChange} /></Form.Group></Col>
                            <Col md={3}><Form.Group><Form.Label>Thính lực</Form.Label><Form.Control type="text" name="hearingStatus" value={formData.hearingStatus || ''} onChange={handleChange} /></Form.Group></Col>
                            <Col md={3}><Form.Group><Form.Label>Nhịp tim</Form.Label><Form.Control type="number" name="heartRate" value={formData.heartRate || ''} onChange={handleChange} /></Form.Group></Col>
                        </Row>
                         <Row>
                            <Col md={3}><Form.Group><Form.Label>Nhiệt độ (°C)</Form.Label><Form.Control type="number" step="0.1" name="bodyTemperature" value={formData.bodyTemperature || ''} onChange={handleChange} /></Form.Group></Col>
                        </Row>
                    </div>

                    <div className="form-section">
                        <h5>Kết luận & Đề nghị</h5>
                        <Form.Group controlId="diagnosis" className="mb-3">
                            <Form.Label>Chẩn đoán</Form.Label>
                            <Form.Control as="textarea" rows={3} name="diagnosis" value={formData.diagnosis || ''} onChange={handleChange} />
                        </Form.Group>
                        <Form.Group controlId="recommendations">
                            <Form.Label>Đề nghị</Form.Label>
                            <Form.Control as="textarea" rows={3} name="recommendations" value={formData.recommendations || ''} onChange={handleChange} />
                        </Form.Group>
                         <Form.Group className="mt-3" controlId="followUpNeeded">
                            <Form.Check type="checkbox" name="followUpNeeded" label="Cần theo dõi thêm" checked={formData.followUpNeeded || false} onChange={handleChange} />
                        </Form.Group>
                    </div>

                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide} disabled={loading}>Hủy</Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Đang lưu...</> : 'Lưu thay đổi'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default MedicalCheckupList;