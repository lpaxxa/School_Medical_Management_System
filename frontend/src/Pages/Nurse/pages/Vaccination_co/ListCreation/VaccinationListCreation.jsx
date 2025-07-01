import React, { useState, useEffect } from 'react';
import { Form, Button, Table, Row, Col, Card, Tabs, Tab, Modal, Badge } from 'react-bootstrap';
import './VaccinationListCreation.css';
import { useVaccination } from '../../../../../context/NurseContext/VaccinationContext';
import { useAuth } from '../../../../../context/AuthContext';
import { FaEye, FaPaperPlane, FaUsers } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const VaccinationListCreation = ({ refreshData, onDataChange }) => {
  // Thay đổi tab mặc định thành 'plans' thay vì 'list'
  const [activeTab, setActiveTab] = useState('plans');
  const { currentUser } = useAuth();
  
  // Xóa state không cần thiết cho danh sách tiêm chủng
  const [parentSearchTerm, setParentSearchTerm] = useState('');
  const [planSearchTerm, setPlanSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // State cho modal xem chi tiết kế hoạch
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailPlan, setDetailPlan] = useState(null);
  
  // Ensure we have a valid senderId (must be a number, not null)
  const nurseId = currentUser?.id ? parseInt(currentUser.id) : 1;
  
  // State cho modal gửi thông báo
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);
  const [isSendingToAll, setIsSendingToAll] = useState(false);
  const [sendingNotification, setSendingNotification] = useState(false);
  const [notificationData, setNotificationData] = useState({
    title: '',
    message: '',
    isRequest: true,
    senderId: nurseId,
    type: 'VACCINATION',
    receiverIds: []
  });

  // Sử dụng context thay vì local state - loại bỏ các state không cần thiết
  const {
    loading,
    error,
    success,
    clearError,
    clearSuccess,
    parents,
    vaccinationPlans,
    selectedPlan,
    fetchParents,
    fetchVaccinationPlans,
    getVaccinationPlanById,
    sendNotification
  } = useVaccination();

  // Track sent notifications
  const [sentNotifications, setSentNotifications] = useState(new Set());

  // Fetch dữ liệu khi component mount - loại bỏ fetchVaccinations
  useEffect(() => {
    fetchParents();
    fetchVaccinationPlans(); // Thêm lệnh fetch kế hoạch tiêm chủng
  }, [fetchParents, fetchVaccinationPlans, refreshData]);

  // Hiển thị thông báo từ context sử dụng toast
  useEffect(() => {
    if (error) {
      toast.error(error, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      clearError();
    }
    
    if (success) {
      toast.success(success, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      clearSuccess();
    }
  }, [error, success, clearError, clearSuccess]);

  // Lọc danh sách kế hoạch tiêm chủng
  const filteredVaccinationPlans = vaccinationPlans.filter(plan => {
    const matchesSearch = 
      plan.vaccineName?.toLowerCase().includes(planSearchTerm.toLowerCase()) ||
      plan.description?.toLowerCase().includes(planSearchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || plan.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Lọc danh sách phụ huynh
  const filteredParents = parents.filter(parent => 
    parent.fullName?.toLowerCase().includes(parentSearchTerm.toLowerCase()) || 
    parent.email?.toLowerCase().includes(parentSearchTerm.toLowerCase()) ||
    parent.phoneNumber?.includes(parentSearchTerm)
  );

  // Xem chi tiết kế hoạch tiêm chủng
  const handleViewPlanDetail = async (id) => {
    try {
      const planDetail = await getVaccinationPlanById(id);
      setDetailPlan(planDetail);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error fetching vaccination plan details:', error);
      toast.error('Không thể lấy thông tin chi tiết kế hoạch tiêm chủng. Vui lòng thử lại sau.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  // Lấy màu và biểu tượng cho trạng thái
  const getStatusBadge = (status) => {
    switch (status) {
      case 'ONGOING':
        return { variant: 'primary', text: 'Đang diễn ra' };
      case 'COMPLETED':
        return { variant: 'success', text: 'Kết thúc' };
      case 'CANCELLED':
        return { variant: 'danger', text: 'Đã hủy' };
      default:
        return { variant: 'secondary', text: 'Không xác định' };
    }
  };

  // Định dạng ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Mở modal gửi thông báo cho phụ huynh đã chọn
  const handleOpenNotificationModal = (parent) => {
    setSelectedParent(parent);
    setIsSendingToAll(false);
    setNotificationData({
      title: '',
      message: '',
      isRequest: true,
      senderId: nurseId,
      type: 'VACCINATION',
      receiverIds: [parseInt(parent.id)]
    });
    setShowNotificationModal(true);
  };

  // Mở modal gửi thông báo cho tất cả phụ huynh đã lọc
  const handleOpenBulkNotificationModal = () => {
    if (filteredParents.length === 0) {
      toast.warning('Không có phụ huynh nào trong danh sách để gửi thông báo!', {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }
    
    setSelectedParent(null);
    setIsSendingToAll(true);
    setNotificationData({
      title: '',
      message: '',
      isRequest: true,
      senderId: nurseId,
      type: 'VACCINATION',
      receiverIds: filteredParents.map(p => parseInt(p.id))
    });
    setShowNotificationModal(true);
  };

  // Xử lý đóng modal
  const handleCloseNotificationModal = () => {
    setShowNotificationModal(false);
    setSelectedParent(null);
    setIsSendingToAll(false);
    setNotificationData({
      title: '',
      message: '',
      isRequest: true,
      senderId: nurseId,
      type: 'VACCINATION',
      receiverIds: []
    });
  };

  // Xử lý đóng modal chi tiết
  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setDetailPlan(null);
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
    setSendingNotification(true);
    
    if (!notificationData.title || !notificationData.message) {
      toast.error('Vui lòng nhập tiêu đề và nội dung thông báo!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setSendingNotification(false);
      return;
    }
    
    // Kiểm tra receiverIds có được thiết lập chưa
    if (notificationData.receiverIds.length === 0) {
      toast.error('Không có người nhận nào được chọn!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setSendingNotification(false);
      return;
    }
    
    try {
      // Đảm bảo senderId là số nguyên
      const senderId = nurseId;
      
      // Tạo đối tượng thông báo với đúng định dạng
      const notificationPayload = {
        title: notificationData.title.trim(),
        message: notificationData.message.trim(),
        isRequest: notificationData.isRequest,
        senderId: senderId,
        type: 'VACCINATION', // Cố định giá trị
        receiverIds: notificationData.receiverIds
      };
      
      console.log('Sending notification:', JSON.stringify(notificationPayload, null, 2));
      
      await sendNotification(notificationPayload);
    
      // Thêm parent IDs vào danh sách đã gửi
      const newSentNotifications = new Set(sentNotifications);
      notificationData.receiverIds.forEach(id => newSentNotifications.add(id));
      setSentNotifications(newSentNotifications);
    
      toast.success(`Đã gửi thông báo tiêm chủng thành công tới ${isSendingToAll ? `${notificationData.receiverIds.length} phụ huynh` : selectedParent.fullName}!`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      handleCloseNotificationModal();
    } catch (error) {
      console.error('Lỗi khi gửi thông báo:', error);
      toast.error(`Không thể gửi thông báo. Lỗi: ${error.message}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setSendingNotification(false);
    }
  };

  return (
    <div className="vaccination-list-creation">
      <ToastContainer />
      <div className="section-header">
        <h2>Quản lý tiêm chủng</h2>
      </div>
      
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        {/* Tab Danh mục kế hoạch tiêm chủng */}
        <Tab eventKey="plans" title="Danh mục tiêm chủng">
          <Card>
            <Card.Header as="h5">Danh mục kế hoạch tiêm chủng</Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Control
                    type="text"
                    placeholder="Tìm kiếm theo tên vaccine hoặc mô tả..."
                    value={planSearchTerm}
                    onChange={(e) => setPlanSearchTerm(e.target.value)}
                  />
                </Col>
                <Col md={6}>
                  <Form.Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">Tất cả trạng thái</option>
                    <option value="ONGOING">Đang diễn ra</option>
                    <option value="COMPLETED">Kết thúc</option>
                    <option value="CANCELLED">Đã hủy</option>
                  </Form.Select>
                </Col>
              </Row>

              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Tên vaccine</th>
                      <th>Ngày tiêm</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="text-center">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Đang tải...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredVaccinationPlans.length > 0 ? (
                      filteredVaccinationPlans.map(plan => {
                        const statusBadge = getStatusBadge(plan.status);
                        return (
                          <tr key={plan.id}>
                            <td>{plan.id}</td>
                            <td>{plan.vaccineName || 'N/A'}</td>
                            <td>{formatDate(plan.vaccinationDate)}</td>
                            <td>
                              <Badge bg={statusBadge.variant} pill>
                                {plan.statusVietnamese || statusBadge.text}
                              </Badge>
                            </td>
                            <td className="text-center">
                              <Button
                                variant="info"
                                size="sm"
                                onClick={() => handleViewPlanDetail(plan.id)}
                              >
                                <FaEye className="me-1" /> Chi tiết
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center">
                          Không tìm thấy kế hoạch tiêm chủng nào
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
            <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
              <span>Danh sách phụ huynh</span>
              <Button 
                variant="primary" 
                size="sm"
                onClick={handleOpenBulkNotificationModal}
                disabled={filteredParents.length === 0}
                className="send-all-btn"
              >
                <FaUsers className="me-2" /> Gửi thông báo cho tất cả
              </Button>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Control
                    type="text"
                    placeholder="Tìm kiếm theo tên, email hoặc số điện thoại phụ huynh..."
                    value={parentSearchTerm}
                    onChange={(e) => setParentSearchTerm(e.target.value)}
                  />
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
                            {sentNotifications.has(parseInt(parent.id)) ? (
                              <span className="text-success fw-bold">Đã gửi</span>
                            ) : (
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleOpenNotificationModal(parent)}
                              >
                                <FaPaperPlane /> Gửi
                              </Button>
                            )}
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
            {isSendingToAll 
              ? `Gửi thông báo cho ${notificationData.receiverIds.length} phụ huynh`
              : `Gửi thông báo cho phụ huynh: ${selectedParent?.fullName}`
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

            {/* Add a hidden field to ensure senderId is included */}
            <input 
              type="hidden" 
              name="senderId" 
              value={nurseId} 
            />
            
            <div className="d-flex justify-content-between">
              <Button variant="secondary" onClick={handleCloseNotificationModal}>
                Hủy
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={sendingNotification}
              >
                {sendingNotification ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="me-2" /> Gửi thông báo
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal xem chi tiết kế hoạch tiêm chủng */}
      <Modal show={showDetailModal} onHide={handleCloseDetailModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            Chi tiết kế hoạch tiêm chủng
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detailPlan ? (
            <div>
              <div className="mb-3">
                <h6>ID kế hoạch:</h6>
                <p>{detailPlan.id}</p>
              </div>
              <div className="mb-3">
                <h6>Tên vaccine:</h6>
                <p>{detailPlan.vaccineName || 'N/A'}</p>
              </div>
              <div className="mb-3">
                <h6>Ngày tiêm:</h6>
                <p>{formatDate(detailPlan.vaccinationDate)}</p>
              </div>
              <div className="mb-3">
                <h6>Trạng thái:</h6>
                <Badge bg={getStatusBadge(detailPlan.status).variant} pill>
                  {detailPlan.statusVietnamese || getStatusBadge(detailPlan.status).text}
                </Badge>
              </div>
              <div className="mb-3">
                <h6>Mô tả kế hoạch:</h6>
                <p>{detailPlan.description || 'Không có mô tả'}</p>
              </div>
              <div className="mb-3">
                <h6>Ngày tạo:</h6>
                <p>{formatDate(detailPlan.createdAt)}</p>
              </div>
              <div className="mb-3">
                <h6>Cập nhật cuối:</h6>
                <p>{formatDate(detailPlan.updatedAt)}</p>
              </div>
            </div>
          ) : (
            <p className="text-center">Đang tải dữ liệu...</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDetailModal}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default VaccinationListCreation;