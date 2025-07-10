import React, { useState, useEffect } from 'react';
import { useStudentRecords } from '../../../../../context/NurseContext/StudentRecordsContext';
import './StudentList.css';
import StudentDetail from '../StudentDetail/StudentDetail';
import AddEditRecord from '../AddEditRecord/AddEditRecord';
import { Form } from 'react-bootstrap';

const StudentList = () => {
  // Sử dụng context thay vì local state và API calls
  const {
    filteredStudents,
    loading,
    error,
    classes,
    bloodTypes,
    searchCriteria,
    handleSearch,
    resetFilters,
    setSelectedStudent
  } = useStudentRecords();
  
  // Local state
  const [viewMode, setViewMode] = useState('list');
  const [selectedStudentLocal, setSelectedStudentLocal] = useState(null);
  
  // Local state cho form tìm kiếm
  const [keyword, setKeyword] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedBloodType, setSelectedBloodType] = useState('');
  const [selectedHealthIssue, setSelectedHealthIssue] = useState('');
  
  // Đồng bộ state tìm kiếm local với context khi component mount
  useEffect(() => {
    setKeyword(searchCriteria.keyword);
    setSelectedClass(searchCriteria.class);
    setSelectedBloodType(searchCriteria.bloodType);
    setSelectedHealthIssue(searchCriteria.healthIssue);
  }, [searchCriteria]);

  // Thêm hàm xử lý cho Form.Control
  const handleSearchInputChange = (e) => {
    const { name, value } = e.target;
    
    switch (name) {
      case 'keyword':
        setKeyword(value);
        break;
      case 'class':
        setSelectedClass(value);
        break;
      case 'bloodType':
        setSelectedBloodType(value);
        break;
      case 'healthIssue':
        setSelectedHealthIssue(value);
        break;
      default:
        break;
    }
  };

  // Xử lý khi nhấn nút tìm kiếm
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch({
      keyword,
      class: selectedClass,
      bloodType: selectedBloodType,
      healthIssue: selectedHealthIssue
    });
  };
  
  // Xử lý khi nhấn nút Reset
  const handleResetFilters = () => {
    setKeyword('');
    setSelectedClass('');
    setSelectedBloodType('');
    setSelectedHealthIssue('');
    resetFilters();
  };

  // Xử lý khi nhấn vào một học sinh
  const handleViewStudent = (student) => {
    if (!student) {
      console.error('Không có thông tin học sinh hợp lệ');
      return;
    }
    
    // Đảm bảo giữ nguyên ID học sinh và healthProfileId
    const studentWithId = {
      ...student,
      // Không tự động thêm hoặc sửa ID, giữ nguyên ID từ API
    };
    
    console.log('Selected student (before modification):', student);
    console.log('Selected student (after modification):', studentWithId);
    setSelectedStudentLocal(studentWithId);
    setSelectedStudent(studentWithId);
    setViewMode('detail');
  };

  // Xử lý khi quay lại danh sách
  const handleBackToList = () => {
    setViewMode('list');
    setSelectedStudentLocal(null);
    setSelectedStudent(null);
  };

  // Xử lý khi muốn thêm hồ sơ mới
  const handleAddRecord = () => {
    setViewMode('add');
    setSelectedStudentLocal(null);
    setSelectedStudent(null);
  };

  // Xử lý khi muốn chỉnh sửa hồ sơ
  const handleEditRecord = (student) => {
    setSelectedStudentLocal(student);
    setSelectedStudent(student);
    setViewMode('edit');
  };

  // Hiển thị trạng thái loading
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  // Hiển thị lỗi nếu có
  if (error) {
    return (
      <div className="error-container">
        <i className="fas fa-exclamation-circle"></i>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Thử lại</button>
      </div>
    );
  }

  // Hiển thị chi tiết học sinh
  if (viewMode === 'detail' && selectedStudentLocal) {
    return (
      <StudentDetail 
        student={selectedStudentLocal} 
        onBack={handleBackToList} 
        onEdit={() => handleEditRecord(selectedStudentLocal)}
      />
    );
  }

  // Hiển thị form thêm/sửa hồ sơ
  if ((viewMode === 'add' || viewMode === 'edit') && (viewMode === 'add' || selectedStudentLocal)) {
    return (
      <AddEditRecord
        student={viewMode === 'edit' ? selectedStudentLocal : null}
        onBack={handleBackToList}
        mode={viewMode}
      />
    );
  }

  // Hàm render bảng học sinh
  const renderStudentTable = () => {
    return (
      <div className="student-table-container">
        {filteredStudents.length === 0 ? (
          <div className="no-results">
            <i className="fas fa-search"></i>
            <p>Không tìm thấy học sinh nào phù hợp với tiêu chí tìm kiếm</p>
            <button onClick={resetFilters} className="btn-reset">
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <table className="student-table">
            <thead>
              <tr>
                <th>ID Hồ sơ y tế</th>
                <th>Họ và tên</th>
                <th>Mã học sinh</th>
                <th>Lớp</th>
                <th>Giới tính</th>
                <th>Ngày sinh</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id} onClick={() => handleViewStudent(student)}>
                  <td>{student.healthProfileId || 'N/A'}</td>
                  <td className="student-name">
                    <span>{student.fullName || student.name}</span>
                  </td>
                  <td>{student.studentId}</td>
                  <td>{student.className || student.class}</td>
                  <td>{student.gender}</td>
                  <td>{new Date(student.dateOfBirth).toLocaleDateString('vi-VN')}</td>
                  <td className="action-buttons">
                    <button
                      className="btn-view"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewStudent(student);
                      }}
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    <button
                      className="btn-edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditRecord(student);
                      }}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  // Hiển thị danh sách học sinh
  return (
    <div className="student-records-container">
      <div className="search-filter-container">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <div className="search-bar">
            <input
              type="text"
              name="keyword"
              placeholder="Tìm kiếm theo tên hoặc mã học sinh..."
              value={keyword}
              onChange={handleSearchInputChange}
              className="search-input"
            />
            <button type="submit" className="search-button">
              <i className="fas fa-search"></i>
            </button>
          </div>
          
          <div className="filter-options">
            <div className="filter-group">
              <label>Lớp:</label>
              <Form.Group controlId="formClass">
                <Form.Label>Lớp</Form.Label>
                <Form.Control
                  as="select"
                  name="class"
                  value={selectedClass} // Sử dụng state local thay vì context trực tiếp
                  onChange={handleSearchInputChange}
                >
                  <option value="">Tất cả các lớp</option>
                  {Array.isArray(classes) && classes.map((classItem, index) => {
                    // Xử lý an toàn cho classItem
                    const classKey = typeof classItem === 'string' ? classItem : (classItem?.id || index);
                    const classValue = typeof classItem === 'string' ? classItem : (classItem?.className || classItem?.name || '');
                    
                    return (
                      <option key={classKey} value={classValue}>
                        {classValue}
                      </option>
                    );
                  })}
                </Form.Control>
              </Form.Group>
            </div>
            
            <div className="filter-group">
              <label>Nhóm máu:</label>
              <select
                name="bloodType"
                value={selectedBloodType}
                onChange={handleSearchInputChange}
                className="filter-select"
              >
                <option value="">Tất cả</option>
                {bloodTypes.map((type, index) => (
                  <option key={type || index} value={type || ''}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Vấn đề sức khỏe:</label>
              <input
                type="text"
                name="healthIssue"
                placeholder="Dị ứng, bệnh mãn tính..."
                value={selectedHealthIssue}
                onChange={handleSearchInputChange}
                className="filter-input"
              />
            </div>
            
            <button type="button" onClick={handleResetFilters} className="reset-button">
              Đặt lại bộ lọc
            </button>
          </div>
        </form>
      </div>
      
      <div className="student-records-header">
        <h3>Danh sách học sinh ({filteredStudents.length})</h3>
        <button onClick={handleAddRecord} className="add-record-button">
          <i className="fas fa-plus"></i>
          Thêm hồ sơ mới
        </button>
      </div>
      
      {renderStudentTable()}
    </div>
  );
};

export default StudentList;
