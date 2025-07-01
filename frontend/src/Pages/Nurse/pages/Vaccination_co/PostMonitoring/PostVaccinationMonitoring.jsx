import React, { useState, useEffect } from 'react';
import { Table, Form, Button, Card, Row, Col, Alert, Modal, Badge } from 'react-bootstrap';
import { useVaccination } from '../../../../../context/NurseContext/VaccinationContext';
import './PostVaccinationMonitoring.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import vaccinationApiService from '../../../../../services/APINurse/vaccinationApiService';

const PostVaccinationMonitoring = () => {
  const { 
    fetchVaccinationRecords, 
    deleteVaccinationRecordAPI, 
    updateVaccinationRecordAPI,
    loading, 
    error, 
    success, 
    clearError, 
    clearSuccess 
  } = useVaccination();

  const [vaccinations, setVaccinations] = useState([]);
  const [selectedVaccination, setSelectedVaccination] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'view', 'edit', 'delete'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [formData, setFormData] = useState({
    vaccineName: '',
    vaccinationDate: '',
    nextDoseDate: '',
    doseNumber: '',
    administeredBy: '',
    administeredAt: '',
    notes: ''
  });
  const [localLoading, setLocalLoading] = useState(true);

  // Check if token exists and is valid
  const checkAuthToken = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No authentication token found');
      toast.error('Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return false;
    }
    
    try {
      // Check if token is expired (if it's a JWT)
      // This is a simple check - you might need more sophisticated validation
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const expiry = tokenData.exp * 1000; // Convert to milliseconds
      
      if (Date.now() > expiry) {
        console.error('Token has expired');
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error parsing token:', error);
      return true; // Assume token is valid if we can't parse it
    }
  };

  // Fetch vaccination data on component mount
  useEffect(() => {
    loadVaccinationData();
  }, []);

  // Display toast notifications for errors and success
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

  const loadVaccinationData = async () => {
    try {
      setLocalLoading(true);
      console.log('Starting to load vaccination data...');
      
      // Check authentication before making API call
      if (!checkAuthToken()) {
        throw new Error('Authentication failed');
      }
      
      // Use the vaccinationApiService directly which has proper token handling
      const data = await vaccinationApiService.getAllVaccinations();
      console.log('Received vaccination data:', data);
      
      if (data && Array.isArray(data)) {
        console.log('Setting vaccinations with data:', data);
        setVaccinations(data);
      } else {
        console.log('No data received or data is not an array');
        // Fallback to mock data if API returns invalid data
        setVaccinations(vaccinationApiService.getMockVaccinationRecords());
      }
    } catch (error) {
      console.error('Error fetching vaccination records:', error);
      toast.error('Không thể tải dữ liệu tiêm chủng. Vui lòng thử lại sau.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      // Fallback to mock data on error
      setVaccinations(vaccinationApiService.getMockVaccinationRecords());
    } finally {
      setLocalLoading(false);
    }
  };

  // Determine status based on notes field
  const getStatus = (notes) => {
    if (!notes || notes.trim() === '') {
      return 'Cần theo dõi';
    }
    return notes === 'Không có phản ứng phụ' ? 'Không cần theo dõi' : 'Cần theo dõi';
  };

  // Get status badge
  const getStatusBadge = (notes) => {
    const status = getStatus(notes);
    return status === 'Không cần theo dõi' 
      ? <Badge bg="success">{status}</Badge>
      : <Badge bg="warning">{status}</Badge>;
  };

  // Filter vaccinations based on search and status
  const filteredVaccinations = vaccinations.filter(vacc => {
    const matchesSearch = 
      (vacc.studentName && vacc.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (vacc.vaccineName && vacc.vaccineName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (vacc.id && vacc.id.toString().includes(searchTerm));
    
    const vaccinationStatus = getStatus(vacc.notes);
    const matchesStatus = statusFilter === 'ALL' || 
      (statusFilter === 'NEEDS_MONITORING' && vaccinationStatus === 'Cần theo dõi') ||
      (statusFilter === 'NO_MONITORING' && vaccinationStatus === 'Không cần theo dõi');
    
    return matchesSearch && matchesStatus;
  });

  // Handle modal actions
  const handleView = (vaccination) => {
    setSelectedVaccination(vaccination);
    setModalType('view');
    setShowModal(true);
  };

  const handleEdit = (vaccination) => {
    setSelectedVaccination(vaccination);
    setFormData({
      vaccineName: vaccination.vaccineName || '',
      vaccinationDate: vaccination.vaccinationDate ? vaccination.vaccinationDate.split('T')[0] : '',
      nextDoseDate: vaccination.nextDoseDate ? vaccination.nextDoseDate.split('T')[0] : '',
      doseNumber: vaccination.doseNumber || '',
      administeredBy: vaccination.administeredBy || '',
      administeredAt: vaccination.administeredAt || '',
      notes: vaccination.notes || ''
    });
    setModalType('edit');
    setShowModal(true);
  };

  const handleDelete = (vaccination) => {
    setSelectedVaccination(vaccination);
    setModalType('delete');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedVaccination(null);
    setFormData({
      vaccineName: '',
      vaccinationDate: '',
      nextDoseDate: '',
      doseNumber: '',
      administeredBy: '',
      administeredAt: '',
      notes: ''
    });
    setModalType('');
  };

  const handleSave = async () => {
    if (modalType === 'edit' && selectedVaccination) {
      try {
        const updatedData = {
          ...selectedVaccination,
          ...formData
        };
        
        // Call API to update using context method
        await updateVaccinationRecordAPI(selectedVaccination.id, updatedData);
        
        // Display success notification
        toast.success('Đã cập nhật thông tin tiêm chủng thành công!', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        
        // Reload data to reflect changes
        await loadVaccinationData();
        
        handleCloseModal();
      } catch (error) {
        console.error('Error updating vaccination record:', error);
        
        // Provide more specific error messages based on error type
        let errorMessage = 'Lỗi khi cập nhật';
        
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          if (error.response.status === 401 || error.response.status === 403) {
            errorMessage = 'Không có quyền cập nhật. Vui lòng đăng nhập lại.';
          } else if (error.response.status === 400) {
            errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
          } else if (error.response.status === 404) {
            errorMessage = 'Không tìm thấy bản ghi tiêm chủng.';
          } else if (error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
          }
        } else if (error.request) {
          // The request was made but no response was received
          errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
        }
        
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedVaccination) {
      try {
        // Call API to delete using context method
        await deleteVaccinationRecordAPI(selectedVaccination.id);
        
        // Display success notification
        toast.success('Đã xóa bản ghi tiêm chủng thành công!', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        
        // Reload data to reflect changes
        await loadVaccinationData();
        
        handleCloseModal();
      } catch (error) {
        console.error('Error deleting vaccination record:', error);
        
        // Provide more specific error messages based on error type
        let errorMessage = 'Lỗi khi xóa';
        
        if (error.response) {
          if (error.response.status === 401 || error.response.status === 403) {
            errorMessage = 'Không có quyền xóa. Vui lòng đăng nhập lại.';
          } else if (error.response.status === 404) {
            errorMessage = 'Không tìm thấy bản ghi tiêm chủng.';
          } else if (error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
          }
        } else if (error.request) {
          errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
        }
        
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="post-vaccination-monitoring">
      <ToastContainer />
      <div className="section-header">
        <h2>Theo dõi sau tiêm chủng</h2>
      </div>
      
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Control
                  type="text"
                  placeholder="Tìm kiếm theo ID, tên học sinh hoặc tên vắc-xin..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="NEEDS_MONITORING">Cần theo dõi</option>
                  <option value="NO_MONITORING">Không cần theo dõi</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Button
                variant="outline-secondary"
                className="w-100"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('ALL');
                }}
              >
                <i className="fas fa-redo"></i> Đặt lại
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      <div className="vaccination-table-container">
        <Table striped bordered hover responsive>
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Tên học sinh</th>
              <th>Tên vắc-xin</th>
              <th>Ngày tiêm</th>
              <th>Ghi chú</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading || localLoading ? (
              <tr>
                <td colSpan="7" className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                  </div>
                </td>
              </tr>
            ) : filteredVaccinations.length > 0 ? (
              filteredVaccinations.map(vaccination => (
                <tr key={vaccination.id}>
                  <td>{vaccination.id}</td>
                  <td>{vaccination.studentName || 'Chưa có thông tin'}</td>
                  <td>{vaccination.vaccineName || 'Chưa có thông tin'}</td>
                  <td>
                    {vaccination.vaccinationDate 
                      ? new Date(vaccination.vaccinationDate).toLocaleDateString('vi-VN')
                      : 'Chưa có thông tin'}
                  </td>
                  <td>{vaccination.notes || 'Không có ghi chú'}</td>
                  <td>{getStatusBadge(vaccination.notes)}</td>
                  <td>
                    <div className="d-flex gap-1">
                      <Button
                        variant="info"
                        size="sm"
                        onClick={() => handleView(vaccination)}
                        title="Xem chi tiết"
                      >
                        <i className="fas fa-eye"></i>
                      </Button>
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => handleEdit(vaccination)}
                        title="Chỉnh sửa"
                      >
                        <i className="fas fa-edit"></i>
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(vaccination)}
                        title="Xóa"
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
                  Không tìm thấy dữ liệu tiêm chủng nào
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
      
      {/* Modal for View/Edit/Delete */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {modalType === 'view' && 'Xem chi tiết bản ghi tiêm chủng'}
            {modalType === 'edit' && 'Chỉnh sửa bản ghi tiêm chủng'}
            {modalType === 'delete' && 'Xác nhận xóa bản ghi'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedVaccination && (
            <>
              {modalType === 'view' && (
                <div className="vaccination-details">
                  <Row>
                    <Col md={6}>
                      <p><strong>ID:</strong> {selectedVaccination.id}</p>
                      <p><strong>Health Profile ID:</strong> {selectedVaccination.healthProfileId || 'N/A'}</p>
                      <p><strong>Tên học sinh:</strong> {selectedVaccination.studentName || 'Chưa có thông tin'}</p>
                      <p><strong>Tên vắc-xin:</strong> {selectedVaccination.vaccineName || 'Chưa có thông tin'}</p>
                      <p><strong>Liều số:</strong> {selectedVaccination.doseNumber || 'N/A'}</p>
                    </Col>
                    <Col md={6}>
                      <p><strong>Ngày tiêm:</strong> {
                        selectedVaccination.vaccinationDate 
                          ? new Date(selectedVaccination.vaccinationDate).toLocaleDateString('vi-VN')
                          : 'Chưa có thông tin'
                      }</p>
                      <p><strong>Ngày tiêm tiếp theo:</strong> {
                        selectedVaccination.nextDoseDate 
                          ? new Date(selectedVaccination.nextDoseDate).toLocaleDateString('vi-VN')
                          : 'Chưa có thông tin'
                      }</p>
                      <p><strong>Người thực hiện:</strong> {selectedVaccination.administeredBy || 'N/A'}</p>
                      <p><strong>Địa điểm tiêm:</strong> {selectedVaccination.administeredAt || 'N/A'}</p>
                      <p><strong>Ghi chú:</strong> {selectedVaccination.notes || 'Không có ghi chú'}</p>
                      <p><strong>Phản hồi phụ huynh:</strong> {
                        selectedVaccination.parentResponse === 'ACCEPTED' ? 'Đã đồng ý' :
                        selectedVaccination.parentResponse === 'REJECTED' ? 'Từ chối' :
                        selectedVaccination.parentResponse === 'PENDING' ? 'Chờ phản hồi' : 'N/A'
                      }</p>
                      <p><strong>Trạng thái:</strong> {getStatusBadge(selectedVaccination.notes)}</p>
                    </Col>
                  </Row>
                </div>
              )}

              {modalType === 'edit' && (
                <Form>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Tên vắc-xin</Form.Label>
                        <Form.Control
                          type="text"
                          name="vaccineName"
                          value={formData.vaccineName}
                          onChange={handleInputChange}
                          placeholder="Nhập tên vắc-xin"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Ngày tiêm</Form.Label>
                        <Form.Control
                          type="date"
                          name="vaccinationDate"
                          value={formData.vaccinationDate ? formData.vaccinationDate.split('T')[0] : ''}
                          onChange={handleInputChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Ngày tiêm tiếp theo</Form.Label>
                        <Form.Control
                          type="date"
                          name="nextDoseDate"
                          value={formData.nextDoseDate ? formData.nextDoseDate.split('T')[0] : ''}
                          onChange={handleInputChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Liều số</Form.Label>
                        <Form.Control
                          type="number"
                          name="doseNumber"
                          value={formData.doseNumber}
                          onChange={handleInputChange}
                          placeholder="Nhập số liều"
                          min="1"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Người thực hiện</Form.Label>
                        <Form.Control
                          type="text"
                          name="administeredBy"
                          value={formData.administeredBy}
                          onChange={handleInputChange}
                          placeholder="Nhập tên người thực hiện"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Địa điểm tiêm</Form.Label>
                        <Form.Control
                          type="text"
                          name="administeredAt"
                          value={formData.administeredAt}
                          onChange={handleInputChange}
                          placeholder="Nhập địa điểm tiêm"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Form.Group className="mb-3">
                    <Form.Label>Ghi chú</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Nhập ghi chú về phản ứng sau tiêm..."
                    />
                    <Form.Text className="text-muted">
                      Lưu ý: Ghi "Không có phản ứng phụ" nếu học sinh không có phản ứng bất thường.
                    </Form.Text>
                  </Form.Group>
                </Form>
              )}

              {modalType === 'delete' && (
                <div className="delete-confirmation">
                  <p>Bạn có chắc chắn muốn xóa bản ghi tiêm chủng này không?</p>
                  <div className="vaccination-info bg-light p-3 rounded">
                    <p><strong>ID:</strong> {selectedVaccination.id}</p>
                    <p><strong>Tên học sinh:</strong> {selectedVaccination.studentName || 'Chưa có thông tin'}</p>
                    <p><strong>Tên vắc-xin:</strong> {selectedVaccination.vaccineName || 'Chưa có thông tin'}</p>
                    <p><strong>Ngày tiêm:</strong> {
                      selectedVaccination.vaccinationDate 
                        ? new Date(selectedVaccination.vaccinationDate).toLocaleDateString('vi-VN')
                        : 'Chưa có thông tin'
                    }</p>
                    <p><strong>Liều số:</strong> {selectedVaccination.doseNumber || 'N/A'}</p>
                    <p><strong>Người thực hiện:</strong> {selectedVaccination.administeredBy || 'N/A'}</p>
                  </div>
                  <p className="text-danger mt-3">
                    <i className="fas fa-exclamation-triangle"></i> 
                    <strong> Hành động này không thể hoàn tác!</strong>
                  </p>
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            {modalType === 'delete' ? 'Hủy' : 'Đóng'}
          </Button>
          {modalType === 'edit' && (
            <Button variant="primary" onClick={handleSave}>
              <i className="fas fa-save"></i> Lưu thay đổi
            </Button>
          )}
          {modalType === 'delete' && (
            <Button variant="danger" onClick={handleDeleteConfirm}>
              <i className="fas fa-trash"></i> Xác nhận xóa
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PostVaccinationMonitoring;