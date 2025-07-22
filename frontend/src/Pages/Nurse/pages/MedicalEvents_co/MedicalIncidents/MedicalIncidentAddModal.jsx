import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { Modal, Form, Button, Container, Row, Col, Card, Alert, Badge, Spinner } from 'react-bootstrap';
import inventoryService from '../../../../../services/APINurse/inventoryService';
import { getAllStudents } from '../../../../../services/APINurse/studentRecordsService';
import './MedicalIncidents.css';

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

  // Image upload states - following AddHealthArticle pattern
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageUploadError, setImageUploadError] = useState('');

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

  // State cho validation học sinh
  const [studentValidation, setStudentValidation] = useState({
    isValidating: false,
    isValid: null,
    validatedStudent: null,
    error: null
  });

  // Cache danh sách học sinh để tránh gọi API nhiều lần
  const [studentsCache, setStudentsCache] = useState(null);
  const [cacheTimestamp, setCacheTimestamp] = useState(null);

  // Utility function to handle different date formats
  const formatDateForInput = (dateInput) => {
    if (!dateInput) return '';

    let date;

    // Handle array format from backend [year, month, day]
    if (Array.isArray(dateInput)) {
      if (dateInput.length >= 3) {
        // Month is 0-indexed in JavaScript Date constructor
        date = new Date(dateInput[0], dateInput[1] - 1, dateInput[2]);
      } else {
        return '';
      }
    }
    // Handle string format
    else if (typeof dateInput === 'string') {
      date = new Date(dateInput);
    }
    // Handle Date object
    else if (dateInput instanceof Date) {
      date = dateInput;
    }
    else {
      return '';
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return '';
    }

    return date.toISOString().slice(0, 16);
  };

  // Initialize form data when modal opens or selectedEvent changes
  useEffect(() => {
    if (show) {
      if (selectedEvent) {
        // Edit mode - populate form with existing data
        setFormData({
          studentId: selectedEvent.studentId || '',
          incidentType: selectedEvent.incidentType || '',
          dateTime: formatDateForInput(selectedEvent.dateTime) || '',
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

        // Reset image upload states for edit mode
        setImageFile(null);
        setImagePreview('');
        setImageUploadError('');
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

        // Reset image upload states for add mode
        setImageFile(null);
        setImagePreview('');
        setImageUploadError('');
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

    // Validate student ID when it changes
    if (name === 'studentId') {
      // Clear previous search when manually typing
      setStudentSearch('');
      setShowStudentDropdown(false);

      // Debounce validation to avoid too many API calls
      if (value.trim()) {
        setTimeout(() => {
          validateStudentId(value);
        }, 500);
      } else {
        setStudentValidation({
          isValidating: false,
          isValid: null,
          validatedStudent: null,
          error: null
        });
      }
    }
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

  // Get students list with caching
  const getStudentsList = async () => {
    const now = Date.now();
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

    // Use cache if available and not expired
    if (studentsCache && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION)) {
      console.log('Using cached students data');
      return studentsCache;
    }

    try {
      console.log('Fetching fresh students data');
      const studentsData = await getAllStudents();

      // Handle different response formats
      let studentsList = [];
      if (Array.isArray(studentsData)) {
        studentsList = studentsData;
      } else if (studentsData && studentsData.content && Array.isArray(studentsData.content)) {
        studentsList = studentsData.content;
      } else if (studentsData && studentsData.data && Array.isArray(studentsData.data)) {
        studentsList = studentsData.data;
      }

      // Update cache
      setStudentsCache(studentsList);
      setCacheTimestamp(now);

      return studentsList;
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  };

  // Validate student ID exists in database using getAllStudents
  const validateStudentId = async (studentId) => {
    if (!studentId || !studentId.trim()) {
      setStudentValidation({
        isValidating: false,
        isValid: null,
        validatedStudent: null,
        error: null
      });
      return;
    }

    setStudentValidation(prev => ({ ...prev, isValidating: true, error: null }));

    try {
      console.log('Validating student ID:', studentId);

      // Get students list (with caching)
      const studentsList = await getStudentsList();
      console.log('Students list for validation:', studentsList);

      // Find student by studentId (string comparison)
      const foundStudent = studentsList.find(student => {
        const studentIdToCheck = student.studentId || student.id;
        return studentIdToCheck && studentIdToCheck.toString().trim().toLowerCase() === studentId.trim().toLowerCase();
      });

      if (foundStudent) {
        console.log('Student found:', foundStudent);
        setStudentValidation({
          isValidating: false,
          isValid: true,
          validatedStudent: foundStudent,
          error: null
        });

        // Auto-fill student name if found
        const studentName = foundStudent.fullName || foundStudent.name || 'Không có tên';
        setStudentSearch(`${foundStudent.studentId || foundStudent.id} - ${studentName}`);
      } else {
        console.log('Student not found with ID:', studentId);
        setStudentValidation({
          isValidating: false,
          isValid: false,
          validatedStudent: null,
          error: `Không tìm thấy học sinh với mã "${studentId}"`
        });
      }
    } catch (error) {
      console.error('Error validating student:', error);
      setStudentValidation({
        isValidating: false,
        isValid: false,
        validatedStudent: null,
        error: 'Không thể kết nối đến hệ thống để xác thực học sinh'
      });
    }
  };

  // Handle selecting a student
  const handleSelectStudent = (student) => {
    setFormData(prev => ({ ...prev, studentId: student.studentId }));
    setStudentSearch(`${student.studentId} - ${student.fullName || student.name}`);
    setShowStudentDropdown(false);
    setStudentSuggestions([]);

    // Set validation state for selected student
    setStudentValidation({
      isValidating: false,
      isValid: true,
      validatedStudent: student,
      error: null
    });
  };

  // Helper function để kiểm tra ngày hết hạn
  const isItemExpired = (item) => {
    if (!item.expiryDate) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let expiryDate;

    // Handle array format from backend
    if (Array.isArray(item.expiryDate)) {
      const [year, month, day] = item.expiryDate;
      expiryDate = new Date(year, month - 1, day);
    } else {
      expiryDate = new Date(item.expiryDate);
    }

    expiryDate.setHours(0, 0, 0, 0);
    return expiryDate < today;
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
      let filteredResults = [];

      if (results && Array.isArray(results)) {
        // Lọc bỏ thuốc hết hạn
        filteredResults = results.filter(item => !isItemExpired(item));
      } else if (results) {
        // If single result, check if not expired
        if (!isItemExpired(results)) {
          filteredResults = [results];
        }
      }

      setMedicationResults(filteredResults);
      setShowMedicationDropdown(filteredResults.length > 0);
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

  // Handle image file selection - following AddHealthArticle pattern
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setImageUploadError('Chỉ chấp nhận file ảnh định dạng JPG, PNG hoặc GIF');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setImageUploadError('Kích thước file không được vượt quá 5MB');
      return;
    }

    setImageUploadError('');
    setImageFile(file);

    // Create preview URL using URL.createObjectURL like AddHealthArticle
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  // Process image when submitting form - convert to base64
  const processImageForSubmit = async () => {
    if (!imageFile) return '';

    try {
      // Convert image to base64
      const base64Image = await convertImageToBase64(imageFile);
      return base64Image;
    } catch (error) {
      console.error('Error processing image:', error);
      throw new Error('Không thể xử lý ảnh. Vui lòng thử lại.');
    }
  };

  // Convert image to base64
  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  // Handle removing uploaded image
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData(prev => ({
      ...prev,
      imageMedicalUrl: ''
    }));
    setImageUploadError('');
    // Reset file input
    const fileInput = document.getElementById('medical-image-upload');
    if (fileInput) fileInput.value = '';
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.studentId.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: 'Vui lòng nhập mã học sinh',
        confirmButtonText: 'OK'
      });
      return;
    }

    // Check if student validation is in progress
    if (studentValidation.isValidating) {
      Swal.fire({
        icon: 'info',
        title: 'Đang xác thực...',
        text: 'Vui lòng đợi hệ thống xác thực mã học sinh',
        confirmButtonText: 'OK'
      });
      return;
    }

    // Check if student ID is valid
    if (studentValidation.isValid === false) {
      Swal.fire({
        icon: 'error',
        title: 'Mã học sinh không hợp lệ!',
        text: studentValidation.error || 'Không tìm thấy học sinh với mã này trong hệ thống',
        confirmButtonText: 'OK'
      });
      return;
    }

    // If student ID hasn't been validated yet, validate it now
    if (studentValidation.isValid === null) {
      try {
        // Validate student ID synchronously before proceeding
        const studentsList = await getStudentsList();

        const foundStudent = studentsList.find(student => {
          const studentIdToCheck = student.studentId || student.id;
          return studentIdToCheck && studentIdToCheck.toString().trim().toLowerCase() === formData.studentId.trim().toLowerCase();
        });

        if (!foundStudent) {
          Swal.fire({
            icon: 'error',
            title: 'Mã học sinh không hợp lệ!',
            text: `Không tìm thấy học sinh với mã "${formData.studentId}" trong hệ thống`,
            confirmButtonText: 'OK'
          });
          return;
        }

        // Update validation state for successful validation
        setStudentValidation({
          isValidating: false,
          isValid: true,
          validatedStudent: foundStudent,
          error: null
        });

      } catch (error) {
        console.error('Error validating student during submit:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi xác thực!',
          text: 'Không thể kết nối đến hệ thống để xác thực học sinh. Vui lòng thử lại.',
          confirmButtonText: 'OK'
        });
        return;
      }
    }

    if (!formData.incidentType.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: 'Vui lòng nhập loại sự kiện',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (!formData.description.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: 'Vui lòng nhập mô tả sự kiện',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    try {
      // Process image if selected
      let imageUrl = formData.imageMedicalUrl; // Use manual URL if provided
      if (imageFile && !imageUrl) {
        // Convert image to base64 if file is selected but no manual URL
        imageUrl = await processImageForSubmit();
      }

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
        imageMedicalUrl: imageUrl, // Use processed image URL
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

    // Reset student search and validation
    setStudentSearch('');
    setStudentSuggestions([]);
    setShowStudentDropdown(false);
    setStudentValidation({
      isValidating: false,
      isValid: null,
      validatedStudent: null,
      error: null
    });

    // Reset image upload states
    setImageFile(null);
    setImagePreview('');
    setImageUploadError('');
    // Reset file input
    const fileInput = document.getElementById('medical-image-upload');
    if (fileInput) fileInput.value = '';
    onClose();
  };

  if (!show) return null;

  return (
    <>

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

                    {/* Direct Student ID Input */}
                    <div className="mb-2">
                      <div className="input-group">
                        <Form.Control
                          type="text"
                          name="studentId"
                          value={formData.studentId}
                          onChange={handleInputChange}
                          placeholder="Nhập mã học sinh (bắt buộc)"
                          required
                          className={`medical-student-input ${
                            studentValidation.isValid === true ? 'is-valid' :
                            studentValidation.isValid === false ? 'is-invalid' : ''
                          }`}
                        />
                        <span className="input-group-text">
                          {studentValidation.isValidating ? (
                            <Spinner size="sm" />
                          ) : studentValidation.isValid === true ? (
                            <i className="fas fa-check text-success"></i>
                          ) : studentValidation.isValid === false ? (
                            <i className="fas fa-times text-danger"></i>
                          ) : (
                            <i className="fas fa-user text-muted"></i>
                          )}
                        </span>
                      </div>

                      {/* Validation Messages */}
                      {studentValidation.isValid === true && studentValidation.validatedStudent && (
                        <div className="text-success small mt-1">
                          <i className="fas fa-check-circle me-1"></i>
                          Học sinh: {studentValidation.validatedStudent.fullName || studentValidation.validatedStudent.name}
                        </div>
                      )}
                      {studentValidation.isValid === false && (
                        <div className="text-danger small mt-1">
                          <i className="fas fa-exclamation-circle me-1"></i>
                          {studentValidation.error}
                        </div>
                      )}
                      {studentValidation.isValidating && (
                        <div className="text-info small mt-1">
                          <i className="fas fa-spinner fa-spin me-1"></i>
                          Đang xác thực mã học sinh...
                        </div>
                      )}
                    </div>

                    {/* Student Search Dropdown */}
                    <div className="position-relative">
                      <Form.Control
                        type="text"
                        value={studentSearch}
                        onChange={(e) => handleStudentSearch(e.target.value)}
                        placeholder="Hoặc tìm kiếm theo tên học sinh"
                        autoComplete="off"
                        onFocus={() => setShowStudentDropdown(studentSuggestions.length > 0)}
                        onBlur={() => setTimeout(() => setShowStudentDropdown(false), 200)}
                        className="medical-student-search"
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
                      <h6 className="mb-0" style={{color: 'white'}}>
                        <i className="fas fa-pills me-2" style={{color: 'white'}}></i>
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

              {/* Image Upload Section */}
              <Row className="mb-4">
                <Col>
                  <Card className="border-secondary medical-image-card">
                    <Card.Header className="bg-secondary text-white">
                      <h6 className="mb-0" style={{color: 'white'}}>
                        <i className="fas fa-image me-2"></i>
                        Hình ảnh sự cố y tế
                      </h6>
                    </Card.Header>
                    <Card.Body>
                      {/* Upload from computer section - following AddHealthArticle pattern */}
                      <div className="mb-4">
                        <Form.Label className="fw-semibold">
                          <i className="fas fa-upload me-2 text-primary"></i>
                          Tải ảnh từ máy tính
                        </Form.Label>
                        <Form.Control
                          id="medical-image-upload"
                          type="file"
                          name="image"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                        <Form.Text className="text-muted">
                          Chọn một ảnh để làm ảnh minh họa cho sự cố y tế (tùy chọn).
                        </Form.Text>

                        {/* Image preview - following AddHealthArticle pattern */}
                        {imagePreview && (
                          <div className="mt-3">
                            <Form.Label className="small text-muted">Xem trước:</Form.Label>
                            <div className="position-relative d-inline-block">
                              <img
                                src={imagePreview}
                                alt="Xem trước"
                                className="img-fluid rounded shadow-sm"
                                style={{ maxHeight: '200px', maxWidth: '100%', objectFit: 'cover' }}
                                onError={(e) => {
                                  console.error('Image preview failed to load:', imagePreview);
                                  e.target.style.display = 'none';
                                }}
                              />
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={handleRemoveImage}
                                className="position-absolute top-0 end-0 m-1"
                                title="Xóa ảnh"
                              >
                                <i className="fas fa-times"></i>
                              </Button>
                            </div>
                          </div>
                        )}

                        {imageFile && (
                          <div className="mt-2">
                            <small className="text-muted">
                              <i className="fas fa-file-image me-1"></i>
                              Đã chọn: {imageFile.name} ({(imageFile.size / 1024 / 1024).toFixed(2)} MB)
                            </small>
                          </div>
                        )}

                        {imageUploadError && (
                          <Alert variant="danger" className="mt-3">
                            <i className="fas fa-exclamation-triangle me-2"></i>
                            {imageUploadError}
                          </Alert>
                        )}
                      </div>

                      {/* Manual URL input section */}
                      <div className="mb-3">
                        <Form.Label className="fw-semibold">
                          <i className="fas fa-link me-2 text-info"></i>
                          Hoặc nhập link ảnh
                        </Form.Label>
                        <Form.Control
                          type="url"
                          name="imageMedicalUrl"
                          value={formData.imageMedicalUrl}
                          onChange={handleInputChange}
                          placeholder="Nhập link ảnh sự cố y tế (http://... hoặc https://...)"
                          className="medical-image-input"
                        />
                      </div>

                      {/* Image preview section */}
                      {(imagePreview || formData.imageMedicalUrl) && (
                        <div className="medical-image-preview">
                          <h6 className="text-info fw-bold mb-3 text-center">
                            <i className="fas fa-eye me-2"></i>Preview ảnh sự cố
                          </h6>
                          <div className="d-flex justify-content-center align-items-center">
                            <div className="position-relative">
                              <img
                                src={imagePreview || formData.imageMedicalUrl}
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
