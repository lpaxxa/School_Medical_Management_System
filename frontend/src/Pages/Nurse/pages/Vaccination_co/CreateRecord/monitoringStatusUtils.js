// Utility function to check monitoring status for students
import vaccinationApiService from '../../../../../services/APINurse/vaccinationApiService';

/**
 * Calculate monitoring status for a student based on vaccination history
 * @param {Object} student - Student object with healthProfileId
 * @param {string} planDate - Vaccination date of the plan
 * @returns {Promise<string>} - Status: 'Hoàn thành', 'Cần theo dõi', 'Chưa hoàn thành'
 */
export const calculateStudentMonitoringStatus = async (student, planDate) => {
  try {
    // Get vaccination history for the student
    const history = await vaccinationApiService.getAllVaccinationByHealthProfileId(student.healthProfileId);
    
    // Filter by vaccination date
    const vaccinationDate = new Date(planDate);
    const filteredHistory = history.filter(record => {
      const recordDate = new Date(record.vaccinationDate);
      return recordDate.toDateString() === vaccinationDate.toDateString();
    });
    
    // Calculate status based on notes
    if (filteredHistory.length === 0) {
      return 'Chưa hoàn thành';
    } else {
      const allCompleted = filteredHistory.every(record => {
        const notes = record.notes;
        return notes && notes.toLowerCase().trim().includes('không có phản ứng phụ');
      });
      
      if (allCompleted) {
        return 'Hoàn thành';
      } else {
        return 'Cần theo dõi';
      }
    }
  } catch (error) {
    console.error(`Could not fetch monitoring status for student ${student.fullName}:`, error);
    return 'Chưa hoàn thành'; // Default to allow creating record
  }
};

/**
 * Calculate monitoring status for multiple students
 * @param {Array} students - Array of student objects
 * @param {string} planDate - Vaccination date of the plan
 * @returns {Promise<Object>} - Object with healthProfileId as key and status as value
 */
export const calculateStudentsMonitoringStatus = async (students, planDate) => {
  const statuses = {};
  
  if (!students || students.length === 0) {
    return statuses;
  }
  
  // Process students in batches to avoid overwhelming the API
  const batchSize = 5;
  for (let i = 0; i < students.length; i += batchSize) {
    const batch = students.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (student) => {
      const status = await calculateStudentMonitoringStatus(student, planDate);
      return { healthProfileId: student.healthProfileId, status };
    });
    
    const batchResults = await Promise.all(batchPromises);
    batchResults.forEach(({ healthProfileId, status }) => {
      statuses[healthProfileId] = status;
    });
  }
  
  return statuses;
};

/**
 * Check if a student can create a new vaccination record
 * @param {string} monitoringStatus - Monitoring status of the student
 * @returns {boolean} - True if student can create record, false otherwise
 */
export const canCreateVaccinationRecord = (monitoringStatus) => {
  return monitoringStatus === 'Chưa hoàn thành';
};

/**
 * Get display text for vaccination record status
 * @param {string} monitoringStatus - Monitoring status of the student
 * @returns {string} - Display text
 */
export const getVaccinationRecordStatusText = (monitoringStatus) => {
  switch (monitoringStatus) {
    case 'Hoàn thành':
      return 'Đã tạo HS - Hoàn thành';
    case 'Cần theo dõi':
      return 'Đã tạo HS - Cần theo dõi';
    case 'Chưa hoàn thành':
      return 'Chưa tạo HS';
    default:
      return 'Đang kiểm tra...';
  }
};

/**
 * Get color for vaccination record status
 * @param {string} monitoringStatus - Monitoring status of the student
 * @returns {string} - Color hex code
 */
export const getVaccinationRecordStatusColor = (monitoringStatus) => {
  switch (monitoringStatus) {
    case 'Hoàn thành':
    case 'Cần theo dõi':
      return '#10b981'; // green - đã tạo HS
    case 'Chưa hoàn thành':
      return '#ef4444'; // red - chưa tạo HS
    default:
      return '#6b7280'; // gray - đang kiểm tra
  }
};
