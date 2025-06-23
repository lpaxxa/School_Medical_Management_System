import React, { useState, useEffect } from 'react';
import { Form, Button, Table, Alert, Row, Col, Card, Tabs, Tab, Modal } from 'react-bootstrap';
import './VaccinationListCreation.css';
import { useVaccination } from '../../../../../context/NurseContext/VaccinationContext';
import { useAuth } from '../../../../../context/AuthContext';

const VaccinationListCreation = ({ refreshData, onDataChange }) => {
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('list');
  const { currentUser } = useAuth();
  
  // Thêm state cho tìm kiếm danh sách tiêm chủng và phụ huynh
  const [vaccineSearchTerm, setVaccineSearchTerm] = useState('');
  const [vaccineFilter, setVaccineFilter] = useState('');
  const [parentSearchTerm, setParentSearchTerm] = useState('');
  
  // State cho modal gửi thông báo
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);
  const [notificationData, setNotificationData] = useState({
    title: '',
    message: '',
    isRequest: true,
    senderId: currentUser?.id || 1, // Sử dụng ID người dùng hiện tại hoặc mặc định là 1
    type: 'VACCINATION',
    receiverIds: []
  });

  // Sử dụng context thay vì local state
  const {
    loading,
    error,
    success,
    clearError,
    clearSuccess,
    vaccinations,
    parents,
    fetchVaccinations,
    fetchParents,
    deleteVaccinationRecord,
    sendNotification
  } = useVaccination();

  // Fetch dữ liệu khi component mount
  useEffect(() => {
    fetchVaccinations();
    fetchParents();
  }, [fetchVaccinations, fetchParents, refreshData]);

  // Hiển thị thông báo từ context
  useEffect(() => {
    if (error) {
      setMessage({ type: 'danger', text: error });
      setTimeout(() => {
        clearError();
        setMessage({ type: '', text: '' });
      }, 5000);
    }
    
    if (success) {
      setMessage({ type: 'success', text: success });
      setTimeout(() => {
        clearSuccess();
        setMessage({ type: '', text: '' });
      }, 5000);
    }
  }, [error, success, clearError, clearSuccess]);

  // Lọc danh sách tiêm chủng
  const filteredVaccinations = vaccinations.filter(vaccination => {
    const matchesSearch = 
      (vaccination.vaccineName?.toLowerCase().includes(vaccineSearchTerm.toLowerCase()) || 
      vaccination.studentName?.toLowerCase().includes(vaccineSearchTerm.toLowerCase()));
    const matchesVaccine = vaccineFilter === '' || vaccination.vaccineName === vaccineFilter;
    
    return matchesSearch && matchesVaccine;
  });

  // Lọc danh sách phụ huynh
  const filteredParents = parents.filter(parent => 
    parent.fullName?.toLowerCase().includes(parentSearchTerm.toLowerCase()) || 
    parent.email?.toLowerCase().includes(parentSearchTerm.toLowerCase()) ||
    parent.phoneNumber?.includes(parentSearchTerm)
  );

  // Danh sách loại vaccine duy nhất
  const uniqueVaccines = [...new Set(vaccinations.map(v => v.vaccineName).filter(Boolean))];

  // Xử lý xóa bản ghi tiêm chủng
  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bản ghi tiêm chủng này?')) {
      try {
        await deleteVaccinationRecord(id);
        setMessage({ 
          type: 'success', 
          text: 'Xóa bản ghi tiêm chủng thành công!' 
        });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } catch (error) {
        setMessage({ 
          type: 'danger', 
          text: 'Không thể xóa bản ghi tiêm chủng. Vui lòng thử lại sau.' 
        });
      }
    }
  };

  // Mở modal gửi thông báo cho phụ huynh đã chọn
  const handleOpenNotificationModal = (parent) => {
    setSelectedParent(parent);
    setNotificationData({
      title: '',
      message: '',
      isRequest: true,
      senderId: currentUser?.id || 1,
      type: 'VACCINATION',
      receiverIds: [parseInt(parent.id)] // Đảm bảo ID là số nguyên
    });
    setShowNotificationModal(true);
  };

  // Mở modal gửi thông báo cho tất cả phụ huynh
  const handleOpenBulkNotificationModal = () => {
    setSelectedParent(null);
    setNotificationData({
      title: '',
      message: '',
      isRequest: true,
      senderId: currentUser?.id || 1,
      type: 'VACCINATION',
      receiverIds: filteredParents.map(p => parseInt(p.id)) // Đảm bảo ID là số nguyên
    });
    setShowNotificationModal(true);
  };

  // Xử lý đóng modal
  const handleCloseNotificationModal = () => {
    setShowNotificationModal(false);
    setSelectedParent(null);
    setNotificationData({
      title: '',
      message: '',
      isRequest: true,
      senderId: currentUser?.id || 1,
      type: 'VACCINATION',
      receiverIds: []
    });
  };

  // Xử lý thay đổi form thông báo
  const handleNotificationInputChange = (e) => {
    const { name, value } = e.target;
    setNotificationData({
      ...notificationData,
      [name]: value
    });
  };

  // Gửi thông báo
  const handleSendNotification = async (e) => {
    e.preventDefault();
    
    if (!notificationData.title || !notificationData.message) {
      setMessage({
        type: 'danger',
        text: 'Vui lòng nhập tiêu đề và nội dung thông báo!'
      });
      return;
    }
    
    // Kiểm tra receiverIds có được thiết lập chưa
    if (notificationData.receiverIds.length === 0) {
      setMessage({
        type: 'danger',
        text: 'Không có người nhận nào được chọn!'
      });
      return;
    }
    
    try {
      // Đảm bảo senderId là số nguyên
      const senderId = parseInt(notificationData.senderId) || 1;
      
      // Tạo đối tượng thông báo với đúng định dạng
      const notificationPayload = {
        title: notificationData.title.trim(),
        message: notificationData.message.trim(),
        isRequest: notificationData.isRequest,
        senderId: senderId,
        type: 'VACCINATION', // Cố định giá trị
        receiverIds: notificationData.receiverIds
      };
      
      console.log('Sending notification:', notificationPayload);
      
      await sendNotification(notificationPayload);
    
      setMessage({
        type: 'success',
        text: `Đã gửi thông báo tiêm chủng thành công tới ${selectedParent ? selectedParent.fullName : 'tất cả phụ huynh đã chọn'}!`
      });
      
      handleCloseNotificationModal();
    } catch (error) {
      console.error('Lỗi khi gửi thông báo:', error);
      setMessage({
        type: 'danger',
        text: `Không thể gửi thông báo. Lỗi: ${error.message}`
      });
    }
  };

  // Định dạng ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="vaccination-list-creation">
      <div className="section-header">
        <h2>Quản lý tiêm chủng</h2>
      </div>
      
      {message.text && (
        <Alert 
          variant={message.type} 
          onClose={() => setMessage({ type: '', text: '' })} 
          dismissible
        >
          {message.text}
        </Alert>
      )}
      
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="list" title="Danh sách tiêm chủng">
          <Card className="mb-4">
            <Card.Header as="h5">Danh sách tiêm chủng</Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={4}>
                  <Form.Control
                    type="text"
                    placeholder="Tìm kiếm theo tên vaccine hoặc tên học sinh..."
                    value={vaccineSearchTerm}
                    onChange={(e) => setVaccineSearchTerm(e.target.value)}
                  />
                </Col>
                <Col md={4}>
                  <Form.Select
                    value={vaccineFilter}
                    onChange={(e) => setVaccineFilter(e.target.value)}
                  >
                    <option value="">Tất cả loại vaccine</option>
                    {uniqueVaccines.map((vaccine, index) => (
                      <option key={index} value={vaccine}>{vaccine}</option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={4} className="text-end">
                  <Button variant="success" href="/nurse/vaccinations/new">
                    <i className="fas fa-plus"></i> Thêm mới
                  </Button>
                </Col>
              </Row>

              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Tên vaccine</th>
                      <th>Ngày tiêm</th>
                      <th>Ngày tiêm tiếp theo</th>
                      <th>Mũi số</th>
                      <th>Địa điểm tiêm</th>
                      <th>Ghi chú</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="8" className="text-center">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Đang tải...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredVaccinations.length > 0 ? (
                      filteredVaccinations.map(vaccination => (
                        <tr key={vaccination.id}>
                          <td>{vaccination.id}</td>
                          <td>{vaccination.vaccineName || 'N/A'}</td>
                          <td>{formatDate(vaccination.vaccinationDate)}</td>
                          <td>{formatDate(vaccination.nextDoseDate)}</td>
                          <td>{vaccination.doseNumber || 'N/A'}</td>
                          <td>{vaccination.administeredAt || 'N/A'}</td>
                          <td>{vaccination.notes || 'N/A'}</td>
                          <td>
                            <Button
                              variant="primary"
                              size="sm"
                              className="me-1"
                              href={`/nurse/vaccinations/${vaccination.id}/edit`}
                            >
                              <i className="fas fa-edit"></i>
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(vaccination.id)}
                            >
                              <i className="fas fa-trash"></i>
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center">
                          Không tìm thấy bản ghi tiêm chủng nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="parents" title="Danh sách phụ huynh">
          <Card>
            <Card.Header as="h5">Danh sách phụ huynh</Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Control
                    type="text"
                    placeholder="Tìm kiếm theo tên, email hoặc số điện thoại phụ huynh..."
                    value={parentSearchTerm}
                    onChange={(e) => setParentSearchTerm(e.target.value)}
                  />
                </Col>
                <Col md={6} className="text-end">
                  <Button 
                    variant="primary"
                    onClick={handleOpenBulkNotificationModal}
                    disabled={filteredParents.length === 0}
                  >
                    <i className="fas fa-envelope"></i> Gửi thông báo tiêm chủng
                  </Button>
                </Col>
              </Row>

              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Họ và tên</th>
                      <th>Số điện thoại</th>
                      <th>Email</th>
                      <th>Địa chỉ</th>
                      <th>Quan hệ</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="7" className="text-center">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Đang tải...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredParents.length > 0 ? (
                      filteredParents.map(parent => (
                        <tr key={parent.id}>
                          <td>{parent.id}</td>
                          <td>{parent.fullName || 'N/A'}</td>
                          <td>{parent.phoneNumber || 'N/A'}</td>
                          <td>{parent.email || 'N/A'}</td>
                          <td>{parent.address || 'N/A'}</td>
                          <td>{parent.relationshipType || 'N/A'}</td>
                          <td>
                            <Button
                              variant="info"
                              size="sm"
                              className="me-1"
                              href={`/nurse/parents/${parent.id}`}
                            >
                              <i className="fas fa-eye"></i>
                            </Button>
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleOpenNotificationModal(parent)}
                            >
                              <i className="fas fa-paper-plane"></i>
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center">
                          Không tìm thấy phụ huynh nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
      
      {/* Modal gửi thông báo tiêm chủng */}
      <Modal show={showNotificationModal} onHide={handleCloseNotificationModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedParent 
              ? `Gửi thông báo cho phụ huynh: ${selectedParent.fullName}`
              : 'Gửi thông báo cho tất cả phụ huynh đã chọn'
            }
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSendNotification}>
            <Form.Group className="mb-3">
              <Form.Label>Tiêu đề thông báo <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập tiêu đề thông báo"
                name="title"
                value={notificationData.title}
                onChange={handleNotificationInputChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Nội dung <span className="text-danger">*</span></Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Nhập nội dung thông báo tiêm chủng"
                name="message"
                value={notificationData.message}
                onChange={handleNotificationInputChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Loại thông báo</Form.Label>
              <Form.Control
                plaintext
                readOnly
                value="VACCINATION (Tiêm chủng)"
              />
            </Form.Group>
            
            <Button variant="primary" type="submit" className="w-100">
              <i className="fas fa-paper-plane"></i> Gửi thông báo
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default VaccinationListCreation;