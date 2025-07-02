import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import inventoryService from '../../../../../services/APINurse/inventoryService';

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
          for (const medicationPart of medicationParts) {
            const match = medicationPart.match(/^(.+?)\s*\((\d+)\)$/);
            if (match) {
              const [, medicationName, quantity] = match;
              
              try {
                const searchResults = await inventoryService.searchItemsByName(medicationName.trim());
                if (searchResults && searchResults.length > 0) {
                  const foundMedication = searchResults[0];
                  parsedMedications.push({
                    itemID: foundMedication.itemID,
                    itemName: foundMedication.itemName,
                    quantityUsed: parseInt(quantity),
                    currentStock: foundMedication.currentStock,
                    unit: foundMedication.unit
                  });
                }
              } catch (error) {
                console.error(`Error searching for medication: ${medicationName}`, error);
              }
            }
          }
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
      }
    } catch (error) {
      console.error('Error searching medications:', error);
      setMedicationResults([]);
    } finally {
      setSearchingMedications(false);
    }
  };

  // Handle medication selection
  const handleMedicationSelect = (medication) => {
    // Check if medication is already selected
    const isAlreadySelected = selectedMedications.some(med => med.itemID === medication.itemID);
    
    if (!isAlreadySelected) {
      setSelectedMedications(prev => [...prev, {
        itemID: medication.itemID,
        itemName: medication.itemName,
        quantityUsed: 1,
        currentStock: medication.currentStock,
        unit: medication.unit || 'viên'
      }]);
    }
    
    setMedicationSearch('');
    setShowMedicationDropdown(false);
    setMedicationResults([]);
  };

  // Handle medication quantity change
  const handleMedicationQuantityChange = (itemID, newQuantity) => {
    setSelectedMedications(prev => 
      prev.map(med => 
        med.itemID === itemID 
          ? { ...med, quantityUsed: Math.max(0, parseInt(newQuantity) || 0) }
          : med
      )
    );
  };

  // Handle medication removal
  const handleMedicationRemove = (itemID) => {
    setSelectedMedications(prev => prev.filter(med => med.itemID !== itemID));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      console.log("Update Modal - Starting form submission");
      console.log("Update Modal - Selected medications:", selectedMedications);

      // Format medications for API
      const medicationsArray = selectedMedications.map(med => ({
        itemID: parseInt(med.itemID),
        quantityUsed: parseInt(med.quantityUsed)
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

      const result = await onSubmit(apiData);
      if (result) {
        toast.success('Cập nhật sự kiện y tế thành công!');
        handleClose();
      }
    } catch (error) {
      console.error("Update Modal - Error in handleSubmit:", error);
      toast.error('Lỗi khi cập nhật sự kiện y tế');
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
    <>
      <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header bg-warning text-dark">
              <h5 className="modal-title fw-bold">
                <i className="fas fa-edit me-2"></i>
                Cập nhật sự kiện y tế
              </h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={handleClose}
                aria-label="Close"
              ></button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-muted">
                      <i className="fas fa-id-badge me-2"></i>ID sự kiện
                    </label>
                    <input
                      type="text"
                      name="incidentId"
                      value={formData.incidentId}
                      onChange={handleInputChange}
                      disabled
                      className="form-control bg-light text-muted"
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-primary">
                      <i className="fas fa-tag me-2"></i>Loại sự kiện <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="incidentType"
                      value={formData.incidentType}
                      onChange={handleInputChange}
                      required
                      placeholder="Nhập loại sự kiện"
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-primary">
                      <i className="fas fa-calendar-alt me-2"></i>Ngày giờ <span className="text-danger">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      name="dateTime"
                      value={formData.dateTime}
                      onChange={handleInputChange}
                      required
                      className="form-control"
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-danger">
                      <i className="fas fa-exclamation-triangle me-2"></i>Mức độ nghiêm trọng <span className="text-danger">*</span>
                    </label>
                    <select
                      name="severityLevel"
                      value={formData.severityLevel}
                      onChange={handleInputChange}
                      required
                      className="form-select"
                    >
                      <option value="">Chọn mức độ</option>
                      <option value="Nhẹ">Nhẹ</option>
                      <option value="Trung bình">Trung bình</option>
                      <option value="Nghiêm trọng">Nghiêm trọng</option>
                    </select>
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-muted">
                      <i className="fas fa-id-card me-2"></i>Mã học sinh
                    </label>
                    <input
                      type="text"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleInputChange}
                      disabled
                      className="form-control bg-light text-muted"
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-muted">
                      <i className="fas fa-user-graduate me-2"></i>Tên học sinh
                    </label>
                    <input
                      type="text"
                      name="studentName"
                      value={formData.studentName}
                      onChange={handleInputChange}
                      disabled
                      className="form-control bg-light text-muted"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold text-info">
                    <i className="fas fa-file-alt me-2"></i>Mô tả
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Mô tả chi tiết sự kiện"
                    className="form-control"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold text-warning">
                    <i className="fas fa-heartbeat me-2"></i>Triệu chứng
                  </label>
                  <textarea
                    name="symptoms"
                    value={formData.symptoms}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Ghi lại các triệu chứng quan sát được"
                    className="form-control"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold text-success">
                    <i className="fas fa-stethoscope me-2"></i>Điều trị
                  </label>
                  <textarea
                    name="treatment"
                    value={formData.treatment}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Biện pháp điều trị đã thực hiện"
                    className="form-control"
                  />
                </div>

                {/* Medication Search Section */}
                <div className="mb-4">
                  <div className="card border-primary">
                    <div className="card-header bg-primary text-white">
                      <h6 className="mb-0 fw-bold">
                        <i className="fas fa-pills me-2"></i>Thuốc sử dụng
                      </h6>
                    </div>
                    <div className="card-body">
                      <div className="position-relative">
                        <div className="input-group">
                          <span className="input-group-text">
                            <i className="fas fa-search"></i>
                          </span>
                          <input
                            type="text"
                            className="form-control"
                            value={medicationSearch}
                            onChange={(e) => handleMedicationSearch(e.target.value)}
                            placeholder="Tìm kiếm thuốc theo tên..."
                          />
                          {searchingMedications && (
                            <span className="input-group-text">
                              <i className="fas fa-spinner fa-spin text-primary"></i>
                            </span>
                          )}
                        </div>
                        
                        {/* Medication Search Results Dropdown */}
                        {showMedicationDropdown && medicationResults.length > 0 && (
                          <div className="list-group position-absolute w-100" style={{top: '100%', zIndex: 1000, maxHeight: '200px', overflowY: 'auto'}}>
                            {medicationResults.map((medication, index) => (
                              <button
                                key={index}
                                type="button"
                                className="list-group-item list-group-item-action"
                                onClick={() => handleMedicationSelect(medication)}
                              >
                                <div className="fw-bold">{medication.itemName}</div>
                                <small className="text-muted">
                                  Tồn kho: {medication.currentStock} {medication.unit || 'viên'}
                                  {medication.currentStock === 0 && (
                                    <span className="badge bg-danger ms-2">Hết hàng</span>
                                  )}
                                  {medication.currentStock > 0 && medication.currentStock <= 5 && (
                                    <span className="badge bg-warning ms-2">Sắp hết</span>
                                  )}
                                  {medication.currentStock > 5 && (
                                    <span className="badge bg-success ms-2">Còn hàng</span>
                                  )}
                                </small>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Selected Medications */}
                      {selectedMedications.length > 0 && (
                        <div className="mt-3">
                          <h6 className="fw-bold text-secondary mb-3">Thuốc đã chọn:</h6>
                          {selectedMedications.map((medication) => (
                            <div key={medication.itemID} className="card mb-2">
                              <div className="card-body py-2">
                                <div className="row align-items-center">
                                  <div className="col-md-4">
                                    <strong>{medication.itemName}</strong>
                                  </div>
                                  <div className="col-md-3">
                                    <div className="input-group input-group-sm">
                                      <span className="input-group-text">Số lượng:</span>
                                      <input
                                        type="number"
                                        className="form-control"
                                        value={medication.quantityUsed}
                                        onChange={(e) => handleMedicationQuantityChange(medication.itemID, e.target.value)}
                                        min="0"
                                        max={medication.currentStock}
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-3">
                                    <small className="text-muted">
                                      Tồn: {medication.currentStock} {medication.unit}
                                      {medication.currentStock === 0 && (
                                        <span className="badge bg-danger ms-1">Hết hàng</span>
                                      )}
                                      {medication.currentStock > 0 && medication.currentStock <= 5 && (
                                        <span className="badge bg-warning ms-1">Sắp hết</span>
                                      )}
                                      {medication.currentStock > 5 && (
                                        <span className="badge bg-success ms-1">Còn hàng</span>
                                      )}
                                    </small>
                                  </div>
                                  <div className="col-md-2">
                                    <button
                                      type="button"
                                      className="btn btn-outline-danger btn-sm"
                                      onClick={() => handleMedicationRemove(medication.itemID)}
                                    >
                                      <i className="fas fa-trash"></i>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <hr />

                {/* Checkboxes */}
                <div className="row mb-3">
                  <div className="col-md-6">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="parentNotified"
                        name="parentNotified"
                        checked={formData.parentNotified}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label fw-bold text-warning" htmlFor="parentNotified">
                        <i className="fas fa-bell me-2"></i>Đã thông báo phụ huynh
                      </label>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="requiresFollowUp"
                        name="requiresFollowUp"
                        checked={formData.requiresFollowUp}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label fw-bold text-info" htmlFor="requiresFollowUp">
                        <i className="fas fa-eye me-2"></i>Cần theo dõi
                      </label>
                    </div>
                  </div>
                </div>

                {/* Follow-up Notes */}
                {formData.requiresFollowUp && (
                  <div className="mb-3">
                    <label className="form-label fw-bold" style={{color: '#6f42c1'}}>
                      <i className="fas fa-sticky-note me-2"></i>Ghi chú theo dõi
                    </label>
                    <textarea
                      name="followUpNotes"
                      value={formData.followUpNotes}
                      onChange={handleInputChange}
                      rows="2"
                      placeholder="Ghi chú chi tiết về việc theo dõi"
                      className="form-control"
                    />
                  </div>
                )}
              </div>

              <div className="modal-footer bg-light">
                <button 
                  type="button" 
                  className="btn btn-secondary btn-lg" 
                  onClick={handleClose}
                >
                  <i className="fas fa-times me-2"></i>
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="btn btn-warning btn-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin me-2"></i> Đang cập nhật...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save me-2"></i> Cập nhật
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default MedicalIncidentUpdateModal;
