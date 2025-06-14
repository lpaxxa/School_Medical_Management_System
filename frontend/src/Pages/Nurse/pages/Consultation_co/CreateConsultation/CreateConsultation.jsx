import React, { useState, useEffect } from 'react';
import { 
  createConsultation, 
  getUsers, 
  getStudents, 
  getConsultationTypes 
} from '../../../../../services/consultationService';
import './CreateConsultation.css';

const CreateConsultation = ({ onBack, onConsultationCreated }) => {
  // Form state
  const [formData, setFormData] = useState({
    receiver: '',
    receiverObject: null,
    student: '',
    studentObject: null,
    type: '',
    title: '',
    content: '',
    requireResponse: false,
    responseDeadline: ''
  });
  
  // Component state
  const [users, setUsers] = useState([]);
  const [students, setStudents] = useState([]);
  const [consultationTypes, setConsultationTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Load necessary data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [usersData, studentsData, typesData] = await Promise.all([
          getUsers(),
          getStudents(),
          getConsultationTypes()
        ]);
        
        setUsers(usersData);
        setStudents(studentsData);
        setConsultationTypes(typesData);
        setError(null);
      } catch (err) {
        console.error("Error fetching form data:", err);
        setError("Không thể tải dữ liệu cần thiết. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Special handling for select fields
    if (name === 'receiver') {
      const selectedUser = users.find(user => user.id === value);
      setFormData(prev => ({ ...prev, receiverObject: selectedUser }));
    } else if (name === 'student') {
      const selectedStudent = students.find(student => student.id === value);
      setFormData(prev => ({ ...prev, studentObject: selectedStudent }));
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.receiver) {
      setError("Vui lòng chọn người nhận");
      return;
    }
    
    if (!formData.type) {
      setError("Vui lòng chọn loại tư vấn");
      return;
    }
    
    if (!formData.title.trim()) {
      setError("Vui lòng nhập tiêu đề");
      return;
    }
    
    if (!formData.content.trim()) {
      setError("Vui lòng nhập nội dung tư vấn");
      return;
    }
    
    // If requireResponse is checked but no deadline is set
    if (formData.requireResponse && !formData.responseDeadline) {
      setError("Vui lòng chọn hạn phản hồi");
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Mock current user (in a real app, this would come from auth context)
      const currentUser = {
        id: "u003",
        name: "Đỗ Thị Hoa",
        role: "Y tá"
      };
      
      // Prepare consultation data
      const consultationData = {
        sender: currentUser,
        receiver: formData.receiverObject,
        student: formData.studentObject || null,
        type: consultationTypes.find(type => type.id === formData.type),
        title: formData.title,
        content: formData.content,
        requireResponse: formData.requireResponse,
        responseDeadline: formData.requireResponse ? formData.responseDeadline : null
      };
      
      // Create new consultation
      await createConsultation(consultationData);
      
      // Clear form and notify parent component
      setFormData({
        receiver: '',
        receiverObject: null,
        student: '',
        studentObject: null,
        type: '',
        title: '',
        content: '',
        requireResponse: false,
        responseDeadline: ''
      });
      
      onConsultationCreated();
    } catch (err) {
      console.error("Error creating consultation:", err);
      setError("Không thể tạo tư vấn. Vui lòng thử lại sau.");
    } finally {
      setSubmitting(false);
    }
  };

  // Get today's date for min date attribute
  const getTodayForDateInput = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Group users by role for better organization in the select box
  const getUsersByRole = () => {
    const userGroups = {};
    
    users.forEach(user => {
      const role = user.role || 'Khác';
      if (!userGroups[role]) {
        userGroups[role] = [];
      }
      userGroups[role].push(user);
    });
    
    return userGroups;
  };

  // Group students by class
  const getStudentsByClass = () => {
    const classGroups = {};
    
    students.forEach(student => {
      const className = student.class || 'Chưa phân lớp';
      if (!classGroups[className]) {
        classGroups[className] = [];
      }
      classGroups[className].push(student);
    });
    
    return classGroups;
  };

  return (
    <div className="create-consultation">
      <div className="create-header">
        <h2>Tạo tư vấn mới</h2>
        <button className="back-button" onClick={onBack}>
          <i className="fas fa-times"></i> Hủy
        </button>
      </div>
      
      <div className="create-content">
        {loading ? (
          <div className="loading-state">
            <i className="fas fa-spinner fa-spin"></i>
            <span>Đang tải dữ liệu...</span>
          </div>
        ) : (
          <>
            {error && (
              <div className="form-error">
                {error}
              </div>
            )}
            
            <form className="consultation-form" onSubmit={handleSubmit}>
              <div className="form-section">
                <h3>Thông tin cơ bản</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      Người nhận <span className="required">*</span>
                    </label>
                    <select
                      className="form-control"
                      name="receiver"
                      value={formData.receiver}
                      onChange={handleInputChange}
                      disabled={submitting}
                    >
                      <option value="">-- Chọn người nhận --</option>
                      {Object.entries(getUsersByRole()).map(([role, roleUsers]) => (
                        <optgroup key={role} label={role}>
                          {roleUsers.map(user => (
                            <option key={user.id} value={user.id}>
                              {user.name}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">
                      Loại tư vấn <span className="required">*</span>
                    </label>
                    <select
                      className="form-control"
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      disabled={submitting}
                    >
                      <option value="">-- Chọn loại tư vấn --</option>
                      {consultationTypes.map(type => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Học sinh liên quan
                  </label>
                  <select
                    className="form-control"
                    name="student"
                    value={formData.student}
                    onChange={handleInputChange}
                    disabled={submitting}
                  >
                    <option value="">-- Không liên quan đến học sinh nào --</option>
                    {Object.entries(getStudentsByClass()).map(([className, classStudents]) => (
                      <optgroup key={className} label={className}>
                        {classStudents.map(student => (
                          <option key={student.id} value={student.id}>
                            {student.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Tiêu đề <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Nhập tiêu đề tư vấn"
                    disabled={submitting}
                  />
                </div>
              </div>
              
              <div className="form-section">
                <h3>Nội dung tư vấn</h3>
                
                <div className="form-group">
                  <label className="form-label">
                    Nội dung <span className="required">*</span>
                  </label>
                  <textarea
                    className="form-control form-textarea"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Nhập nội dung tư vấn chi tiết..."
                    rows={8}
                    disabled={submitting}
                  ></textarea>
                </div>
              </div>
              
              <div className="form-section">
                <h3>Tùy chọn phản hồi</h3>
                
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="requireResponse"
                      checked={formData.requireResponse}
                      onChange={handleInputChange}
                      disabled={submitting}
                    />
                    <span>Yêu cầu phản hồi</span>
                  </label>
                  <div className="checkbox-hint">
                    Chọn tùy chọn này nếu bạn cần người nhận phản hồi tư vấn này
                  </div>
                </div>
                
                {formData.requireResponse && (
                  <div className="form-group">
                    <label className="form-label">
                      Hạn phản hồi <span className="required">*</span>
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      name="responseDeadline"
                      value={formData.responseDeadline}
                      onChange={handleInputChange}
                      min={getTodayForDateInput()}
                      disabled={submitting}
                    />
                  </div>
                )}
              </div>
              
              <div className="form-actions">
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={onBack}
                  disabled={submitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Đang tạo...' : 'Tạo tư vấn mới'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default CreateConsultation;
