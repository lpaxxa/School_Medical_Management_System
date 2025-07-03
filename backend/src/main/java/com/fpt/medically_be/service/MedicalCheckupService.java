package com.fpt.medically_be.service;

import com.fpt.medically_be.dto.MedicalCheckupDTO;
import com.fpt.medically_be.dto.StudentDTO;
import com.fpt.medically_be.dto.request.MedicalCheckupCreateRequestDTO;
import com.fpt.medically_be.dto.response.ClassDTO;
import com.fpt.medically_be.dto.response.StudentConsentDTO;

import java.time.LocalDate;
import java.util.List;

public interface MedicalCheckupService {
    List<MedicalCheckupDTO> getAllMedicalCheckups();
    MedicalCheckupDTO getMedicalCheckupById(Long id);
    List<MedicalCheckupDTO> getMedicalCheckupsByStudentId(Long studentId);
    List<MedicalCheckupDTO> getMedicalCheckupsByStaffId(Long staffId);
    List<MedicalCheckupDTO> getMedicalCheckupsByDateRange(LocalDate startDate, LocalDate endDate);
    List<MedicalCheckupDTO> getMedicalCheckupsByStudentAndDateRange(Long studentId, LocalDate startDate, LocalDate endDate);
    List<MedicalCheckupDTO> getMedicalCheckupsByType(String checkupType);
    List<MedicalCheckupDTO> getMedicalCheckupsNeedingFollowUp();
    MedicalCheckupDTO createMedicalCheckup(MedicalCheckupDTO medicalCheckupDTO);
    MedicalCheckupDTO updateMedicalCheckup(Long id, MedicalCheckupDTO medicalCheckupDTO);
    void deleteMedicalCheckup(Long id);

    // NEW IN-APP NOTIFICATION SYSTEM METHODS
    
    /**
     * Create medical checkups for multiple students with in-app notifications
     * @param request The checkup creation request with multiple students
     * @return List of created medical checkups
     */
    List<MedicalCheckupDTO> createMedicalCheckupsWithStudents(MedicalCheckupCreateRequestDTO request);
    
    /**
     * Send in-app notifications to parents for a specific checkup
     * @param checkupId The medical checkup ID
     */
    void notifyParentsCheckup(Long checkupId);
    
    /**
     * Get parent consent status for a specific checkup
     * @param checkupId The medical checkup ID
     * @return List of student consent status
     */
    List<StudentConsentDTO> getStudentConsents(Long checkupId);
    
    /**
     * Get list of available classes for student selection
     * @return List of classes
     */
    List<ClassDTO> getClasses();
    
    /**
     * Get students by class for checkup selection
     * @param classId The class identifier (className)
     * @return List of students in the class
     */
    List<StudentDTO> getStudentsByClass(String classId);

    /**
     * Create medical checkup with automatic parent notification if health implications detected
     * @param medicalCheckupDTO The medical checkup data
     * @param autoNotifyParent Whether to automatically notify parent if health implications are found
     * @return The created medical checkup
     */
    // COMMENTED OUT - Replaced with in-app notification system
    // MedicalCheckupDTO createMedicalCheckupWithNotification(MedicalCheckupDTO medicalCheckupDTO, boolean autoNotifyParent);
    
    /**
     * Update medical checkup with automatic parent notification if health implications detected
     * @param id The checkup ID
     * @param medicalCheckupDTO The updated medical checkup data
     * @param autoNotifyParent Whether to automatically notify parent if health implications are found
     * @return The updated medical checkup
     */
    // COMMENTED OUT - Replaced with in-app notification system
    // MedicalCheckupDTO updateMedicalCheckupWithNotification(Long id, MedicalCheckupDTO medicalCheckupDTO, boolean autoNotifyParent);
    
    /**
     * Send health notification email to parent for specific checkup
     * @param checkupId The medical checkup ID
     */
    // COMMENTED OUT - Replaced with in-app notification system
    // void sendHealthNotificationToParent(Long checkupId);
    
    /**
     * Send health notification emails to parents for multiple checkups
     * @param checkupIds List of medical checkup IDs
     */
    // COMMENTED OUT - Replaced with in-app notification system
    // void sendBatchHealthNotificationsToParents(List<Long> checkupIds);
    
    /**
     * Get all checkups that need parent notification (health implications detected but parent not notified)
     * @return List of medical checkups needing parent notification
     */
    // COMMENTED OUT - Replaced with in-app notification system
    // List<MedicalCheckupDTO> getCheckupsNeedingParentNotification();
    
    /**
     * Get all checkups with health implications within date range
     * @param startDate Start date
     * @param endDate End date
     * @return List of medical checkups with health implications
     */
    // COMMENTED OUT - Replaced with in-app notification system
    // List<MedicalCheckupDTO> getCheckupsWithHealthImplications(LocalDate startDate, LocalDate endDate);
}
