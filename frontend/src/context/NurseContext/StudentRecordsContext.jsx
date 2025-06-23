import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getAllStudents,
  getStudentById,
  searchStudents,
  updateStudentRecord,
  addStudentNote,
  getClassList,
  getBloodTypes
} from '../../services/studentRecordsService';

// Tạo context cho StudentRecords
export const StudentRecordsContext = createContext();

// Custom hook để sử dụng context
export const useStudentRecords = () => useContext(StudentRecordsContext);

export const StudentRecordsProvider = ({ children }) => {
  // States
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // Classes và bloodTypes
  const [classes, setClasses] = useState([]);
  const [bloodTypes, setBloodTypes] = useState([]);
  
  // Search criteria
  const [searchCriteria, setSearchCriteria] = useState({
    keyword: '',
    class: '',
    bloodType: '',
    healthIssue: ''
  });
  
  // Fetch tất cả học sinh khi component được mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Fetch students data
        const studentsData = await getAllStudents();
        const processedStudents = Array.isArray(studentsData) 
          ? studentsData.map(student => {
              // Đảm bảo ID và healthProfileID là số nếu có thể
              let healthProfileId;
              if (student.healthProfileId) {
                healthProfileId = isNaN(parseInt(student.healthProfileId)) 
                  ? student.healthProfileId 
                  : parseInt(student.healthProfileId);
              } else if (student.healthProfile?.id) {
                healthProfileId = student.healthProfile.id;
              } else {
                // Nếu không có healthProfileId, sử dụng ID học sinh như fallback
                // Trong thực tế, healthProfileId và student.id nên khác nhau
                healthProfileId = student.id;
              }
              
              return {
                ...student,
                // Đảm bảo các trường cần thiết có giá trị mặc định
                fullName: student.fullName || student.name || 'Không có tên',
                className: student.className || student.class || 'Chưa phân lớp',
                dateOfBirth: student.dateOfBirth || new Date().toISOString().split('T')[0],
                gender: student.gender || 'Không xác định',
                // Lưu healthProfileId vừa xử lý
                healthProfileId: healthProfileId,
                // Giữ student.id cho việc cập nhật và xử lý dữ liệu
                id: student.id || student.studentId || `temp-${Math.random()}`
              };
            })
          : [];
        
        console.log('Processed students with healthProfileId:', processedStudents);
        
        setStudents(processedStudents);
        setFilteredStudents(processedStudents);
        
        // Fetch classes and blood types
        const classesData = await getClassList();
        const bloodTypesData = await getBloodTypes();
        
        // Đảm bảo classes và bloodTypes luôn là mảng
        setClasses(Array.isArray(classesData) ? classesData : []);
        setBloodTypes(Array.isArray(bloodTypesData) ? bloodTypesData : []);
        
        setLoading(false);
      } catch (err) {
        setError(`Lỗi khi tải dữ liệu: ${err.message}`);
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);
  
  // Fetch student detail by ID
  const fetchStudentById = async (id) => {
    try {
      setLoading(true);
      const student = await getStudentById(id);
      setSelectedStudent(student);
      setLoading(false);
      return student;
    } catch (err) {
      setError(`Lỗi khi lấy thông tin học sinh: ${err.message}`);
      setLoading(false);
      throw err;
    }
  };
  
  // Update student record
  const updateStudent = async (id, data) => {
    try {
      setLoading(true);
      const updatedStudent = await updateStudentRecord(id, data);
      
      // Update local state
      setStudents(prev => prev.map(student => 
        student.id === updatedStudent.id ? updatedStudent : student
      ));
      
      setFilteredStudents(prev => prev.map(student => 
        student.id === updatedStudent.id ? updatedStudent : student
      ));
      
      setSelectedStudent(updatedStudent);
      setLoading(false);
      return updatedStudent;
    } catch (err) {
      setError(`Lỗi khi cập nhật hồ sơ học sinh: ${err.message}`);
      setLoading(false);
      throw err;
    }
  };
  
  // Add note to student
  const addNoteToStudent = async (id, noteData) => {
    try {
      setLoading(true);
      const updatedStudent = await addStudentNote(id, noteData);
      
      // Update local state
      setSelectedStudent(updatedStudent);
      setLoading(false);
      return updatedStudent;
    } catch (err) {
      setError(`Lỗi khi thêm ghi chú: ${err.message}`);
      setLoading(false);
      throw err;
    }
  };
  
  // Search and filter
  const handleSearch = async (criteria) => {
    try {
      setLoading(true);
      setSearchCriteria(criteria);
      
      const results = await searchStudents(criteria);
      setFilteredStudents(results);
      setLoading(false);
      return results;
    } catch (err) {
      setError(`Lỗi khi tìm kiếm: ${err.message}`);
      setLoading(false);
      throw err;
    }
  };
  
  // Reset filters
  const resetFilters = async () => {
    setSearchCriteria({
      keyword: '',
      class: '',
      bloodType: '',
      healthIssue: ''
    });
    
    try {
      setLoading(true);
      const allStudents = await getAllStudents();
      setFilteredStudents(allStudents);
      setLoading(false);
    } catch (err) {
      setError(`Lỗi khi làm mới danh sách: ${err.message}`);
      setLoading(false);
    }
  };
  
  // Refresh student list
  const refreshStudentList = async () => {
    try {
      setLoading(true);
      const updatedStudents = await getAllStudents();
      setStudents(updatedStudents);
      
      // Re-apply current filters if any
      if (Object.values(searchCriteria).some(value => value !== '')) {
        const filtered = await searchStudents(searchCriteria);
        setFilteredStudents(filtered);
      } else {
        setFilteredStudents(updatedStudents);
      }
      
      setLoading(false);
    } catch (err) {
      setError(`Lỗi khi làm mới danh sách: ${err.message}`);
      setLoading(false);
    }
  };
  
  const value = {
    students,
    filteredStudents,
    loading,
    error,
    selectedStudent,
    classes,
    bloodTypes,
    searchCriteria,
    setSelectedStudent,
    fetchStudentById,
    updateStudent,
    addNoteToStudent,
    handleSearch,
    resetFilters,
    refreshStudentList
  };
  
  return (
    <StudentRecordsContext.Provider value={value}>
      {children}
    </StudentRecordsContext.Provider>
  );
};

export default StudentRecordsContext;