import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import vaccinationApiService from '../../services/APINurse/vaccinationApiService';

export const VaccinationContext = createContext();

export const useVaccination = () => {
  const context = useContext(VaccinationContext);
  if (!context) {
    throw new Error('useVaccination must be used within a VaccinationProvider');
  }
  return context;
};

export const VaccinationProvider = ({ children }) => {
  const [vaccinationPlans, setVaccinationPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for details modal
  const [selectedPlanDetails, setSelectedPlanDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // State for all vaccines
  const [allVaccines, setAllVaccines] = useState([]);

  // State for create record modal
  const [showCreateRecordModal, setShowCreateRecordModal] = useState(false);
  const [studentForRecord, setStudentForRecord] = useState(null);
  const [vaccineForRecord, setVaccineForRecord] = useState(null); // To store the specific vaccine

  // --- States for Post-Monitoring Flow ---

  // 1. Student List Modal
  const [showStudentListModal, setShowStudentListModal] = useState(false);
  const [selectedPlanForMonitoring, setSelectedPlanForMonitoring] = useState(null);
  const [studentStatuses, setStudentStatuses] = useState({}); // { [healthProfileId]: 'Hoàn thành' | 'Cần theo dõi' }
  const [statusLoading, setStatusLoading] = useState(false);

  // 2. Student History Modal
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedStudentHistory, setSelectedStudentHistory] = useState({ student: null, history: [] });

  // 3. Update Note Modal
  const [showUpdateNoteModal, setShowUpdateNoteModal] = useState(false);
  const [recordToUpdate, setRecordToUpdate] = useState(null);


  const fetchVaccinationPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await vaccinationApiService.getAllVaccinationPlans();
      // Đảm bảo dữ liệu luôn là một mảng
      if (Array.isArray(data)) {
        setVaccinationPlans(data);
      } else {
        console.error("API did not return an array:", data);
        setVaccinationPlans([]);
      }
    } catch (err) {
      setError('Không thể tải danh sách kế hoạch tiêm chủng.');
      setVaccinationPlans([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllVaccines = useCallback(async () => {
    try {
      const data = await vaccinationApiService.getAllVaccines();
      if (Array.isArray(data)) {
        setAllVaccines(data);
      }
    } catch (err) {
      console.error("Failed to fetch all vaccines", err);
    }
  }, []);


  useEffect(() => {
    fetchVaccinationPlans();
    fetchAllVaccines();
  }, [fetchVaccinationPlans, fetchAllVaccines]);

  const fetchPlanDetails = useCallback(async (id) => {
    setDetailsLoading(true);
    setDetailsError(null);
    try {
      const data = await vaccinationApiService.getDetailsVaccinePlanById(id);
      setSelectedPlanDetails(data);
      return data; // Return data for direct use
    } catch (err) {
      setDetailsError(`Không thể tải chi tiết kế hoạch (ID: ${id}). Vui lòng thử lại.`);
      setSelectedPlanDetails(null);
      console.error(err);
      return null; // Return null on error
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  const handleShowDetailsModal = useCallback((id) => {
    setShowDetailsModal(true);
    fetchPlanDetails(id);
  }, [fetchPlanDetails]);

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedPlanDetails(null);
    setDetailsError(null);
  };

  // Handlers for Create Record Modal
  const handleShowCreateRecordModal = (student, vaccine) => {
    setStudentForRecord(student);
    setVaccineForRecord(vaccine); // Set the specific vaccine
    setShowCreateRecordModal(true);
    // We close the details modal to avoid stacking modals
    setShowDetailsModal(false);
  };

  const handleCloseCreateRecordModal = () => {
    setShowCreateRecordModal(false);
    setStudentForRecord(null);
    setVaccineForRecord(null); // Clear the vaccine
    // Re-open the details modal if there's a plan selected
    if (selectedPlanDetails) {
      setShowDetailsModal(true);
    }
  };

  const handleCreateRecord = async (recordData) => {
    if (!studentForRecord || !vaccineForRecord) {
        toast.error('Thông tin học sinh hoặc vaccine bị thiếu!', { autoClose: 2500 });
        return;
    }
    try {
      const newRecord = {
        ...recordData,
        healthProfileId: studentForRecord.healthProfileId,
        vaccinationPlanId: selectedPlanDetails.id,
        vaccineId: vaccineForRecord.vaccineId, // Use the stored vaccine ID
      };
      await vaccinationApiService.createVaccinationRecord(newRecord);
      // Optional: Add success notification/handling here
      toast.success('Tạo hồ sơ tiêm chủng thành công!', { autoClose: 2500 });
      handleCloseCreateRecordModal();
      // Optional: Refresh plan details to show updated status
      fetchPlanDetails(selectedPlanDetails.id);
    } catch (error) {
      // Optional: Add error notification/handling here
      toast.error('Tạo hồ sơ thất bại. Vui lòng thử lại.', { autoClose: 2500 });
      console.error("Failed to create record", error);
    }
  };

  // --- Handlers for Post-Monitoring Flow ---

  // 1. Student List Modal
  const handleShowStudentListModal = useCallback(async (plan) => {
    setSelectedPlanForMonitoring(plan);
    setShowStudentListModal(true);
    setStatusLoading(true);

    // Fetch status for all students in the plan
    const statuses = {};
    if (plan && plan.students) {
        for (const student of plan.students) {
            try {
                const history = await vaccinationApiService.getAllVaccinationByHealthProfileId(student.healthProfileId);
                // Sort history by ID to find the latest record instead of date
                const latestRecord = history.sort((a, b) => b.id - a.id)[0];
                
                if (latestRecord && latestRecord.notes === 'không có phản ứng phụ') {
                    statuses[student.healthProfileId] = 'Hoàn thành';
                } else {
                    statuses[student.healthProfileId] = 'Cần theo dõi';
                }
            } catch (error) {
                console.error(`Could not fetch status for student ${student.fullName}`, error);
                statuses[student.healthProfileId] = 'Lỗi'; // Mark as error
            }
        }
    }
    setStudentStatuses(statuses);
    setStatusLoading(false);
  }, []);

  const handleCloseStudentListModal = () => {
    setShowStudentListModal(false);
    setSelectedPlanForMonitoring(null);
    setStudentStatuses({});
  };

  // 2. Student History Modal
  const handleShowHistoryModal = useCallback(async (student) => {
    setShowHistoryModal(true);
    setHistoryLoading(true);
    setShowStudentListModal(false); // Hide student list modal

    try {
        const historyData = await vaccinationApiService.getAllVaccinationByHealthProfileId(student.healthProfileId);
        setSelectedStudentHistory({ student, history: historyData });
    } catch (error) {
        toast.error(`Không thể tải lịch sử tiêm của ${student.fullName}.`);
        setSelectedStudentHistory({ student, history: [] });
    } finally {
        setHistoryLoading(false);
    }
  }, []);

  const handleCloseHistoryModal = () => {
    setShowHistoryModal(false);
    setSelectedStudentHistory({ student: null, history: [] });
    setShowStudentListModal(true); // Re-show student list modal
  };

  // 3. Update Note Modal
  const handleShowUpdateNoteModal = (record) => {
    setRecordToUpdate(record);
    setShowUpdateNoteModal(true);
    setShowHistoryModal(false); // Hide history modal
  };

  const handleCloseUpdateNoteModal = () => {
    setShowUpdateNoteModal(false);
    setRecordToUpdate(null);
    setShowHistoryModal(true); // Re-show history modal
  };

  const handleUpdateNote = async (notes) => {
    if (!recordToUpdate) return;
    try {
        await vaccinationApiService.updateVaccinationNote(recordToUpdate.id, notes);
        toast.success('Cập nhật ghi chú thành công!');
        handleCloseUpdateNoteModal();
        // Refresh history data after update
        if (selectedStudentHistory.student) {
            handleShowHistoryModal(selectedStudentHistory.student);
        }
    } catch (err) {
        toast.error('Cập nhật ghi chú thất bại.');
    }
  };

  const contextValue = {
    vaccinationPlans,
    loading,
    error,
    fetchVaccinationPlans,
    // Details-related values
    selectedPlanDetails,
    detailsLoading,
    detailsError,
    showDetailsModal,
    fetchPlanDetails, // Export the function
    handleShowDetailsModal,
    handleCloseDetailsModal,
    // Create Record Modal values
    allVaccines,
    showCreateRecordModal,
    studentForRecord,
    vaccineForRecord, // Export new state
    handleShowCreateRecordModal,
    handleCloseCreateRecordModal,
    handleCreateRecord,

    // Post-Monitoring Flow
    showStudentListModal,
    selectedPlanForMonitoring,
    studentStatuses,
    statusLoading,
    handleShowStudentListModal,
    handleCloseStudentListModal,

    showHistoryModal,
    historyLoading,
    selectedStudentHistory,
    handleShowHistoryModal,
    handleCloseHistoryModal,
    
    showUpdateNoteModal,
    recordToUpdate,
    handleShowUpdateNoteModal,
    handleCloseUpdateNoteModal,
    handleUpdateNote,
  };

  return (
    <VaccinationContext.Provider value={contextValue}>
      {children}
    </VaccinationContext.Provider>
  );
};