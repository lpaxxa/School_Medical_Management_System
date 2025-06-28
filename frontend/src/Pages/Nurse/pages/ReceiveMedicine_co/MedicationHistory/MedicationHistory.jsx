import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Table, Button, Spinner, Badge, Form, InputGroup, Pagination } from 'react-bootstrap';
import { FaEye, FaSyncAlt, FaSearch, FaFilter, FaAngleLeft, FaAngleRight, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';
import receiveMedicineService from '../../../../../services/APINurse/receiveMedicineService';
import './MedicationHistory.css';

const MedicationHistory = () => {
  const [administrations, setAdministrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Date filter state
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Default to 10 records per page
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Fetch recent medication administrations with pagination
  const fetchAdministrations = async (page = currentPage, size = pageSize) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔄 Fetching administrations - Page: ${page}, Size: ${size}`);
      const result = await receiveMedicineService.getRecentMedicationAdministrations(page, size);
      
      console.log('🔄 Raw result from service:', result);
      console.log('🔄 Result.data type:', typeof result.data);
      console.log('🔄 Result.data is array?', Array.isArray(result.data));
      console.log('🔄 Result.data content:', result.data);
      
      if (result.success) {
        // Ensure data is always an array
        const dataArray = Array.isArray(result.data) ? result.data : [];
        console.log(`🔄 Setting administrations array with ${dataArray.length} items`);
        
        setAdministrations(dataArray);
        setTotalItems(result.totalItems || 0);
        setTotalPages(result.totalPages || 0);
        setCurrentPage(result.currentPage || page);
        console.log(`Loaded ${dataArray.length} medication administration records (page ${page}/${result.totalPages || 1})`);
      } else {
        console.log('🔄 API call failed:', result.message);
        setAdministrations([]); // Ensure empty array on failure
        setError(result.message || 'Không thể tải dữ liệu lịch sử dùng thuốc');
      }
    } catch (err) {
      console.error('Error fetching administrations:', err);
      setAdministrations([]); // Ensure empty array on error
      setError('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchAdministrations();
    
    // Listen for new medication administration created
    const handleNewRecord = () => {
      console.log('🔄 Refreshing medication history due to new record');
      fetchAdministrations(1, pageSize); // Reset to first page and refresh
    };
    
    window.addEventListener('medicationAdministrationCreated', handleNewRecord);
    
    // Cleanup event listener
    return () => {
      window.removeEventListener('medicationAdministrationCreated', handleNewRecord);
    };
  }, [pageSize]);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchAdministrations(page, pageSize);
  };

  // Handle page size change
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when changing page size
    fetchAdministrations(1, newSize);
  };

  // Filter administrations based on search term, status, and date range (client-side filtering)
  const filteredAdministrations = Array.isArray(administrations) ? administrations.filter(admin => {
    const matchesSearch = searchTerm === '' || 
      admin.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.medicationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.administeredBy?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || admin.administrationStatus === statusFilter;
    
    // Date range filtering
    let matchesDate = true;
    if (dateFilter.startDate || dateFilter.endDate) {
      const adminDate = new Date(admin.administeredAt);
      if (dateFilter.startDate) {
        const startDate = new Date(dateFilter.startDate);
        matchesDate = matchesDate && adminDate >= startDate;
      }
      if (dateFilter.endDate) {
        const endDate = new Date(dateFilter.endDate);
        endDate.setHours(23, 59, 59, 999); // Include the entire end date
        matchesDate = matchesDate && adminDate <= endDate;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  }) : [];

  // Get status badge variant
  const getStatusVariant = (status) => {
    switch (status) {
      case 'SUCCESSFUL':
        return 'success';
      case 'REFUSED':
        return 'danger';
      case 'PARTIAL':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case 'SUCCESSFUL':
        return 'Thành công';
      case 'REFUSED':
        return 'Từ chối';
      case 'PARTIAL':
        return 'Một phần';
      default:
        return 'Không xác định';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('vi-VN');
    } catch {
      return 'N/A';
    }
  };



  return (
    <Container fluid className="py-4 medication-history-container">
      <Card className="shadow-sm">
        <Card.Header className="bg-white py-3">
          <Row className="align-items-center">
            <Col>
              <h5 className="mb-0 fw-bold text-primary">Lịch sử dùng thuốc</h5>
              <small className="text-muted">
                Danh sách các lần cung cấp thuốc gần đây 
                {totalItems > 0 && ` (${totalItems} bản ghi)`}
              </small>
            </Col>
            <Col xs="auto">
              <Button
                variant="outline-primary"
                onClick={() => fetchAdministrations()}
                disabled={loading}
                className="d-flex align-items-center"
              >
                <FaSyncAlt className={`me-2 ${loading ? 'fa-spin' : ''}`} />
                Làm mới
              </Button>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body>
          {/* Search and Filter */}
          <Row className="mb-4">
            <Col lg={5} md={6}>
              <InputGroup size="sm">
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Tìm kiếm theo tên học sinh, thuốc hoặc y tá..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col lg={3} md={4}>
              <InputGroup size="sm">
                <InputGroup.Text>
                  <FaFilter />
                </InputGroup.Text>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="SUCCESSFUL">Thành công</option>
                  <option value="REFUSED">Từ chối</option>
                  <option value="PARTIAL">Một phần</option>
                </Form.Select>
              </InputGroup>
            </Col>
            <Col lg={4} md={2} className="d-flex align-items-center justify-content-end gap-2">
              <div className="d-flex gap-1">
                <Form.Control
                  type="date"
                  size="sm"
                  style={{ width: '120px', fontSize: '11px' }}
                  value={dateFilter.startDate}
                  onChange={(e) => setDateFilter({...dateFilter, startDate: e.target.value})}
                  title="Từ ngày"
                />
                <Form.Control
                  type="date"
                  size="sm"
                  style={{ width: '120px', fontSize: '11px' }}
                  value={dateFilter.endDate}
                  onChange={(e) => setDateFilter({...dateFilter, endDate: e.target.value})}
                  title="Đến ngày"
                />
              </div>
              <div className="text-muted small text-center page-info ms-2">
                <strong>Trang {currentPage}</strong> / {totalPages || 1}<br/>
                <span className="text-primary">{totalItems} bản ghi</span>
              </div>
            </Col>
          </Row>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Data Table */}
          {!loading && !error && (
            <>
              {filteredAdministrations.length === 0 ? (
                <Alert variant="info" className="text-center">
                  {Array.isArray(administrations) && administrations.length === 0 
                    ? "Chưa có lịch sử cung cấp thuốc nào"
                    : "Không tìm thấy kết quả phù hợp với bộ lọc"
                  }
                </Alert>
              ) : (
                <>
                  <div className="mb-3 d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                      Hiển thị <strong>{((currentPage - 1) * pageSize) + 1}</strong> đến{' '}
                      <strong>{Math.min(currentPage * pageSize, totalItems)}</strong> của{' '}
                      <strong>{totalItems}</strong> bản ghi
                    </small>
                    {filteredAdministrations.length !== (Array.isArray(administrations) ? administrations.length : 0) && (
                      <small className="text-warning filter-indicator">
                        <i className="fas fa-filter me-1"></i>
                        Đã lọc {filteredAdministrations.length} / {Array.isArray(administrations) ? administrations.length : 0} bản ghi
                      </small>
                    )}
                  </div>
                  
                  <div className="table-responsive">
                    <Table hover className="align-middle mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th>ID</th>
                          <th>Học sinh</th>
                          <th>Thuốc</th>
                          <th>Liều lượng</th>
                          <th>Thời gian</th>
                          <th>Y tá thực hiện</th>
                          <th>Trạng thái</th>
                          <th>Ghi chú</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAdministrations.map((admin) => (
                          <tr key={admin.id}>
                            <td className="fw-bold">#{admin.id}</td>
                            <td>
                              <div>
                                <div className="fw-medium">{admin.studentName}</div>
                                <small className="text-muted">{admin.studentId}</small>
                              </div>
                            </td>
                            <td className="fw-medium">{admin.medicationName}</td>
                            <td>{admin.dosage}</td>
                            <td>
                              <small>{formatDate(admin.administeredAt)}</small>
                            </td>
                            <td>{admin.administeredBy}</td>
                            <td>
                              <Badge bg={getStatusVariant(admin.administrationStatus)}>
                                {getStatusText(admin.administrationStatus)}
                              </Badge>
                            </td>
                            <td>
                              <div style={{ maxWidth: '200px' }}>
                                {admin.notes ? (
                                  <small className="text-muted">
                                    {admin.notes.length > 50 
                                      ? `${admin.notes.substring(0, 50)}...` 
                                      : admin.notes
                                    }
                                  </small>
                                ) : (
                                  <small className="text-muted fst-italic">Không có ghi chú</small>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>

                  {/* Arrow Navigation Pagination */}
                  {totalItems > 0 && (
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
                  )}
                </>
              )}
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default MedicationHistory;
