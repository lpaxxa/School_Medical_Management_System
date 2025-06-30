import React, { useState, useContext } from 'react';
import { 
  Container, Row, Col, Card, Table, Form, Button, 
  Spinner, Alert, Modal, InputGroup, Badge, Pagination
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { 
  FaSearch, FaPlus, FaPen, FaTrash, 
  FaCheckCircle, FaTimesCircle, FaExclamationTriangle, 
  FaExclamationCircle 
} from 'react-icons/fa';
import './MedicationHistory.css';
import { useMedicationAdministration } from '../../../../../context/NurseContext/MedicineApprovalContext';

const MedicationHistory = () => {
  // Use the medication administration context
  const { 
    administrations, 
    totalPages, 
    currentPage, 
    loading, 
    error,
    fetchMedicationAdministrations,
    addMedicationAdministration,
    updateMedicationAdministration,
    deleteMedicationAdministration
  } = useMedicationAdministration();
  
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for add/edit modal
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [modalData, setModalData] = useState({
    medicationInstructionId: '',
    administeredAt: new Date().toISOString().slice(0, 16),
    administrationStatus: 'SUCCESSFUL',
    notes: ''
  });
  
  // State for delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Status mapping for display
  const statusConfig = {
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
    },
    'ISSUE': { 
      color: 'dark', 
      icon: <FaExclamationCircle className="me-1" />, 
      text: 'Vấn đề' 
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Không có thông tin';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  // Handle adding new medication administration
  const handleAddMedication = async () => {
    const result = await addMedicationAdministration(modalData);
    if (result.success) {
      setShowModal(false);
      resetModalData();
    }
  };

  // Handle editing medication administration
  const handleEditMedication = async () => {
    const result = await updateMedicationAdministration(modalData.id, modalData);
    if (result.success) {
      setShowModal(false);
      resetModalData();
    }
  };

  // Handle deleting medication administration
  const handleDeleteMedication = async () => {
    const result = await deleteMedicationAdministration(deleteId);
    if (result.success) {
      setShowDeleteModal(false);
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

  // Handle pagination change
  const handlePageChange = (page) => {
    fetchMedicationAdministrations(page);
  };

  // Generate pagination items
  const renderPaginationItems = () => {
    let items = [];
    
    // Previous button
    items.push(
      <Pagination.Prev 
        key="prev" 
        disabled={currentPage === 1} 
        onClick={() => handlePageChange(currentPage - 1)} 
      />
    );
    
    // First page
    if (currentPage > 2) {
      items.push(
        <Pagination.Item key={1} onClick={() => handlePageChange(1)}>
          1
        </Pagination.Item>
      );
      
      if (currentPage > 3) {
        items.push(<Pagination.Ellipsis key="ellipsis-1" />);
      }
    }
    
    // Current page and neighbors
    for (let page = Math.max(1, currentPage - 1); 
         page <= Math.min(totalPages, currentPage + 1); 
         page++) {
      items.push(
        <Pagination.Item 
          key={page} 
          active={page === currentPage}
          onClick={() => handlePageChange(page)}
        >
          {page}
        </Pagination.Item>
      );
    }
    
    // Last page
    if (currentPage < totalPages - 1) {
      if (currentPage < totalPages - 2) {
        items.push(<Pagination.Ellipsis key="ellipsis-2" />);
      }
      
      items.push(
        <Pagination.Item 
          key={totalPages} 
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </Pagination.Item>
      );
    }
    
    // Next button
    items.push(
      <Pagination.Next 
        key="next" 
        disabled={currentPage === totalPages} 
        onClick={() => handlePageChange(currentPage + 1)} 
      />
    );
    
    return items;
  };

  // Filter by search term
  const filteredAdministrations = administrations.filter(medication => 
    searchTerm === '' || 
    medication.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medication.medicationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medication.administeredBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container fluid className="py-4">
      <Card className="shadow-sm">
        <Card.Header className="bg-white py-3">
          <Row className="align-items-center">
            <Col>
              <h5 className="mb-0 fw-bold text-primary">Lịch sử dùng thuốc</h5>
            </Col>
            <Col xs="auto">
              <Button 
                variant="primary" 
                className="d-flex align-items-center" 
                onClick={openAddModal}
              >
                <FaPlus className="me-2" /> Thêm mới
              </Button>
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
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
          </Row>

          {/* Error message display */}
          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
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
              {filteredAdministrations.length === 0 ? (
                <Alert variant="info">Không có dữ liệu lịch sử dùng thuốc</Alert>
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
                      <th className="text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAdministrations.map((medication) => (
                      <tr key={medication.id}>
                        <td className="ps-4 fw-bold">{medication.id}</td>
                        <td>{medication.studentName}</td>
                        <td>{medication.medicationName}</td>
                        <td>{formatDate(medication.administeredAt)}</td>
                        <td>{medication.administeredBy}</td>
                        <td>
                          <Badge 
                            bg={statusConfig[medication.administrationStatus].color} 
                            className="d-inline-flex align-items-center py-2 px-3"
                          >
                            {statusConfig[medication.administrationStatus].icon}
                            {statusConfig[medication.administrationStatus].text}
                          </Badge>
                        </td>
                        <td>
                          <div className="d-flex justify-content-center gap-2">
                            <Button 
                              variant="outline-primary" 
                              size="sm" 
                              title="Chỉnh sửa"
                              onClick={() => openEditModal(medication)}
                            >
                              <FaPen />
                            </Button>
                            <Button 
                              variant="outline-danger" 
                              size="sm" 
                              title="Xóa"
                              onClick={() => openDeleteModal(medication.id)}
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <Pagination>{renderPaginationItems()}</Pagination>
                </div>
              )}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditing ? 'Chỉnh sửa thông tin dùng thuốc' : 'Thêm mới thông tin dùng thuốc'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Mã đơn thuốc</Form.Label>
              <Form.Control
                type="number"
                name="medicationInstructionId"
                value={modalData.medicationInstructionId}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Thời gian dùng thuốc</Form.Label>
              <Form.Control
                type="datetime-local"
                name="administeredAt"
                value={modalData.administeredAt}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Trạng thái</Form.Label>
              <Form.Select
                name="administrationStatus"
                value={modalData.administrationStatus}
                onChange={handleInputChange}
                required
              >
                <option value="SUCCESSFUL">Thành công</option>
                <option value="REFUSED">Từ chối</option>
                <option value="PARTIAL">Một phần</option>
                <option value="ISSUE">Vấn đề</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Ghi chú</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                value={modalData.notes}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Hủy
          </Button>
          <Button 
            variant="primary" 
            onClick={isEditing ? handleEditMedication : handleAddMedication}
          >
            {isEditing ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn có chắc chắn muốn xóa thông tin dùng thuốc này không?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleDeleteMedication}>
            Xóa
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MedicationHistory;
