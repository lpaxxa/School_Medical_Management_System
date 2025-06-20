import React, { useState, useEffect } from 'react';
import './MedicineReceipts.css';
import MedicineReceiptDetail from './MedicineReceiptDetail';
import { useMedicineApproval } from '../../../../../context/NurseContext/MedicineApprovalContext';

const MedicineReceipts = () => {
  const {
    medicineRequests,
    loading,
    error,
    fetchMedicineRequests,
    processMedicineRequest,
    getStatusInfo
  } = useMedicineApproval();
  
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [processingRequests, setProcessingRequests] = useState(new Set());
  
  // Additional filters
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Fetch dữ liệu yêu cầu thuốc dựa trên filter status
  useEffect(() => {
    const fetchMedicineRequests = async () => {
      try {
        setLoading(true);
        
        // Use appropriate endpoint based on filter status for better performance
        const data = await receiveMedicineService.getMedicationRequestsByStatus(filterStatus);
        setMedicineRequests(data);
        setLoading(false);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu yêu cầu thuốc:', err);
        const errorMessage = err.message || 'Không thể tải dữ liệu. Vui lòng thử lại sau.';
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchMedicineRequests();
  }, [filterStatus]); // Re-fetch when filter status changes

  // Xử lý duyệt yêu cầu thuốc
  const handleApprove = async (requestId, reason = '') => {
    if (processingRequests.has(requestId)) return;
    
    try {
      setProcessingRequests(prev => new Set(prev).add(requestId));
      
      // Gọi API để duyệt yêu cầu thuốc
      const result = await receiveMedicineService.approveMedicationRequest(requestId, reason);
      
      // Cập nhật trạng thái trong state với dữ liệu từ API
      setMedicineRequests(prev => {
        if (filterStatus === 'pending') {
          // In pending mode, remove the approved request from the list
          return prev.filter(req => req.id !== requestId);
        } else {
          // In all mode, update the request with new data
          return prev.map(req => 
            req.id === requestId ? { ...req, ...result } : req
          );
        }
      });
      
      alert('Đã duyệt yêu cầu thuốc thành công!');
    } catch (err) {
      console.error('Lỗi khi duyệt yêu cầu thuốc:', err);
      const errorMessage = err.message || 'Có lỗi xảy ra khi duyệt yêu cầu thuốc. Vui lòng thử lại sau.';
      alert(errorMessage);
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  // Xử lý từ chối yêu cầu thuốc
  const handleReject = async (requestId, reason) => {
    if (!reason?.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }
    
    if (processingRequests.has(requestId)) return;
    
    try {
      setProcessingRequests(prev => new Set(prev).add(requestId));
      
      // Gọi API để từ chối yêu cầu thuốc
      const result = await receiveMedicineService.rejectMedicationRequest(requestId, reason);
      
      // Cập nhật trạng thái trong state với dữ liệu từ API
      setMedicineRequests(prev => {
        if (filterStatus === 'pending') {
          // In pending mode, remove the rejected request from the list
          return prev.filter(req => req.id !== requestId);
        } else {
          // In all mode, update the request with new data
          return prev.map(req => 
            req.id === requestId ? { ...req, ...result } : req
          );
        }
      });
      
      alert('Đã từ chối yêu cầu thuốc thành công!');
    } catch (err) {
      console.error('Lỗi khi từ chối yêu cầu thuốc:', err);
      const errorMessage = err.message || 'Có lỗi xảy ra khi từ chối yêu cầu thuốc. Vui lòng thử lại sau.';
      alert(errorMessage);
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  // Xử lý sau khi thêm đơn thuốc mới
  const handleMedicineAdded = (newMedicine) => {
    setMedicineRequests([...medicineRequests, newMedicine]);
    setShowForm(false);
  };

  // Lọc đơn thuốc theo trạng thái - Enhanced with additional filters
  const filteredMedicineRequests = medicineRequests.filter(medicine => {
    // Search term filter (student name, student ID, medicine name, parent name)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        (medicine.studentName && medicine.studentName.toLowerCase().includes(searchLower)) ||
        (medicine.studentId && medicine.studentId.toLowerCase().includes(searchLower)) ||
        (medicine.medicineName && medicine.medicineName.toLowerCase().includes(searchLower)) ||
        (medicine.parentName && medicine.parentName.toLowerCase().includes(searchLower));
      
      if (!matchesSearch) return false;
    }
    
    // Date range filter
    if (dateFrom) {
      const medicineDate = new Date(medicine.submittedAt || medicine.startDate);
      const fromDate = new Date(dateFrom);
      if (medicineDate < fromDate) return false;
    }
    
    if (dateTo) {
      const medicineDate = new Date(medicine.submittedAt || medicine.startDate);
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      if (medicineDate > toDate) return false;
    }
    
    return true;
  });

  // Reset additional filters when status changes
  const handleStatusChange = (newStatus) => {
    setFilterStatus(newStatus);
    // Keep search and date filters when changing status
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm('');
    setDateFrom('');
    setDateTo('');
    setFilterStatus('pending');
  };

  // Xem chi tiết đơn nhận thuốc
  const handleViewDetail = (receipt) => {
    setSelectedReceipt(receipt);
    setShowDetail(true);
  };

  // Đóng form chi tiết
  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedReceipt(null);
  };

  // Hiển thị trạng thái duyệt
  const getStatusDisplay = (medicine) => {
    const status = medicine.status || medicine.approvalStatus;
    switch (status) {
      case 'PENDING_APPROVAL':
        return <span className="status-badge pending">Chờ duyệt</span>;
      case 'APPROVED':
        return <span className="status-badge approved">Đã duyệt</span>;
      case 'REJECTED':
        return <span className="status-badge rejected">Từ chối</span>;
      // Legacy support for old mock data
      case 'PENDING':
        return <span className="status-badge pending">Chờ duyệt</span>;
      default:
        return <span className="status-badge pending">Chờ duyệt</span>;
    }
  };

  return (
    <div className="medicine-receipts-container">
      <div className="receipts-header">
        <h2>Duyệt yêu cầu thuốc từ phụ huynh</h2>
        <div className="receipts-actions">
          <div className="search-container">
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              placeholder="Tìm kiếm học sinh, thuốc, phụ huynh..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-container">
            <label htmlFor="status-filter">Trạng thái:</label>
            <select 
              id="status-filter"
              value={filterStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="status-filter"
            >
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Từ chối</option>
              <option value="all">Tất cả</option>
            </select>
          </div>

          <button 
            className="btn-filter-toggle"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            title="Bộ lọc nâng cao"
          >
            <i className={`fas fa-filter ${showAdvancedFilters ? 'active' : ''}`}></i>
          </button>

          {(searchTerm || dateFrom || dateTo || filterStatus !== 'pending') && (
            <button 
              className="btn-clear-filters"
              onClick={clearAllFilters}
              title="Xóa tất cả bộ lọc"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
          
          <button className="btn-add" onClick={() => setShowForm(true)}>
            <i className="fas fa-plus"></i> Tạo đơn mới
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="advanced-filters">
          <div className="advanced-filters-content">
            <div className="filter-group">
              <label htmlFor="date-from">Từ ngày:</label>
              <input
                type="date"
                id="date-from"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="date-filter"
              />
            </div>

            <div className="filter-group">
              <label htmlFor="date-to">Đến ngày:</label>
              <input
                type="date"
                id="date-to"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="date-filter"
              />
            </div>

            <div className="filter-group">
              <span className="filter-summary">
                Hiển thị {filteredMedicineRequests.length} / {medicineRequests.length} yêu cầu
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Form thêm đơn thuốc mới */}
      {showForm && (
        <NewMedicineReceiptForm 
          onCancel={() => setShowForm(false)} 
          onMedicineAdded={handleMedicineAdded}
        />
      )}

      {/* Chi tiết đơn nhận thuốc */}
      {showDetail && selectedReceipt && (
        <MedicineReceiptDetail 
          receipt={selectedReceipt} 
          onClose={handleCloseDetail}
          onApprove={handleApprove}
          onReject={handleReject}
          isProcessing={processingRequests.has(selectedReceipt.id)}
        />
      )}

      {/* Hiển thị danh sách đơn nhận thuốc */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="medicine-receipts-list">
          {filteredMedicineRequests.length === 0 ? (
            <div className="no-data">Không có yêu cầu thuốc nào</div>
          ) : (
            <table className="receipts-table">
              <thead>                <tr>
                  <th>ID</th>
                  <th>Tên học sinh</th>
                  <th>Người yêu cầu</th>
                  <th>Ngày bắt đầu</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredMedicineRequests.map(medicine => {
                  const isPending = (medicine.status || medicine.approvalStatus) === 'PENDING_APPROVAL' || 
                                   (medicine.status || medicine.approvalStatus) === 'PENDING'; // Legacy support
                  const isProcessing = processingRequests.has(medicine.id);
                  
                  return (
                    <tr key={medicine.id} className={isPending ? 'pending-row' : ''}>
                      <td>{medicine.studentId}</td>
                      <td>{medicine.studentName}</td>
                      <td>{medicine.class}</td>
                      <td>{medicine.parentName}</td>
                      <td>{medicine.medicineName}</td>
                      <td>{new Date(medicine.startDate).toLocaleDateString('vi-VN')}</td>
                      <td>{getStatusDisplay(medicine)}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn-view" 
                            onClick={() => handleViewDetail(medicine)}
                            title="Xem chi tiết"
                            disabled={isProcessing}
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          
                          {isPending && (
                            <>
                              <button 
                                className="btn-approve"
                                onClick={() => handleApprove(medicine.id)}
                                title="Duyệt yêu cầu"
                                disabled={isProcessing}
                              >
                                {isProcessing ? (
                                  <i className="fas fa-spinner fa-spin"></i>
                                ) : (
                                  <i className="fas fa-check"></i>
                                )}
                              </button>
                              <button 
                                className="btn-reject"
                                onClick={() => {
                                  const reason = prompt('Nhập lý do từ chối:');
                                  if (reason?.trim()) {
                                    handleReject(medicine.id, reason);
                                  }
                                }}
                                title="Từ chối yêu cầu"
                                disabled={isProcessing}
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}      {/* Modal xử lý yêu cầu thuốc */}
      {showProcessModal && (
        <div className="reason-modal-overlay">
          <div className="reason-modal-container">
            <div className="reason-modal-title">
              Xử lý yêu cầu thuốc
            </div>
            <div className="process-form">
              <div className="form-group">
                <label>Quyết định:</label>
                <select 
                  name="decision"
                  value={processData.decision}
                  onChange={handleProcessDataChange}
                  className="form-select"
                >
                  <option value="APPROVED">Phê duyệt</option>
                  <option value="REJECTED">Từ chối</option>
                </select>
              </div>
              
              {processData.decision === 'REJECTED' && (
                <div className="form-group">
                  <label>Lý do từ chối:</label>
                  <textarea
                    name="reason"
                    className="reason-textarea"
                    placeholder="Nhập lý do từ chối yêu cầu thuốc..."
                    value={processData.reason}
                    onChange={handleProcessDataChange}
                    required={processData.decision === 'REJECTED'}
                  />
                </div>
              )}
            </div>
            <div className="reason-modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowProcessModal(false)}
              >
                Hủy
              </button>
              <button
                className="btn-primary"
                onClick={handleConfirmProcess}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Hàm chuyển đổi status thành text và class
const getStatusInfo = (status) => {
  switch (status) {
    case 'PENDING_APPROVAL':
      return {
        text: "Chờ phê duyệt",
        class: "status-pending" // Màu vàng
      };
    case 'APPROVED':
      return {
        text: "Đã duyệt",
        class: "status-approved" // Màu xanh lá
      };
    case 'REJECTED':
      return {
        text: "Từ chối",
        class: "status-rejected" // Màu đỏ
      };
    case 'CANCELLED':
      return {
        text: "Đã hủy",
        class: "status-cancelled" // Màu xám
      };
    default:
      return {
        text: "Không xác định",
        class: "status-unknown" // Màu xám nhạt
      };
  }
};

export default MedicineReceipts;
