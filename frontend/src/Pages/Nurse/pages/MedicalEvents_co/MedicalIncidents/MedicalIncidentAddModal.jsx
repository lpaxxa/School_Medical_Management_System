import React, { useState, useEffect } from 'react';
import inventoryService from '../../../../../services/APINurse/inventoryService';
import './MedicalIncidentAddModal.css';

const MedicalIncidentAddModal = ({ 
  show, 
  selectedEvent, 
  onClose, 
  onSubmit,
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    studentId: '',
    incidentType: '',
    dateTime: '',
    description: '',
    symptoms: '',
    severityLevel: '',
    treatment: '',
    parentNotified: false,
    requiresFollowUp: false,
    followUpNotes: '',
    medicationsUsed: []
  });

  // Medication search states
  const [medicationSearch, setMedicationSearch] = useState('');
  const [medicationResults, setMedicationResults] = useState([]);
  const [showMedicationDropdown, setShowMedicationDropdown] = useState(false);
  const [searchingMedications, setSearchingMedications] = useState(false);

  // Initialize form data when modal opens or selectedEvent changes
  useEffect(() => {
    if (show) {
      if (selectedEvent) {
        // Edit mode - populate form with existing data
        setFormData({
          studentId: selectedEvent.studentId || '',
          incidentType: selectedEvent.incidentType || '',
          dateTime: selectedEvent.dateTime ? 
            new Date(selectedEvent.dateTime).toISOString().slice(0, 16) : '',
          description: selectedEvent.description || '',
          symptoms: selectedEvent.symptoms || '',
          severityLevel: selectedEvent.severityLevel || '',
          treatment: selectedEvent.treatment || '',
          parentNotified: selectedEvent.parentNotified || false,
          requiresFollowUp: selectedEvent.requiresFollowUp || false,
          followUpNotes: selectedEvent.followUpNotes || '',
          medicationsUsed: selectedEvent.medicationsUsed || []
        });
      } else {
        // Add mode - reset form with current datetime
        const now = new Date();
        const formattedDateTime = now.toISOString().slice(0, 16);
        setFormData({
          studentId: '',
          incidentType: '',
          dateTime: formattedDateTime,
          description: '',
          symptoms: '',
          severityLevel: '',
          treatment: '',
          parentNotified: false,
          requiresFollowUp: false,
          followUpNotes: '',
          medicationsUsed: []
        });
      }
    }
  }, [show, selectedEvent]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle medication search
  const handleMedicationSearch = async (searchTerm) => {
    setMedicationSearch(searchTerm);
    
    if (searchTerm.trim().length < 2) {
      setMedicationResults([]);
      setShowMedicationDropdown(false);
      return;
    }

    setSearchingMedications(true);
    try {
      const results = await inventoryService.searchItemsByName(searchTerm);
      if (results && Array.isArray(results)) {
        setMedicationResults(results);
        setShowMedicationDropdown(true);
      } else if (results) {
        // If single result, wrap in array
        setMedicationResults([results]);
        setShowMedicationDropdown(true);
      } else {
        setMedicationResults([]);
        setShowMedicationDropdown(false);
      }
    } catch (error) {
      console.error('Error searching medications:', error);
      setMedicationResults([]);
      setShowMedicationDropdown(false);
    } finally {
      setSearchingMedications(false);
    }
  };

  // Handle selecting a medication from search results
  const handleSelectMedication = (medication) => {
    const newMedication = {
      itemID: medication.itemId || medication.id || medication.itemID,
      name: medication.itemName || medication.name,
      quantityUsed: 1,
      stockQuantity: medication.stockQuantity || 0
    };

    // Check if medication already exists in the list
    const existingIndex = formData.medicationsUsed.findIndex(
      med => med.itemID === newMedication.itemID
    );

    if (existingIndex >= 0) {
      // If exists, increment quantity
      const updatedMedications = [...formData.medicationsUsed];
      updatedMedications[existingIndex].quantityUsed += 1;
      setFormData(prev => ({
        ...prev,
        medicationsUsed: updatedMedications
      }));
    } else {
      // If new, add to list
      setFormData(prev => ({
        ...prev,
        medicationsUsed: [...prev.medicationsUsed, newMedication]
      }));
    }

    // Clear search
    setMedicationSearch('');
    setMedicationResults([]);
    setShowMedicationDropdown(false);
  };

  // Handle updating medication quantity
  const handleMedicationQuantityChange = (index, newQuantity) => {
    const quantity = parseInt(newQuantity) || 0;
    if (quantity <= 0) {
      // Remove medication if quantity is 0 or less
      handleRemoveMedication(index);
      return;
    }

    const updatedMedications = [...formData.medicationsUsed];
    updatedMedications[index].quantityUsed = quantity;
    setFormData(prev => ({
      ...prev,
      medicationsUsed: updatedMedications
    }));
  };

  // Handle removing medication from list
  const handleRemoveMedication = (index) => {
    const updatedMedications = formData.medicationsUsed.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      medicationsUsed: updatedMedications
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Format data for API submission
    const apiData = {
      studentId: formData.studentId,
      incidentType: formData.incidentType,
      dateTime: formData.dateTime,
      description: formData.description,
      symptoms: formData.symptoms,
      severityLevel: formData.severityLevel,
      treatment: formData.treatment,
      parentNotified: formData.parentNotified,
      requiresFollowUp: formData.requiresFollowUp,
      followUpNotes: formData.followUpNotes,
      medicationsUsed: formData.medicationsUsed.map(med => ({
        quantityUsed: med.quantityUsed,
        itemID: med.itemID,
        name: med.name  // Include name for string conversion in service
      })),
      handledById: 1 // Default handler ID
    };

    await onSubmit(apiData);
  };

  // Close modal and reset form
  const handleClose = () => {
    setMedicationSearch('');
    setMedicationResults([]);
    setShowMedicationDropdown(false);
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container add-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{selectedEvent ? 'Chỉnh sửa sự kiện y tế' : 'Thêm sự kiện y tế mới'}</h3>
          <button className="close-btn" onClick={handleClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label>Mã học sinh <span className="required">*</span></label>
                <input
                  type="text"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleInputChange}
                  required
                  placeholder="Nhập mã học sinh"
                />
              </div>
              
              <div className="form-group">
                <label>Loại sự kiện <span className="required">*</span></label>
                <input
                  type="text"
                  name="incidentType"
                  value={formData.incidentType}
                  onChange={handleInputChange}
                  required
                  placeholder="Nhập loại sự kiện"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Ngày giờ <span className="required">*</span></label>
                <input
                  type="datetime-local"
                  name="dateTime"
                  value={formData.dateTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Mức độ nghiêm trọng <span className="required">*</span></label>
                <select
                  name="severityLevel"
                  value={formData.severityLevel}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Chọn mức độ</option>
                  <option value="Nhẹ">Nhẹ</option>
                  <option value="Trung bình">Trung bình</option>
                  <option value="Nghiêm trọng">Nghiêm trọng</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Mô tả</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                placeholder="Mô tả chi tiết sự kiện"
              />
            </div>

            <div className="form-group">
              <label>Triệu chứng</label>
              <textarea
                name="symptoms"
                value={formData.symptoms}
                onChange={handleInputChange}
                rows="3"
                placeholder="Ghi lại các triệu chứng quan sát được"
              />
            </div>

            <div className="form-group">
              <label>Điều trị</label>
              <textarea
                name="treatment"
                value={formData.treatment}
                onChange={handleInputChange}
                rows="3"
                placeholder="Biện pháp điều trị đã thực hiện"
              />
            </div>

            {/* Medication Search Section */}
            <div className="form-group medication-section">
              <label>Thuốc sử dụng</label>
              <div className="medication-search-container">
                <div className="search-input-wrapper">
                  <input
                    type="text"
                    className="medication-search-input"
                    value={medicationSearch}
                    onChange={(e) => handleMedicationSearch(e.target.value)}
                    placeholder="Tìm kiếm thuốc theo tên..."
                  />
                  {searchingMedications && (
                    <div className="search-loading">
                      <i className="fas fa-spinner fa-spin"></i>
                    </div>
                  )}
                </div>
                
                {/* Medication Search Results Dropdown */}
                {showMedicationDropdown && medicationResults.length > 0 && (
                  <div className="medication-dropdown">
                    {medicationResults.map((medication, index) => (
                      <div
                        key={medication.id || index}
                        className="medication-option"
                        onClick={() => handleSelectMedication(medication)}
                      >
                        <div className="medication-name">
                          {medication.itemName || medication.name}
                        </div>
                        <div className="medication-info">
                          Tồn kho: {medication.stockQuantity || medication.quantity || 0} {medication.unit || 'đơn vị'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {showMedicationDropdown && medicationResults.length === 0 && !searchingMedications && (
                  <div className="medication-dropdown">
                    <div className="no-results">Không tìm thấy thuốc phù hợp</div>
                  </div>
                )}
              </div>

              {/* Selected Medications List */}
              {formData.medicationsUsed.length > 0 && (
                <div className="selected-medications">
                  <h4>Thuốc đã chọn:</h4>
                  {formData.medicationsUsed.map((medication, index) => {
                    const isOverStock = medication.quantityUsed > (medication.stockQuantity || 0);
                    return (
                      <div key={index} className={`selected-medication-item ${isOverStock ? 'has-error' : ''}`}>
                        <div className="medication-details">
                          <div className="medication-header">
                            <span className="medication-name">{medication.name}</span>
                          </div>
                          <div className="quantity-row">
                            <div className="quantity-controls">
                              <label>Số lượng:</label>
                              <input
                                type="number"
                                min="1"
                                value={medication.quantityUsed}
                                onChange={(e) => handleMedicationQuantityChange(index, e.target.value)}
                                className={`quantity-input ${isOverStock ? 'error' : ''}`}
                              />
                            </div>
                            <span className="stock-info">
                              Tồn kho: {medication.stockQuantity || 0}
                            </span>
                          </div>
                          {isOverStock && (
                            <div className="error-message">
                              <i className="fas fa-exclamation-triangle"></i>
                              Số lượng vượt quá tồn kho!
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          className="remove-medication-btn"
                          onClick={() => handleRemoveMedication(index)}
                          title="Xóa thuốc"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="parentNotified"
                    checked={formData.parentNotified}
                    onChange={handleInputChange}
                  />
                  Đã thông báo phụ huynh
                </label>
              </div>
              
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="requiresFollowUp"
                    checked={formData.requiresFollowUp}
                    onChange={handleInputChange}
                  />
                  Cần theo dõi tiếp
                </label>
              </div>
            </div>

            {formData.requiresFollowUp && (
              <div className="form-group">
                <label>Ghi chú theo dõi</label>
                <textarea
                  name="followUpNotes"
                  value={formData.followUpNotes}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Ghi chú cho việc theo dõi tiếp"
                />
              </div>
            )}
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleClose}>
              <i className="fas fa-times"></i> Hủy
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Đang xử lý...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i> {selectedEvent ? 'Cập nhật' : 'Thêm mới'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MedicalIncidentAddModal;
