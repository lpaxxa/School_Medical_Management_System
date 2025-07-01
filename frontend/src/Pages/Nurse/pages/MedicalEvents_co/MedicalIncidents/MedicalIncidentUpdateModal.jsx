import React, { useState, useEffect } from 'react';
import inventoryService from '../../../../../services/APINurse/inventoryService';
import './MedicalIncidentUpdateModal.css';

const MedicalIncidentUpdateModal = ({ 
  show, 
  selectedEvent, 
  onClose, 
  onSubmit,
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    incidentId: '',
    incidentType: '',
    dateTime: '',
    description: '',
    symptoms: '',
    severityLevel: '',
    treatment: '',
    parentNotified: false,
    requiresFollowUp: false,
    followUpNotes: '',
    staffId: 1,
    staffName: '',
    parentID: '',
    imgUrl: '',
    studentId: '',
    studentName: '',
    medicationsUsed: ''
  });

  // Medication search states
  const [medicationSearch, setMedicationSearch] = useState('');
  const [medicationResults, setMedicationResults] = useState([]);
  const [showMedicationDropdown, setShowMedicationDropdown] = useState(false);
  const [searchingMedications, setSearchingMedications] = useState(false);
  const [selectedMedications, setSelectedMedications] = useState([]);

  // Initialize form data when modal opens or selectedEvent changes
  useEffect(() => {
    if (show && selectedEvent) {
      const parseMedications = async () => {
        let parsedMedications = [];
        
        if (selectedEvent.medicationsUsed && typeof selectedEvent.medicationsUsed === 'string') {
          // Parse format like "Betadine 10% (10)"
          const medicationParts = selectedEvent.medicationsUsed.split(',').map(med => med.trim());
          
          // Lookup real itemID for each medication
          const medicationPromises = medicationParts.map(async (medStr) => {
            const match = medStr.match(/^(.+)\s*\((\d+)\)$/);
            const medName = match ? match[1].trim() : medStr;
            const quantity = match ? parseInt(match[2]) : 1;
            
            try {
              // Search for medication to get real itemID
              const medicationData = await inventoryService.searchItemsByName(medName);
              
              if (medicationData && medicationData.itemID) {
                return {
                  itemID: medicationData.itemID,
                  name: medicationData.itemName || medName,
                  quantityUsed: quantity,
                  stockQuantity: medicationData.stockQuantity || 100
                };
              } else {
                console.warn(`Could not find itemID for medication: ${medName}`);
                return {
                  itemID: 1, // Fallback
                  name: medName,
                  quantityUsed: quantity,
                  stockQuantity: 100
                };
              }
            } catch (error) {
              console.error(`Error looking up medication ${medName}:`, error);
              return {
                itemID: 1, // Fallback
                name: medName,
                quantityUsed: quantity,
                stockQuantity: 100
              };
            }
          });
          
          parsedMedications = await Promise.all(medicationPromises);
        } else if (selectedEvent.medicationsUsed && Array.isArray(selectedEvent.medicationsUsed)) {
          // If already array format (new data), use directly
          parsedMedications = selectedEvent.medicationsUsed.map(med => ({
            itemID: med.itemID || 1,
            name: med.name || 'Unknown',
            quantityUsed: med.quantityUsed || 1,
            stockQuantity: 100
          }));
        }
        
        setSelectedMedications(parsedMedications);
      };

      // Parse medications asynchronously
      parseMedications();

      setFormData({
        incidentId: selectedEvent.incidentId || '',
        incidentType: selectedEvent.incidentType || '',
        dateTime: selectedEvent.dateTime ? selectedEvent.dateTime.slice(0, 16) : '',
        description: selectedEvent.description || '',
        symptoms: selectedEvent.symptoms || '',
        severityLevel: selectedEvent.severityLevel || '',
        treatment: selectedEvent.treatment || '',
        parentNotified: selectedEvent.parentNotified || false,
        requiresFollowUp: selectedEvent.requiresFollowUp || false,
        followUpNotes: selectedEvent.followUpNotes || '',
        staffId: selectedEvent.staffId || 1,
        staffName: selectedEvent.staffName || '',
        parentID: selectedEvent.parentID || '',
        imgUrl: selectedEvent.imgUrl || '',
        studentId: selectedEvent.studentId || '',
        studentName: selectedEvent.studentName || '',
        medicationsUsed: selectedEvent.medicationsUsed || ''
      });
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
    const existingIndex = selectedMedications.findIndex(
      med => med.itemID === newMedication.itemID
    );

    if (existingIndex >= 0) {
      // If exists, increment quantity
      const updatedMedications = [...selectedMedications];
      updatedMedications[existingIndex].quantityUsed += 1;
      setSelectedMedications(updatedMedications);
    } else {
      // If new, add to list
      setSelectedMedications(prev => [...prev, newMedication]);
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

    const updatedMedications = [...selectedMedications];
    updatedMedications[index].quantityUsed = quantity;
    setSelectedMedications(updatedMedications);
  };

  // Handle removing medication from list
  const handleRemoveMedication = (index) => {
    const updatedMedications = selectedMedications.filter((_, i) => i !== index);
    setSelectedMedications(updatedMedications);
  };

  // Check if quantity exceeds stock
  const isQuantityExceedsStock = (medication) => {
    return medication.quantityUsed > medication.stockQuantity;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate medication quantities
    const hasStockErrors = selectedMedications.some(med => isQuantityExceedsStock(med));
    if (hasStockErrors) {
      alert('Có thuốc có số lượng vượt quá tồn kho. Vui lòng kiểm tra lại.');
      return;
    }

    // Convert medications to array format exactly as backend expects
    const medicationsArray = selectedMedications.map(med => ({
      itemID: med.itemID,
      quantityUsed: med.quantityUsed
    }));

    console.log("Update Modal - Medications array for API:", medicationsArray);

    // Format data for API submission
    const apiData = {
      incidentType: formData.incidentType,
      description: formData.description,
      symptoms: formData.symptoms,
      severityLevel: formData.severityLevel,
      treatment: formData.treatment,
      parentNotified: formData.parentNotified,
      requiresFollowUp: formData.requiresFollowUp,
      followUpNotes: formData.followUpNotes,
      handledById: parseInt(formData.staffId) || 1,
      studentId: formData.studentId,
      medicationsUsed: medicationsArray  // Send as array exactly as backend expects: [{itemID, quantityUsed}]
    };

    console.log("Update Modal - Final API data being sent:", apiData);

    try {
      await onSubmit(apiData);
    } catch (error) {
      console.error("Update Modal - Error in handleSubmit:", error);
    }
  };

  // Close modal and reset form
  const handleClose = () => {
    setMedicationSearch('');
    setMedicationResults([]);
    setShowMedicationDropdown(false);
    setSelectedMedications([]);
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container update-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Cập nhật sự kiện y tế</h3>
          <button className="close-btn" onClick={handleClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label>ID sự kiện</label>
                <input
                  type="text"
                  name="incidentId"
                  value={formData.incidentId}
                  onChange={handleInputChange}
                  disabled
                  className="disabled-input"
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
                  <option value="Mild">Nhẹ</option>
                  <option value="Moderate">Trung bình</option>
                  <option value="Severe">Nghiêm trọng</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Mã học sinh</label>
                <input
                  type="text"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleInputChange}
                  disabled
                  className="disabled-input"
                />
              </div>
              
              <div className="form-group">
                <label>Tên học sinh</label>
                <input
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleInputChange}
                  disabled
                  className="disabled-input"
                />
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
                        key={medication.itemId || index}
                        className="medication-option"
                        onClick={() => handleSelectMedication(medication)}
                      >
                        <div className="medication-name">
                          {medication.itemName || medication.name}
                        </div>
                        <div className="medication-info">
                          Tồn kho: {medication.stockQuantity || 0} {medication.unit || 'đơn vị'}
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
              {selectedMedications.length > 0 && (
                <div className="selected-medications">
                  <h4>Thuốc đã chọn:</h4>
                  {selectedMedications.map((medication, index) => (
                    <div 
                      key={index} 
                      className={`selected-medication-item ${isQuantityExceedsStock(medication) ? 'has-error' : ''}`}
                    >
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
                              className={`quantity-input ${isQuantityExceedsStock(medication) ? 'error' : ''}`}
                            />
                            <span className="stock-info">
                              / {medication.stockQuantity} có sẵn
                            </span>
                          </div>
                        </div>
                        {isQuantityExceedsStock(medication) && (
                          <div className="error-message">
                            <i className="fas fa-exclamation-triangle"></i>
                            Số lượng vượt quá tồn kho
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
                  ))}
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

            <div className="form-group">
              <label>Tên nhân viên xử lý</label>
              <input
                type="text"
                name="staffName"
                value={formData.staffName}
                onChange={handleInputChange}
                placeholder="Tên nhân viên xử lý sự kiện"
              />
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleClose}>
              <i className="fas fa-times"></i> Hủy
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Đang cập nhật...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i> Cập nhật
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MedicalIncidentUpdateModal;
