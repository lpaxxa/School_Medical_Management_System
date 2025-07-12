import api from "../api";

class ClassService {
  // Get all available classes from the database
  async getAllClasses() {
    try {
      // Use the direct students endpoint to get all students
      const response = await api.get("/students");

      if (response.data && Array.isArray(response.data)) {
        const students = response.data;
        
        // Extract unique class names
        const classNames = [...new Set(
          students
            .map(student => student.className)
            .filter(className => className && className.trim())
            .sort()
        )];

        return {
          success: true,
          data: classNames,
        };
      }

      return {
        success: true,
        data: [],
      };
    } catch (error) {
      console.error("Error fetching classes:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Lỗi khi tải danh sách lớp học",
        data: [],
      };
    }
  }

  // Alternative method to get classes directly from student endpoint if available
  async getClassesFromStudents() {
    try {
      const response = await api.get("/students/classes");
      
      if (response.data) {
        return {
          success: true,
          data: Array.isArray(response.data) ? response.data : [],
        };
      }

      return {
        success: true,
        data: [],
      };
    } catch (error) {
      // If direct endpoint doesn't exist, fall back to getAllClasses
      return this.getAllClasses();
    }
  }
}

const classService = new ClassService();
export default classService; 