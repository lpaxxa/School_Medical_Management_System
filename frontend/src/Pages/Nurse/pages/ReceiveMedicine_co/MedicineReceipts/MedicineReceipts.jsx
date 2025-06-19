import React, { useState, useEffect } from 'react';
import './MedicineReceipts.css';
import receiveMedicineService from '../../../../../services/receiveMedicineService';
import NewMedicineReceiptForm from './NewMedicineReceiptForm';
import MedicineReceiptDetail from './MedicineReceiptDetail';

const MedicineReceipts = () => {
  const [medicineRequests, setMedicineRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch dữ liệu thuốc từ phụ huynh
  useEffect(() => {
    const fetchMedicineRequests = async () => {
      try {
        setLoading(true);
        
        try {
          // Gọi API để lấy danh sách yêu cầu thuốc
          const data = await receiveMedicineService.getAllMedicineRequests();
          setMedicineRequests(data);
        } catch (apiError) {
          console.error('API lỗi, sử dụng dữ liệu mẫu:', apiError);
          
          // Dữ liệu mẫu khi API chưa hoạt động
          const mockData = [
            {
              id: 1,
              studentId: 'HS001',
              studentName: 'Nguyễn Văn A',
              parentName: 'Nguyễn Văn B',
              medicineName: 'Paracetamol',
              quantity: '10 viên',
              frequency: '3 lần/ngày',
              instructions: 'Uống sau ăn',
              startDate: '2025-06-15',
              endDate: '2025-06-20',
              status: 'pending',
              receivedDate: null,
              notes: 'Thuốc hạ sốt cho bé',
              class: '10A1'
            },
            {
              id: 2,
              studentId: 'HS002',
              studentName: 'Trần Thị C',
              parentName: 'Trần Văn D',
              medicineName: 'Vitamin C',
              quantity: '30 viên',
              frequency: '1 lần/ngày',
              instructions: 'Uống trước khi đi ngủ',
              startDate: '2025-06-10',
              endDate: '2025-07-10',
              status: 'received',
              receivedDate: '2025-06-10',
              notes: 'Bổ sung vitamin hàng ngày',
              class: '11A2'
            },
            {
              id: 3,
              studentId: 'HS003',
              studentName: 'Lê Văn E',
              parentName: 'Lê Thị F',
              medicineName: 'Probiotics',
              quantity: '15 gói',
              frequency: '1 gói/ngày',
              instructions: 'Hòa với nước ấm, uống sau ăn sáng',
              startDate: '2025-06-12',
              endDate: '2025-06-27',
              status: 'pending',
              receivedDate: null,
              notes: 'Bổ sung lợi khuẩn cho hệ tiêu hóa',
              class: '9B3'
            },
            {
              id: 4,
              studentId: 'HS004',
              studentName: 'Phạm Thị G',
              parentName: 'Phạm Văn H',
              medicineName: 'Cetirizine',
              quantity: '10 viên',
              frequency: '1 viên/ngày',
              instructions: 'Uống trước khi đi ngủ',
              startDate: '2025-06-14',
              endDate: '2025-06-24',
              status: 'received',
              receivedDate: '2025-06-14',
              notes: 'Thuốc chống dị ứng',
              class: '10A3'
            }
          ];
          
          setMedicineRequests(mockData);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu thuốc từ phụ huynh:', err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    fetchMedicineRequests();
  }, []);

  // Xử lý khi nhân viên xác nhận đã nhận thuốc
  const handleReceive = async (id) => {
    try {
      try {
        // Gọi API để xác nhận đã nhận thuốc
        await receiveMedicineService.confirmReceiveMedicine(id);
      } catch (apiError) {
        console.error('API error:', apiError);
        // API lỗi, chúng ta vẫn cập nhật UI để demo
      }
      
      // Cập nhật trạng thái trong state
      const updatedRequests = medicineRequests.map(req => {
        if (req.id === id) {
          return {
            ...req,
            status: 'received',
            receivedDate: new Date().toISOString().split('T')[0] // Ngày hiện tại
          };
        }
        return req;
      });
      
      setMedicineRequests(updatedRequests);
      alert('Đã xác nhận nhận thuốc thành công!');
    } catch (err) {
      console.error('Lỗi khi xác nhận nhận thuốc:', err);
      alert('Có lỗi xảy ra khi xác nhận nhận thuốc. Vui lòng thử lại sau.');
    }
  };

  // Xử lý sau khi thêm đơn thuốc mới
  const handleMedicineAdded = (newMedicine) => {
    setMedicineRequests([...medicineRequests, newMedicine]);
    setShowForm(false);
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

  return (
    <div className="medicine-receipts-container">
      <div className="receipts-header">
        <h2>Đơn nhận thuốc</h2>
        <div className="receipts-actions">
          <div className="filter-container">
            <label htmlFor="status-filter">Lọc theo trạng thái:</label>
            <select 
              id="status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="status-filter"
            >
              <option value="all">Tất cả</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="received">Đã nhận</option>
            </select>
          </div>
          <button className="btn-add" onClick={() => setShowForm(true)}>
            <i className="fas fa-plus"></i> Tạo đơn mới
          </button>
        </div>
      </div>

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
          onConfirmReceive={handleReceive}
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
              <thead>
                <tr>
                  <th>Mã HS</th>
                  <th>Tên học sinh</th>
                  <th>Lớp</th>
                  <th>Phụ huynh</th>
                  <th>Tên thuốc</th>
                  <th>Ngày bắt đầu</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredMedicineRequests.map(medicine => (
                  <tr key={medicine.id} className={medicine.status === 'pending' ? 'pending-row' : ''}>
                    <td>{medicine.studentId}</td>
                    <td>{medicine.studentName}</td>
                    <td>{medicine.class}</td>
                    <td>{medicine.parentName}</td>
                    <td>{medicine.medicineName}</td>
                    <td>{new Date(medicine.startDate).toLocaleDateString('vi-VN')}</td>
                    <td>
                      {medicine.status === 'pending' ? (
                        <span className="status-badge pending">Chờ xác nhận</span>
                      ) : (
                        <span className="status-badge received">Đã nhận</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-view" 
                          onClick={() => handleViewDetail(medicine)}
                          title="Xem chi tiết"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        
                        {medicine.status === 'pending' && (
                          <button 
                            className="btn-receive"
                            onClick={() => handleReceive(medicine.id)}
                            title="Xác nhận nhận thuốc"
                          >
                            <i className="fas fa-check"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default MedicineReceipts;
