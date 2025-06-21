import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Pagination } from 'react-bootstrap';
import { useAuth } from '../../../../../context/AuthContext';
import { useHealthCheckup } from '../../../../../context/NurseContext';
import { FaAngleLeft, FaAngleRight, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';
import './CheckupList.css';

const CheckupList = () => {
  // Lấy thông tin người dùng từ context
  const { currentUser } = useAuth();
  const { healthCheckups, loading: dataLoading, error, refreshHealthCheckups } = useHealthCheckup();
  
  // State for modals
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCheckup, setSelectedCheckup] = useState(null);
  
  // State for filtering, pagination and searching
  const [filteredCheckups, setFilteredCheckups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Update filtered checkups when data changes
  useEffect(() => {
    if (healthCheckups && healthCheckups.length > 0) {
      applyFilters();
    } else {
      setFilteredCheckups([]);
    }
  }, [healthCheckups, searchTerm]);
  
  // Xử lý lọc dữ liệu
  const applyFilters = () => {
    let filtered = [...healthCheckups];
    
    // Lọc theo từ khoá tìm kiếm
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(checkup => 
        checkup.studentName?.toLowerCase().includes(term) || 
        checkup.checkupType?.toLowerCase().includes(term) ||
        (checkup.diagnosis && checkup.diagnosis.toLowerCase().includes(term))
      );
    }
    
    // Sắp xếp theo ID tăng dần
    filtered = filtered.sort((a, b) => a.id - b.id);
    
    setFilteredCheckups(filtered);
    // Reset to first page when filters change
    setCurrentPage(1);
  };
  
  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCheckups.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCheckups.length / itemsPerPage);
  
  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit', 
      minute: '2-digit'
    }).format(date);
  };
  
  // Handle viewing checkup details
  const handleViewDetails = (checkup) => {
    setSelectedCheckup(checkup);
    setShowDetailsModal(true);
  };

  // Handle editing a checkup
  const handleEdit = (checkup) => {
    setSelectedCheckup(checkup);
    setShowEditModal(true);
  };

  // Handle deleting a checkup
  const handleDelete = (checkup) => {
    setSelectedCheckup(checkup);
    setShowDeleteModal(true);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    // Will implement API call when available
    setShowDeleteModal(false);
    alert('Chức năng xóa sẽ được cập nhật khi API sẵn sàng');
    // refreshHealthCheckups();
  };

  return (
    <div className='checkup-list-container'>
      {loading && (
        <div className='loading-overlay'>
          <div className='spinner'></div>
        </div>
      )}
      
      <div className='checkup-list-header'>
        <h2>Danh sách khám sức khỏe</h2>
      </div>
      
      <div className='table-container'>
        <div className='search-container'>
          <input
            type='text'
            placeholder='Tìm kiếm theo tên học sinh, loại khám hoặc chẩn đoán...'
            className='search-input'
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        
        <table className='checkup-table'>
          <thead>
            <tr>
              <th>ID</th>
              <th>Mã học sinh</th>
              <th>Tên học sinh</th>
              <th>Loại khám</th>
              <th>Ngày giờ khám</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {dataLoading ? (
              <tr>
                <td colSpan='6' className='loading-message'>
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : filteredCheckups.length > 0 ? (
              currentItems.map((checkup) => (
                <tr key={checkup.id}>
                  <td>{checkup.id}</td>
                  <td>{checkup.studentId}</td>
                  <td>{checkup.studentName}</td>
                  <td>{checkup.checkupType}</td>
                  <td>{formatDate(checkup.checkupDate)}</td>
                  <td>
                    <div className='action-buttons'>
                      <button 
                        className='action-btn view-btn' 
                        onClick={() => handleViewDetails(checkup)}
                        title='Xem chi tiết'
                        aria-label='Xem chi tiết'
                      >
                        <i className='fas fa-eye'></i>
                      </button>
                      <button 
                        className='action-btn edit-btn' 
                        onClick={() => handleEdit(checkup)}
                        title='Sửa'
                        aria-label='Sửa'
                      >
                        <i className='fas fa-edit'></i>
                      </button>
                      <button 
                        className='action-btn delete-btn' 
                        onClick={() => handleDelete(checkup)}
                        title='Xóa'
                        aria-label='Xóa'
                      >
                        <i className='fas fa-trash'></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan='6' className='empty-message'>
                  {searchTerm
                    ? 'Không tìm thấy kết quả khám nào phù hợp với tìm kiếm.'
                    : 'Chưa có kết quả khám nào được ghi nhận.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {/* Enhanced Pagination - Fixed to match design */}
        {filteredCheckups.length > 0 && (
          <div className='pagination-container'>
            <div className='pagination-wrapper'>
              {/* First and Previous buttons */}
              <span className="page-item-text" onClick={() => handlePageChange(1)} style={{ cursor: currentPage === 1 ? 'default' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}>
                <FaAngleDoubleLeft /> First
              </span>
              <span className="page-item-text" onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)} style={{ cursor: currentPage === 1 ? 'default' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}>
                <FaAngleLeft /> Previous
              </span>
              
              {/* Current page indicator */}
              <span className="current-page">
                {currentPage}
              </span>
              
              {/* Show specific page number if available */}
              {totalPages > 1 && (
                <span className="page-number" onClick={() => handlePageChange(2)}>
                  2
                </span>
              )}
              
              {/* Separator if there are many pages */}
              {totalPages > 2 && (
                <span className="page-separator">•</span>
              )}
              
              {/* Next and Last buttons */}
              <span className="page-item-text" onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)} style={{ cursor: currentPage === totalPages ? 'default' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}>
                Next <FaAngleRight />
              </span>
              <span className="page-item-text" onClick={() => handlePageChange(totalPages)} style={{ cursor: currentPage === totalPages ? 'default' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}>
                Last <FaAngleDoubleRight />
              </span>
            </div>
            <div className="pagination-info">
              Hiển thị {indexOfFirstItem + 1} đến {Math.min(indexOfLastItem, filteredCheckups.length)} trong tổng số {filteredCheckups.length} kết quả
            </div>
          </div>
        )}
      </div>
      
      {/* Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size='lg'>
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết kết quả khám</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCheckup && (
            <div className='checkup-details'>
              <Row>
                <Col md={6}>
                  <h5>Thông tin học sinh</h5>
                  <p><strong>ID:</strong> {selectedCheckup.id}</p>
                  <p><strong>Mã học sinh:</strong> {selectedCheckup.studentId}</p>
                  <p><strong>Tên học sinh:</strong> {selectedCheckup.studentName}</p>
                </Col>
                <Col md={6}>
                  <h5>Thông tin khám</h5>
                  <p><strong>Ngày khám:</strong> {formatDate(selectedCheckup.checkupDate)}</p>
                  <p><strong>Loại khám:</strong> {selectedCheckup.checkupType}</p>
                </Col>
              </Row>
              <hr />
              <Row>
                <Col md={6}>
                  <h5>Chỉ số</h5>
                  <p><strong>Chiều cao:</strong> {selectedCheckup.height} cm</p>
                  <p><strong>Cân nặng:</strong> {selectedCheckup.weight} kg</p>
                  <p><strong>BMI:</strong> {selectedCheckup.bmi}</p>
                  <p><strong>Huyết áp:</strong> {selectedCheckup.bloodPressure}</p>
                  <p><strong>Thị lực trái:</strong> {selectedCheckup.visionLeft}</p>
                  <p><strong>Thị lực phải:</strong> {selectedCheckup.visionRight}</p>
                  <p><strong>Thính lực:</strong> {selectedCheckup.hearingStatus}</p>
                  <p><strong>Nhịp tim:</strong> {selectedCheckup.heartRate} bpm</p>
                  <p><strong>Nhiệt độ cơ thể:</strong> {selectedCheckup.bodyTemperature}C</p>
                </Col>
                <Col md={6}>
                  <h5>Kết quả</h5>
                  <p><strong>Chẩn đoán:</strong> {selectedCheckup.diagnosis}</p>
                  <p><strong>Khuyến nghị:</strong> {selectedCheckup.recommendations}</p>
                  <p><strong>Cần theo dõi:</strong> {selectedCheckup.followUpNeeded ? 'Có' : 'Không'}</p>
                  <p><strong>Đã thông báo phụ huynh:</strong> {selectedCheckup.parentNotified ? 'Có' : 'Không'}</p>
                  <hr />
                  <p><strong>Y tá/Bác sĩ:</strong> {selectedCheckup.medicalStaffName}</p>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowDetailsModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Edit Modal - Placeholder until API is updated */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Chỉnh sửa kết quả khám</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Chức năng chỉnh sửa sẽ được cập nhật khi API sẵn sàng.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowEditModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Bạn có chắc chắn muốn xóa kết quả khám này không? Hành động này không thể hoàn tác.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowDeleteModal(false)}>
            Hủy
          </Button>
          <Button variant='danger' onClick={handleConfirmDelete}>
            Xác nhận xóa
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CheckupList;
