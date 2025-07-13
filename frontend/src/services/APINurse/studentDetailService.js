import api from '../api.js';

// Service để lấy thông tin chi tiết học sinh theo ID
export const getStudentById = async (studentId) => {
  try {
    const response = await api.get(`/students/student-id/${studentId}`);
    
    return response.data;
  } catch (error) {
    console.error('Error fetching student details:', error);
    throw error;
  }
};
