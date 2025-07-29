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
 * Calculate monitoring status for a specific vaccine of a student
 * @param {Object} student - Student object with healthProfileId
 * @param {string} planDate - Vaccination date of the plan
 * @param {number} vaccineId - ID of the specific vaccine
 * @param {string} vaccineName - Name of the specific vaccine
 * @returns {Promise<string>} - Status: 'Hoàn thành', 'Cần theo dõi', 'Chưa hoàn thành'
 */
export const calculateStudentVaccineMonitoringStatus = async (student, planDate, vaccineId, vaccineName) => {
  try {
    // Get vaccination history for the student
    const history = await vaccinationApiService.getAllVaccinationByHealthProfileId(student.healthProfileId);

    // Debug logging
    console.log(`[DEBUG] Checking vaccine status for student ${student.healthProfileId}, vaccine ${vaccineId} (${vaccineName}), date ${planDate}`);
    console.log(`[DEBUG] Full history:`, history);

    // Debug: Check structure of first record
    if (history.length > 0) {
      console.log(`[DEBUG] First record structure:`, Object.keys(history[0]));
      console.log(`[DEBUG] First record full:`, history[0]);
    }

    // Filter by vaccination date and vaccine name (since database doesn't store vaccineId)
    const vaccinationDate = new Date(planDate);
    const filteredHistory = history.filter(record => {
      const recordDate = new Date(record.vaccinationDate);
      const dateMatch = recordDate.toDateString() === vaccinationDate.toDateString();

      // Match by vaccine name since database doesn't store vaccineId
      const vaccineNameMatch = record.vaccineName === vaccineName;

      console.log(`[DEBUG] Record:`, {
        recordDate: recordDate.toDateString(),
        planDate: vaccinationDate.toDateString(),
        dateMatch,
        recordVaccineName: record.vaccineName,
        planVaccineName: vaccineName,
        vaccineNameMatch,
        recordId: record.id
      });

      return dateMatch && vaccineNameMatch;
    });

    console.log(`[DEBUG] Filtered history for vaccine ${vaccineId} (${vaccineName}):`, filteredHistory);

    // Calculate status based on notes for this specific vaccine
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
    console.error(`Could not fetch monitoring status for student ${student.fullName} and vaccine ${vaccineId}:`, error);
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
 * Calculate monitoring status for multiple students and their vaccines
 * @param {Array} students - Array of student objects
 * @param {string} planDate - Vaccination date of the plan
 * @param {Array} vaccines - Array of vaccine objects with id
 * @returns {Promise<Object>} - Object with "healthProfileId_vaccineId" as key and status as value
 */
export const calculateStudentsVaccineMonitoringStatus = async (students, planDate, vaccines) => {
  const statuses = {};

  if (!students || students.length === 0 || !vaccines || vaccines.length === 0) {
    return statuses;
  }

  console.log(`[DEBUG] Plan vaccines:`, vaccines);
  console.log(`[DEBUG] Plan date:`, planDate);

  // Process students in batches to avoid overwhelming the API
  const batchSize = 5;
  for (let i = 0; i < students.length; i += batchSize) {
    const batch = students.slice(i, i + batchSize);

    const batchPromises = batch.map(async (student) => {
      const studentVaccineStatuses = {};

      // Check each vaccine for this student
      for (const vaccine of vaccines) {
        console.log(`[DEBUG] Checking vaccine for student ${student.fullName}:`, vaccine);
        const status = await calculateStudentVaccineMonitoringStatus(student, planDate, vaccine.id, vaccine.name);
        studentVaccineStatuses[`${student.healthProfileId}_${vaccine.id}`] = status;
        console.log(`[DEBUG] Status for ${student.fullName} - vaccine ${vaccine.id} (${vaccine.name}): ${status}`);
      }

      return studentVaccineStatuses;
    });

    const batchResults = await Promise.all(batchPromises);
    batchResults.forEach((studentStatuses) => {
      Object.assign(statuses, studentStatuses);
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
