// Service để lấy thông tin chi tiết học sinh theo ID
export const getStudentById = async (studentId) => {
  try {
    const response = await fetch(`http://localhost:8080/api/v1/students/student-id/${studentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching student details:', error);
    throw error;
  }
};
