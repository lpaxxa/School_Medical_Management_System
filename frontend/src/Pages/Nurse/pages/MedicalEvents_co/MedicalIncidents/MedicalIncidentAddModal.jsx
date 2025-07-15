import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { Modal, Form, Button, Container, Row, Col, Card, Alert, Badge, Spinner } from 'react-bootstrap';
import inventoryService from '../../../../../services/APINurse/inventoryService';
import { getAllStudents } from '../../../../../services/APINurse/studentRecordsService';

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
          Swal.fire('Lỗi!', 'Không thể tải danh sách học sinh.', 'error');
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
      Swal.fire('Lỗi!', 'Vui lòng nhập mã học sinh', 'error');
      return;
    }
    
    if (!formData.incidentType.trim()) {
      Swal.fire('Lỗi!', 'Vui lòng nhập loại sự kiện', 'error');
      return;
    }
    
    if (!formData.description.trim()) {
      Swal.fire('Lỗi!', 'Vui lòng nhập mô tả sự kiện', 'error');
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
        Swal.fire('Thành công!', 'Thêm sự kiện y tế mới thành công!', 'success');
        handleClose();
      } else {
        Swal.fire('Lỗi!', 'Không thể lưu sự kiện y tế - không có phản hồi từ server', 'error');
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
      
      Swal.fire('Lỗi!', errorMessage, 'error');
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
    <>
      <style>
        {`
          .lukhang-medical-incident-modal-wrapper {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            min-height: 100vh !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            z-index: 1055 !important;
          }

          /* Fix dropdown arrow display issues */
          .lukhang-medical-incident-modal-wrapper .form-select,
          .lukhang-medical-incident-modal-wrapper select.form-control,
          .lukhang-medical-incident-modal-wrapper .medical-severity-select {
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m1 6 7 7 7-7'/%3e%3c/svg%3e") !important;
            background-repeat: no-repeat !important;
            background-position: right 0.75rem center !important;
            background-size: 16px 12px !important;
            appearance: none !important;
            -webkit-appearance: none !important;
            -moz-appearance: none !important;
          }

          /* Remove multiple arrows from dropdown */
          .lukhang-medical-incident-modal-wrapper select::-ms-expand {
            display: none !important;
          }

          .lukhang-medical-incident-modal-wrapper .form-select::after,
          .lukhang-medical-incident-modal-wrapper .medical-severity-select::after {
            display: none !important;
          }

          /* Ensure only one arrow per dropdown */
          .lukhang-medical-incident-modal-wrapper .dropdown-toggle::after {
            display: none !important;
          }
          
          .lukhang-medical-incident-modal-wrapper .modal-dialog {
            margin: 2rem auto !important;
            width: 90vw !important;
            max-width: 1200px !important;
            display: flex !important;
            align-items: center !important;
            min-height: auto !important;
            position: relative !important;
          }
          
          .lukhang-medical-modal-content-custom {
            border-radius: 1rem !important;
            overflow: hidden !important;
            box-shadow: 0 20px 60px rgba(0, 123, 255, 0.2) !important;
            border: none !important;
            width: 100% !important;
            max-height: 90vh !important;
            display: flex !important;
            flex-direction: column !important;
            background: white !important;
            position: relative !important;
          }
          
          .lukhang-medical-header-custom {
            background: linear-gradient(135deg, #007bff 0%, #0056b3 100%) !important;
            color: white !important;
            border: none !important;
            border-radius: 1rem 1rem 0 0 !important;
            padding: 1.5rem 2rem !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            flex-shrink: 0 !important;
            min-height: 80px !important;
          }
          
          .lukhang-medical-title-custom {
            color: white !important;
            font-weight: 600 !important;
            font-size: 1.4rem !important;
            margin: 0 !important;
            flex: 1 !important;
            display: flex !important;
            align-items: center !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
          }
          
          .lukhang-medical-title-custom i {
            color: white !important;
            margin-right: 0.75rem !important;
            font-size: 1.2rem !important;
          }
          
          .lukhang-medical-close-button-custom {
            background: rgba(255,255,255,0.15) !important;
            border: 2px solid rgba(255,255,255,0.4) !important;
            color: white !important;
            border-radius: 50% !important;
            width: 48px !important;
            height: 48px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            transition: all 0.3s ease !important;
            flex-shrink: 0 !important;
            margin-left: 1.5rem !important;
            font-size: 1.1rem !important;
            text-decoration: none !important;
            outline: none !important;
            box-shadow: none !important;
          }
          
          .lukhang-medical-close-button-custom:hover {
            background: rgba(255,255,255,0.3) !important;
            border-color: rgba(255,255,255,0.6) !important;
            color: white !important;
            transform: rotate(90deg) scale(1.15) !important;
            text-decoration: none !important;
          }
          
          .lukhang-medical-close-button-custom:focus {
            box-shadow: 0 0 0 4px rgba(255,255,255,0.3) !important;
            color: white !important;
            outline: none !important;
            text-decoration: none !important;
          }
          
          .lukhang-medical-close-button-custom:active {
            color: white !important;
            text-decoration: none !important;
          }
          
          .lukhang-medical-body-custom {
            flex: 1 !important;
            overflow-y: auto !important;
            max-height: calc(90vh - 240px) !important;
            padding: 2rem !important;
            min-height: 300px !important;
          }
          
          .lukhang-medical-footer-custom {
            flex-shrink: 0 !important;
            padding: 2.5rem 2rem !important;
            background: #f8f9fa !important;
            border-top: 1px solid #e9ecef !important;
            min-height: 120px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 1.5rem !important;
            position: relative !important;
            z-index: 10 !important;
            margin-top: auto !important;
          }
          
          @media (max-width: 992px) {
            .lukhang-medical-incident-modal-wrapper .modal-dialog {
              width: 95vw !important;
              margin: 1rem auto !important;
            }
            
            .lukhang-medical-header-custom {
              padding: 1.25rem 1.5rem !important;
              min-height: 70px !important;
            }
            
            .lukhang-medical-title-custom {
              font-size: 1.2rem !important;
            }
            
            .lukhang-medical-close-button-custom {
              width: 42px !important;
              height: 42px !important;
              margin-left: 1rem !important;
            }
            
            .lukhang-medical-body-custom {
              padding: 1.5rem !important;
              max-height: calc(90vh - 220px) !important;
            }
            
            .lukhang-medical-footer-custom {
              padding: 2rem 1.5rem !important;
              min-height: 110px !important;
            }
          }
          
          @media (max-width: 768px) {
            .lukhang-medical-incident-modal-wrapper .modal-dialog {
              width: 98vw !important;
              margin: 0.5rem auto !important;
            }
            
            .lukhang-medical-header-custom {
              padding: 1rem 1.25rem !important;
              min-height: 65px !important;
            }
            
            .lukhang-medical-title-custom {
              font-size: 1.1rem !important;
            }
            
            .lukhang-medical-close-button-custom {
              width: 38px !important;
              height: 38px !important;
              margin-left: 0.75rem !important;
              font-size: 1rem !important;
            }
            
            .lukhang-medical-body-custom {
              padding: 1.25rem !important;
              max-height: calc(90vh - 200px) !important;
            }
            
            .lukhang-medical-footer-custom {
              padding: 1.75rem 1.25rem !important;
              min-height: 100px !important;
            }
          }

          /* Additional styling for dropdown elements */
          .lukhang-medical-incident-modal-wrapper .medical-severity-select:focus {
            border-color: #0d6efd !important;
            box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25) !important;
          }

          .lukhang-medical-incident-modal-wrapper .medical-student-input:focus,
          .lukhang-medical-incident-modal-wrapper .medical-medication-search:focus {
            border-color: #0d6efd !important;
            box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25) !important;
          }

          /* Dropdown menu styling */
          .lukhang-medical-incident-modal-wrapper .dropdown-menu {
            border: 1px solid #0d6efd !important;
            border-radius: 0.375rem !important;
            box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
          }

          .lukhang-medical-incident-modal-wrapper .dropdown-item:hover {
            background-color: #f8f9fa !important;
            color: #0d6efd !important;
          }
        `}
      </style>
      <Modal 
        show={show} 
        onHide={handleClose}
        size="xl"
        centered
        backdrop="static"
        className="lukhang-medical-incident-modal-wrapper"
        dialogClassName="lukhang-modal-dialog-custom"
        contentClassName="lukhang-medical-modal-content-custom"
        style={{
          '--bs-modal-zindex': '1055'
        }}
      >
      <Modal.Header 
        closeButton={false}
        className="border-0 lukhang-medical-header-custom"
      >
        <Modal.Title 
          className="lukhang-medical-title-custom"
        >
          <i className={`fas ${selectedEvent ? 'fa-edit' : 'fa-plus'}`}></i>
          {selectedEvent ? 'Chỉnh sửa sự kiện y tế' : 'Thêm sự kiện y tế mới'}
        </Modal.Title>
        <Button
          variant="link"
          className="lukhang-medical-close-button-custom"
          onClick={handleClose}
          title="Đóng modal"
        >
          <i className="fas fa-times"></i>
        </Button>
      </Modal.Header>
        
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="lukhang-medical-body-custom">
            <Container fluid>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      Mã học sinh <span className="text-danger">*</span>
                    </Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type="text"
                        value={studentSearch}
                        onChange={(e) => handleStudentSearch(e.target.value)}
                        placeholder="Nhập mã hoặc tên học sinh"
                        autoComplete="off"
                        onFocus={() => setShowStudentDropdown(studentSuggestions.length > 0)}
                        onBlur={() => setTimeout(() => setShowStudentDropdown(false), 200)}
                        className="medical-student-input"
                      />
                      {showStudentDropdown && (
                        <div 
                          className="position-absolute w-100 bg-white border border-info rounded shadow-sm"
                          style={{ top: '100%', zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}
                        >
                          {loadingStudents ? (
                            <div className="p-2 text-center">
                              <Spinner size="sm" className="me-2" />
                              Đang tải...
                            </div>
                          ) : studentSuggestions.length > 0 ? (
                            studentSuggestions.map(student => (
                              <div 
                                key={student.id} 
                                className="p-2 border-bottom cursor-pointer hover-bg-light"
                                onMouseDown={() => handleSelectStudent(student)}
                                style={{ cursor: 'pointer' }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                              >
                                <strong>{student.studentId}</strong> - {student.fullName || student.name}
                              </div>
                            ))
                          ) : (
                            <div className="p-2 text-muted text-center">Không tìm thấy học sinh</div>
                          )}
                        </div>
                      )}
                    </div>
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      Loại sự kiện <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="incidentType"
                      value={formData.incidentType}
                      onChange={handleInputChange}
                      required
                      placeholder="Nhập loại sự kiện"
                      className="medical-incident-input"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      Ngày giờ <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="datetime-local"
                      name="dateTime"
                      value={formData.dateTime}
                      onChange={handleInputChange}
                      required
                      className="medical-datetime-input"
                    />
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      Mức độ nghiêm trọng <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      name="severityLevel"
                      value={formData.severityLevel}
                      onChange={handleInputChange}
                      required
                      className="medical-severity-select"
                    >
                      <option value="">Chọn mức độ</option>
                      <option value="Nhẹ">Nhẹ</option>
                      <option value="Trung bình">Trung bình</option>
                      <option value="Nghiêm trọng">Nghiêm trọng</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Mô tả</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Mô tả chi tiết sự kiện"
                      className="medical-description-textarea"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Triệu chứng</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="symptoms"
                      value={formData.symptoms}
                      onChange={handleInputChange}
                      placeholder="Ghi lại các triệu chứng quan sát được"
                      className="medical-symptoms-textarea"
                    />
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Điều trị</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="treatment"
                      value={formData.treatment}
                      onChange={handleInputChange}
                      placeholder="Biện pháp điều trị đã thực hiện"
                      className="medical-treatment-textarea"
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Medication Search Section */}
              <Row className="mb-3">
                <Col>
                  <Card className="border-info medical-medication-card">
                    <Card.Header className="bg-info text-white">
                      <h6 className="mb-0">
                        <i className="fas fa-pills me-2"></i>
                        Thuốc sử dụng
                      </h6>
                    </Card.Header>
                    <Card.Body>
                      <div className="position-relative mb-3">
                        <Form.Control
                          type="text"
                          value={medicationSearch}
                          onChange={(e) => handleMedicationSearch(e.target.value)}
                          placeholder="Tìm kiếm thuốc theo tên..."
                          className="medical-medication-search"
                        />
                        {searchingMedications && (
                          <div className="position-absolute top-50 end-0 translate-middle-y me-3">
                            <Spinner size="sm" />
                          </div>
                        )}
                        
                        {/* Medication Search Results Dropdown */}
                        {showMedicationDropdown && medicationResults.length > 0 && (
                          <div 
                            className="position-absolute w-100 bg-white border border-info rounded shadow-sm mt-1"
                            style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}
                          >
                            {medicationResults.map((medication, index) => (
                              <div
                                key={medication.id || index}
                                className="p-3 border-bottom cursor-pointer medical-medication-option"
                                onClick={() => handleSelectMedication(medication)}
                                style={{ cursor: 'pointer' }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                              >
                                <div className="fw-semibold text-primary">
                                  {medication.itemName || medication.name}
                                </div>
                                <small className="text-muted">
                                  Tồn kho: {medication.stockQuantity || medication.quantity || 0} {medication.unit || 'đơn vị'}
                                </small>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {showMedicationDropdown && medicationResults.length === 0 && !searchingMedications && (
                          <div 
                            className="position-absolute w-100 bg-white border border-warning rounded shadow-sm mt-1"
                            style={{ zIndex: 1000 }}
                          >
                            <div className="p-3 text-center text-muted">Không tìm thấy thuốc phù hợp</div>
                          </div>
                        )}
                      </div>

                      {/* Selected Medications List */}
                      {formData.medicationsUsed.length > 0 && (
                        <div className="medical-selected-medications">
                          <h6 className="text-success mb-3">
                            <i className="fas fa-check-circle me-2"></i>
                            Thuốc đã chọn:
                          </h6>
                          {formData.medicationsUsed.map((medication, index) => {
                            const isOverStock = medication.quantityUsed > (medication.stockQuantity || 0);
                            return (
                              <Card 
                                key={index} 
                                className={`mb-2 medical-medication-item ${isOverStock ? 'border-danger' : 'border-success'}`}
                              >
                                <Card.Body className="p-3">
                                  <Row className="align-items-center">
                                    <Col md={6}>
                                      <h6 className="text-primary mb-1">{medication.name}</h6>
                                      <div className="d-flex align-items-center gap-2">
                                        <Form.Label className="small mb-0">Số lượng:</Form.Label>
                                        <Form.Control
                                          type="number"
                                          min="0"
                                          value={medication.quantityUsed}
                                          onChange={(e) => handleMedicationQuantityChange(index, e.target.value)}
                                          className={`medical-quantity-input ${isOverStock ? 'border-danger' : ''}`}
                                          style={{ width: '80px' }}
                                        />
                                      </div>
                                    </Col>
                                    <Col md={5}>
                                      <div className="small text-muted mb-1">
                                        Tồn kho: <strong>{medication.stockQuantity || 0}</strong>
                                      </div>
                                      <div>
                                        {medication.stockQuantity === 0 && (
                                          <Badge bg="danger" className="me-1">Hết hàng</Badge>
                                        )}
                                        {medication.stockQuantity > 0 && medication.stockQuantity <= 5 && (
                                          <Badge bg="warning" className="me-1">Sắp hết</Badge>
                                        )}
                                        {medication.stockQuantity > 5 && (
                                          <Badge bg="success" className="me-1">Còn hàng</Badge>
                                        )}
                                      </div>
                                      {isOverStock && (
                                        <Alert variant="danger" className="p-2 mt-2 mb-0">
                                          <small>
                                            <i className="fas fa-exclamation-triangle me-1"></i>
                                            Số lượng vượt quá tồn kho!
                                          </small>
                                        </Alert>
                                      )}
                                    </Col>
                                    <Col md={1}>
                                      <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => handleRemoveMedication(index)}
                                        title="Xóa thuốc"
                                        className="medical-remove-btn"
                                      >
                                        <i className="fas fa-times"></i>
                                      </Button>
                                    </Col>
                                  </Row>
                                </Card.Body>
                              </Card>
                            );
                          })}
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Image URL Section */}
              <Row className="mb-4">
                <Col>
                  <Card className="border-secondary medical-image-card">
                    <Card.Header className="bg-secondary text-white">
                      <h6 className="mb-0">
                        <i className="fas fa-image me-2"></i>
                        Hình ảnh sự cố y tế
                      </h6>
                    </Card.Header>
                    <Card.Body>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Link ảnh sự cố y tế</Form.Label>
                        <Form.Control
                          type="url"
                          name="imageMedicalUrl"
                          value={formData.imageMedicalUrl}
                          onChange={handleInputChange}
                          placeholder="Nhập link ảnh sự cố y tế (http://... hoặc https://...)"
                          className="medical-image-input"
                        />
                      </Form.Group>
                      
                      {formData.imageMedicalUrl && (
                        <div className="medical-image-preview">
                          <h6 className="text-info fw-bold mb-3 text-center">
                            <i className="fas fa-eye me-2"></i>Preview ảnh sự cố
                          </h6>
                          <div className="d-flex justify-content-center align-items-center">
                            <div className="position-relative">
                              <img 
                                src={formData.imageMedicalUrl} 
                                alt="Preview ảnh sự cố" 
                                className="img-fluid rounded shadow-lg border border-2 border-info"
                                style={{ 
                                  maxWidth: '100%',
                                  maxHeight: '400px',
                                  width: 'auto',
                                  height: 'auto',
                                  objectFit: 'contain',
                                  display: 'block',
                                  margin: '0 auto'
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
                              <Alert variant="warning" className="text-center mx-auto" style={{ display: 'none', maxWidth: '350px' }}>
                                <i className="fas fa-exclamation-triangle fs-2 text-warning mb-2"></i>
                                <h6>Không thể tải ảnh từ link này</h6>
                                <small className="text-muted">Vui lòng kiểm tra lại link ảnh</small>
                              </Alert>
                            </div>
                          </div>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Check
                      type="checkbox"
                      name="parentNotified"
                      checked={formData.parentNotified}
                      onChange={handleInputChange}
                      label="Đã thông báo phụ huynh"
                      className="medical-checkbox fw-semibold"
                    />
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group>
                    <Form.Check
                      type="checkbox"
                      name="requiresFollowUp"
                      checked={formData.requiresFollowUp}
                      onChange={handleInputChange}
                      label="Cần theo dõi tiếp"
                      className="medical-checkbox fw-semibold"
                    />
                  </Form.Group>
                </Col>
              </Row>

              {formData.requiresFollowUp && (
                <Row className="mb-3">
                  <Col>
                    <Form.Group>
                      <Form.Label className="fw-semibold">Ghi chú theo dõi</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="followUpNotes"
                        value={formData.followUpNotes}
                        onChange={handleInputChange}
                        placeholder="Ghi chú cho việc theo dõi tiếp"
                        className="medical-followup-textarea"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              )}
            </Container>
          </Modal.Body>
          
          <Modal.Footer className="lukhang-medical-footer-custom">
            <div className="d-flex justify-content-center align-items-center gap-3 w-100">
              <Button 
                variant="outline-secondary"
                size="lg"
                onClick={handleClose}
                className="px-4 py-3 d-flex align-items-center shadow-sm medical-cancel-btn"
                style={{
                  borderRadius: '25px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  border: '2px solid #6c757d',
                  minWidth: '130px',
                  height: '55px',
                  fontSize: '1.1rem'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#6c757d';
                  e.target.style.color = 'white';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(108, 117, 125, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '';
                  e.target.style.color = '';
                  e.target.style.transform = '';
                  e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
              >
                <i className="fas fa-times me-2"></i> 
                Hủy
              </Button>
              <Button 
                variant="primary"
                size="lg"
                type="submit"
                disabled={loading}
                className="px-4 py-3 d-flex align-items-center shadow-sm medical-submit-btn"
                style={{
                  borderRadius: '25px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  border: '2px solid #0d6efd',
                  minWidth: '150px',
                  height: '55px',
                  fontSize: '1.1rem',
                  background: loading ? '#6c757d' : 'linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%)'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(13, 110, 253, 0.4)';
                    e.target.style.background = 'linear-gradient(135deg, #0b5ed7 0%, #0a58ca 100%)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.transform = '';
                    e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                    e.target.style.background = 'linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%)';
                  }
                }}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" className="me-2" /> 
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <i className={`fas ${selectedEvent ? 'fa-edit' : 'fa-plus'} me-2`}></i> 
                    {selectedEvent ? 'Cập nhật' : 'Thêm mới'}
                  </>
                )}
              </Button>
            </div>
          </Modal.Footer>
        </Form>
    </Modal>
    </>
  );
};

export default MedicalIncidentAddModal;
