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
  const [filterStatus, setFilterStatus] = useState('all');
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [pendingProcessId, setPendingProcessId] = useState(null);
  const [processData, setProcessData] = useState({
    decision: 'APPROVED',
    reason: ''
  });
  const [dropdownId, setDropdownId] = useState(null);

  // Fetch data when component mounts
  useEffect(() => {
    fetchMedicineRequests();
  }, []);
  
  // Xử lý khi nhân viên muốn xử lý yêu cầu thuốc (phê duyệt hoặc từ chối)
  const handleProcessClick = (id, initialDecision = 'APPROVED') => {
    setPendingProcessId(id);
    setProcessData({
      decision: initialDecision,
      reason: ''
    });
    setShowProcessModal(true);
  };
  
  // Xử lý khi nhân viên thay đổi dữ liệu form xử lý
  const handleProcessDataChange = (e) => {
    const { name, value } = e.target;
    setProcessData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Xử lý khi nhân viên xác nhận xử lý yêu cầu thuốc
  const handleConfirmProcess = async () => {
    try {
      // Kiểm tra lý do nếu quyết định là từ chối
      if (processData.decision === 'REJECTED' && !processData.reason.trim()) {
        alert('Vui lòng nhập lý do từ chối');
        return;
      }
      
      // Thêm thuộc tính bắt buộc theo yêu cầu API
      const requestData = {
        ...processData,
        reasonProvidedWhenRequired: processData.decision === 'REJECTED' ? true : false
      };
      
      const result = await processMedicineRequest(pendingProcessId, requestData);
      
      if (result.success) {
        setShowProcessModal(false);
        alert(`Đã ${processData.decision === 'APPROVED' ? 'phê duyệt' : 'từ chối'} yêu cầu thuốc thành công!`);
        // Refresh data after processing
        fetchMedicineRequests();
      } else {
        alert(`Không thể xử lý yêu cầu: ${result.message || 'Đã xảy ra lỗi'}`);
      }
    } catch (err) {
      console.error('Lỗi khi xử lý yêu cầu thuốc:', err);
      alert('Có lỗi xảy ra khi xử lý yêu cầu thuốc. Vui lòng thử lại sau.');
    }
  };
  // Lọc đơn thuốc theo trạng thái
  const filteredMedicineRequests = medicineRequests.filter(medicine => {
    if (filterStatus === 'all') return true;
    return medicine.status === filterStatus;
  });

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

  // Toggle dropdown menu
  const handleApproveClick = (id, e) => {
    e.stopPropagation(); // Prevent event bubbling
    setDropdownId(dropdownId === id ? null : id);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setDropdownId(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Handle selection from dropdown
  const handleActionSelect = (id, action) => {
    setDropdownId(null); // Close dropdown
    handleProcessClick(id, action);
  };

  return (
    <div className="medicine-receipts-container">
      <div className="receipts-header">
        <h2>Đơn nhận thuốc</h2>
        <div className="receipts-actions">
          <div className="filter-container">
            <label htmlFor="status-filter">Lọc theo trạng thái:</label>            <select 
              id="status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="status-filter"
            >              <option value="all">Tất cả</option>
              <option value="PENDING_APPROVAL">Chờ phê duyệt</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="REJECTED">Từ chối</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>          <button className="btn-refresh" onClick={() => {
            fetchMedicineRequests(); // Gọi API để làm mới dữ liệu
          }}>
            <i className="fas fa-sync-alt"></i> Làm mới
          </button>
        </div>
      </div>

      {/* Chi tiết đơn nhận thuốc */}
      {showDetail && selectedReceipt && (
        <MedicineReceiptDetail 
          receipt={selectedReceipt}          onClose={handleCloseDetail}
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
            <div className="no-data">Không có đơn nhận thuốc nào</div>
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
              <tbody>                {filteredMedicineRequests.map(medicine => {
                  const statusInfo = getStatusInfo(medicine.status);
                  return (
                    <tr key={medicine.id} className={statusInfo.class + '-row'}>
                      <td>{medicine.id}</td>
                      <td>{medicine.studentName}</td>
                      <td>{medicine.requestedBy}</td>
                      <td>{new Date(medicine.startDate).toLocaleDateString('vi-VN')}</td>
                      <td>
                        <span className={`status-badge ${statusInfo.class}`}>
                          {statusInfo.text}
                        </span>
                      </td>                      <td>
                        <div className="action-buttons">
                          {/* Nút xem chi tiết luôn hiển thị */}
                          <button 
                            className="btn-view" 
                            onClick={() => handleViewDetail(medicine)}
                            title="Xem chi tiết"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          
                          {/* Chỉ hiển thị nút xác nhận khi trạng thái là PENDING_APPROVAL */}
                          {medicine.status === "PENDING_APPROVAL" && (
                            <div className="dropdown-container">
                              <button 
                                className="btn-approve"
                                onClick={(e) => handleApproveClick(medicine.id, e)}
                                title="Xác nhận yêu cầu thuốc"
                              >
                                <i className="fas fa-check"></i>
                              </button>
                              
                              {/* Dropdown menu cho các hành động phê duyệt */}
                              {dropdownId === medicine.id && (
                                <div className="dropdown-menu">
                                  <div className="dropdown-item" onClick={() => handleActionSelect(medicine.id, 'APPROVED')}>
                                    Phê duyệt
                                  </div>
                                  <div className="dropdown-item" onClick={() => handleActionSelect(medicine.id, 'REJECTED')}>
                                    Từ chối
                                  </div>
                                </div>
                              )}
                            </div>
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
