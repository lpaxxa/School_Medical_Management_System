import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getAllStudents,
  getStudentById,
  searchStudents,
  updateStudentRecord,
  addStudentNote,
  getClassList,
  getGradeList,
  getBloodTypes
} from '../../services/APINurse/studentRecordsService';

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
  
  // Classes, grades, và bloodTypes
  const [classes, setClasses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [bloodTypes, setBloodTypes] = useState([]);
  
  // Search criteria
  const [searchCriteria, setSearchCriteria] = useState({
    keyword: '',
    class: '',
    grade: '',
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
              return {
                ...student,
                // Đảm bảo các trường cần thiết có giá trị mặc định
                fullName: student.fullName || student.name || 'Không có tên',
                className: student.className || student.class || 'Chưa phân lớp',
                dateOfBirth: student.dateOfBirth || new Date().toISOString().split('T')[0],
                gender: student.gender || 'Không xác định',
                // Đảm bảo healthProfileId là số nguyên
                healthProfileId: student.healthProfileId ? parseInt(student.healthProfileId) : null,
                // Giữ student.id cho việc cập nhật và xử lý dữ liệu
                id: student.id || student.studentId || `temp-${Math.random()}`
              };
            })
          : [];
        
        console.log('Processed students with healthProfileId:', processedStudents);
        
        setStudents(processedStudents);
        setFilteredStudents(processedStudents);
        
        // Fetch classes, grades và blood types
        const classesData = await getClassList();
        const gradesData = await getGradeList();
        const bloodTypesData = await getBloodTypes();
        
        // Đảm bảo classes, grades và bloodTypes luôn là mảng
        setClasses(Array.isArray(classesData) ? classesData : []);
        setGrades(Array.isArray(gradesData) ? gradesData : []);
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
  
  // Search and filter - thực hiện lọc ở frontend
  const handleSearch = async (criteria) => {
    try {
      setLoading(true);
      setSearchCriteria(criteria);
      
      // Lấy tất cả học sinh từ API hoặc dữ liệu hiện có
      let allStudents = students.length > 0 ? students : await getAllStudents();
      
      // Lọc theo từ khóa
      if (criteria.keyword) {
        const keyword = criteria.keyword.toLowerCase();
        allStudents = allStudents.filter(student => 
          (student.fullName && student.fullName.toLowerCase().includes(keyword)) || 
          (student.name && student.name.toLowerCase().includes(keyword)) ||
          (student.studentId && student.studentId.toLowerCase().includes(keyword))
        );
      }
      
      // Lọc theo lớp
      if (criteria.class) {
        const className = criteria.class.toLowerCase();
        allStudents = allStudents.filter(student => {
          const studentClass = (student.className || student.class || '').toLowerCase();
          return studentClass.includes(className);
        });
      }
      
      // Lọc theo khối
      if (criteria.grade) {
        allStudents = allStudents.filter(student => {
          const className = student.className || student.class || '';
          // Lấy số khối từ tên lớp (ví dụ: 12A1 -> 12, 3B2 -> 3)
          const classGrade = className.match(/^(\d+)/);
          return classGrade && classGrade[1] === criteria.grade;
        });
      }
      
      setFilteredStudents(allStudents);
      setLoading(false);
      return allStudents;
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
      grade: '',
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
    grades,
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