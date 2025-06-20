import React, { useState } from 'react';
import './NewMedicineReceiptForm.css';
import receiveMedicineService from '../../../../../services/receiveMedicineService';

const NewMedicineReceiptForm = ({ onCancel, onMedicineAdded }) => {
  const [medicationSearchResults, setMedicationSearchResults] = useState([]);
  const [medicationSearchLoading, setMedicationSearchLoading] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    studentName: '',
    parentName: '',
    medicineName: '',
    medicineId: '',
    quantity: '',
    frequency: '',
    instructions: '',
    startDate: '',
    endDate: '',
    notes: '',
    class: ''
  });

  // Xử lý thay đổi input trong form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Xóa medicineId nếu người dùng thay đổi tên thuốc
    if (name === 'medicineName') {
      setFormData({
        ...formData,
        [name]: value,
        medicineId: '' // Clear the ID when typing a new name
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Tìm kiếm thuốc theo tên
  const searchMedication = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setMedicationSearchResults([]);
      return;
    }
    
    try {
      setMedicationSearchLoading(true);
      
      // Call API to search medications
      const results = await receiveMedicineService.searchMedicationByName(searchTerm);
      setMedicationSearchResults(results);
    } catch (error) {
      console.error('Lỗi khi tìm kiếm thuốc:', error);
      setMedicationSearchResults([]);
      // Show error message if it's an authentication/authorization issue
      if (error.message && (error.message.includes('đăng nhập') || error.message.includes('quyền'))) {
        alert(error.message);
      }
    } finally {
      setMedicationSearchLoading(false);
    }
  };
  
  // Xử lý chọn thuốc từ kết quả tìm kiếm
  const handleSelectMedication = (medication) => {
    setFormData({
      ...formData,
      medicineName: medication.name,
      medicineId: medication.id
    });
    setMedicationSearchResults([]);
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Format data for API
      const medicineRequestData = {
        ...formData,
        status: 'PENDING_APPROVAL',
        receivedDate: null
      };
      
      console.log('Sending to API:', medicineRequestData);
      
      // Gọi API để thêm yêu cầu thuốc mới
      const response = await receiveMedicineService.addMedicineRequest(medicineRequestData);
      
      // Thêm vào danh sách hiện tại
      const newMedicine = {
        id: response.id || Date.now(),
        ...response
      };
      
      onMedicineAdded(newMedicine);
      alert('Đã thêm đơn nhận thuốc thành công!');
    } catch (err) {
      console.error('Lỗi khi thêm đơn nhận thuốc:', err);
      const errorMessage = err.message || 'Có lỗi xảy ra khi thêm đơn nhận thuốc. Vui lòng thử lại sau.';
      alert(errorMessage);
    }
  };

  return (
    <div className="new-receipt-form">
      <h3>Thêm đơn nhận thuốc mới</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h4>Thông tin học sinh</h4>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="studentId">Mã học sinh:</label>
              <input
                type="text"
                id="studentId"
                name="studentId"
                value={formData.studentId}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="studentName">Tên học sinh:</label>
              <input
                type="text"
                id="studentName"
                name="studentName"
                value={formData.studentName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="class">Lớp:</label>
              <input
                type="text"
                id="class"
                name="class"
                value={formData.class}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="parentName">Tên phụ huynh:</label>
            <input
              type="text"
              id="parentName"
              name="parentName"
              value={formData.parentName}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h4>Thông tin thuốc</h4>
          <div className="form-group medication-search">
            <label htmlFor="medicineName">Tên thuốc:</label>
            <div className="search-container">
              <input
                type="text"
                id="medicineName"
                name="medicineName"
                value={formData.medicineName}
                onChange={(e) => {
                  handleInputChange(e);
                  searchMedication(e.target.value);
                }}
                placeholder="Nhập tên thuốc để tìm kiếm"
                required
              />
              {medicationSearchLoading && <div className="search-loading">Đang tìm...</div>}
              
              {medicationSearchResults.length > 0 && (
                <div className="search-results">
                  {medicationSearchResults.map((med) => (
                    <div 
                      key={med.id} 
                      className="search-result-item"
                      onClick={() => handleSelectMedication(med)}
                    >
                      <span className="id-badge">{med.id}</span>
                      {med.name}
                      {med.category && <span className="category-badge">{med.category}</span>}
                    </div>
                  ))}
                </div>
              )}
              
              {formData.medicineId && (
                <div className="selected-item-info">
                  ID thuốc: <strong>{formData.medicineId}</strong>
                </div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="quantity">Số lượng:</label>
              <input
                type="text"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                placeholder="Ví dụ: 10 viên"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="frequency">Tần suất sử dụng:</label>
              <input
                type="text"
                id="frequency"
                name="frequency"
                value={formData.frequency}
                onChange={handleInputChange}
                placeholder="Ví dụ: 3 lần/ngày"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="instructions">Hướng dẫn sử dụng:</label>
            <textarea
              id="instructions"
              name="instructions"
              value={formData.instructions}
              onChange={handleInputChange}
              rows="2"
              placeholder="Ví dụ: Uống sau bữa ăn"
            ></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Ngày bắt đầu:</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="endDate">Ngày kết thúc:</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Ghi chú:</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="3"
            ></textarea>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-submit">
            <i className="fas fa-save"></i> Lưu thông tin
          </button>
          <button type="button" className="btn-cancel" onClick={onCancel}>
            <i className="fas fa-times"></i> Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewMedicineReceiptForm;
