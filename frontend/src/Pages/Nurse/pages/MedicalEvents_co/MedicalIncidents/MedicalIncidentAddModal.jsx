import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import inventoryService from '../../../../../services/APINurse/inventoryService';
import { getAllStudents } from '../../../../../services/APINurse/studentRecordsService';
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
    medicationsUsed: [],
    imageMedicalUrl: ''
  });

  // Medication search states
  const [medicationSearch, setMedicationSearch] = useState('');
  const [medicationResults, setMedicationResults] = useState([]);
  const [showMedicationDropdown, setShowMedicationDropdown] = useState(false);
  const [searchingMedications, setSearchingMedications] = useState(false);

  // Student search states
  const [studentSearch, setStudentSearch] = useState('');
  const [allStudents, setAllStudents] = useState([]);
  const [studentSuggestions, setStudentSuggestions] = useState([]);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

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
          medicationsUsed: selectedEvent.medicationsUsed || [],
          imageMedicalUrl: selectedEvent.imageMedicalUrl || ''
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
          medicationsUsed: [],
          imageMedicalUrl: ''
        });
      }

      // Fetch all students for the dropdown
      const fetchStudents = async () => {
        setLoadingStudents(true);
        try {
          const students = await getAllStudents();
          if (Array.isArray(students)) {
            setAllStudents(students);
          }
        } catch (error) {
          console.error("Failed to fetch students:", error);
          toast.error("Không thể tải danh sách học sinh.");
        } finally {
          setLoadingStudents(false);
        }
      };

      fetchStudents();
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

  // Handle student search
  const handleStudentSearch = (searchTerm) => {
    setStudentSearch(searchTerm);
    setFormData(prev => ({ ...prev, studentId: searchTerm }));

    if (searchTerm.length > 0) {
      const suggestions = allStudents.filter(student =>
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.fullName && student.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (student.name && student.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setStudentSuggestions(suggestions);
      setShowStudentDropdown(true);
    } else {
      setStudentSuggestions([]);
      setShowStudentDropdown(false);
    }
  };

  // Handle selecting a student
  const handleSelectStudent = (student) => {
    setFormData(prev => ({ ...prev, studentId: student.studentId }));
    setStudentSearch(`${student.studentId} - ${student.fullName || student.name}`);
    setShowStudentDropdown(false);
    setStudentSuggestions([]);
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
    const quantity = Math.max(0, parseInt(newQuantity) || 0);

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
    
    // Validation
    if (!formData.studentId.trim()) {
      toast.error('Vui lòng nhập mã học sinh');
      return;
    }
    
    if (!formData.incidentType.trim()) {
      toast.error('Vui lòng nhập loại sự kiện');
      return;
    }
    
    if (!formData.description.trim()) {
      toast.error('Vui lòng nhập mô tả sự kiện');
      return;
    }
    
    try {
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
        imageMedicalUrl: formData.imageMedicalUrl, // Direct URL from input
        handledById: 1 // Default handler ID
      };

      console.log('Submitting event data:', apiData);
      const result = await onSubmit(apiData);
      
      if (result) {
        toast.success(selectedEvent ? 'Cập nhật sự kiện y tế thành công!' : 'Thêm sự kiện y tế mới thành công!');
        handleClose();
      } else {
        toast.error('Không thể lưu sự kiện y tế - không có phản hồi từ server');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      
      // More specific error messages
      let errorMessage = selectedEvent ? 'Lỗi khi cập nhật sự kiện y tế' : 'Lỗi khi thêm sự kiện y tế mới';
      
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage += ': ' + error.response.data.message;
      } else if (error.message) {
        errorMessage += ': ' + error.message;
      }
      
      toast.error(errorMessage);
    }
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
                <label htmlFor="studentId">Mã học sinh <span className="required">*</span></label>
                <input
                  type="text"
                  id="studentId"
                  name="studentId"
                  value={studentSearch}
                  onChange={(e) => handleStudentSearch(e.target.value)}
                  placeholder="Nhập mã hoặc tên học sinh"
                  autoComplete="off"
                  onFocus={() => setShowStudentDropdown(studentSuggestions.length > 0)}
                  onBlur={() => setTimeout(() => setShowStudentDropdown(false), 200)}
                />
                {showStudentDropdown && (
                  <ul className="suggestions-list student-suggestions">
                    {loadingStudents ? (
                      <li>Đang tải...</li>
                    ) : studentSuggestions.length > 0 ? (
                      studentSuggestions.map(student => (
                        <li key={student.id} onMouseDown={() => handleSelectStudent(student)}>
                          {student.studentId} - {student.fullName || student.name}
                        </li>
                      ))
                    ) : (
                      <li>Không tìm thấy học sinh</li>
                    )}
                  </ul>
                )}
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
                                min="0"
                                value={medication.quantityUsed}
                                onChange={(e) => handleMedicationQuantityChange(index, e.target.value)}
                                className={`quantity-input ${isOverStock ? 'error' : ''}`}
                              />
                            </div>
                            <span className="stock-info">
                              Tồn kho: {medication.stockQuantity || 0}
                              {medication.stockQuantity === 0 && (
                                <span className="badge bg-danger ms-1">Hết hàng</span>
                              )}
                              {medication.stockQuantity > 0 && medication.stockQuantity <= 5 && (
                                <span className="badge bg-warning ms-1">Sắp hết</span>
                              )}
                              {medication.stockQuantity > 5 && (
                                <span className="badge bg-success ms-1">Còn hàng</span>
                              )}
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

            {/* Image URL Section */}
            <div className="form-group">
              <label>Link ảnh sự cố y tế</label>
              <input
                type="url"
                name="imageMedicalUrl"
                value={formData.imageMedicalUrl}
                onChange={handleInputChange}
                placeholder="Nhập link ảnh sự cố y tế (http://... hoặc https://...)"
                className="form-control"
              />
              {formData.imageMedicalUrl && (
                <div className="image-preview-container mt-3">
                  <div className="text-center">
                    <img 
                      src={formData.imageMedicalUrl} 
                      alt="Preview ảnh sự cố" 
                      className="img-thumbnail"
                      style={{ 
                        maxWidth: '300px', 
                        maxHeight: '300px',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                      onLoad={(e) => {
                        e.target.style.display = 'block';
                        e.target.nextSibling.style.display = 'none';
                      }}
                    />
                    <div className="alert alert-warning mt-2" style={{ display: 'none' }}>
                      <i className="fas fa-exclamation-triangle"></i>
                      <br />Không thể tải ảnh từ link này
                      <br /><small>Vui lòng kiểm tra lại link ảnh</small>
                    </div>
                  </div>
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
