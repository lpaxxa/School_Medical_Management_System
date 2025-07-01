package com.fpt.medically_be.service;

import com.fpt.medically_be.dto.MedicalCheckupDTO;
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

    /**
     * Create medical checkup with automatic parent notification if health implications detected
     * @param medicalCheckupDTO The medical checkup data
     * @param autoNotifyParent Whether to automatically notify parent if health implications are found
     * @return The created medical checkup
     */
    MedicalCheckupDTO createMedicalCheckupWithNotification(MedicalCheckupDTO medicalCheckupDTO, boolean autoNotifyParent);
    
    /**
     * Update medical checkup with automatic parent notification if health implications detected
     * @param id The checkup ID
     * @param medicalCheckupDTO The updated medical checkup data
     * @param autoNotifyParent Whether to automatically notify parent if health implications are found
     * @return The updated medical checkup
     */
    MedicalCheckupDTO updateMedicalCheckupWithNotification(Long id, MedicalCheckupDTO medicalCheckupDTO, boolean autoNotifyParent);
    
    /**
     * Send health notification email to parent for specific checkup
     * @param checkupId The medical checkup ID
     */
    void sendHealthNotificationToParent(Long checkupId);
    
    /**
     * Send health notification emails to parents for multiple checkups
     * @param checkupIds List of medical checkup IDs
     */
    void sendBatchHealthNotificationsToParents(List<Long> checkupIds);
    
    /**
     * Get all checkups that need parent notification (health implications detected but parent not notified)
     * @return List of medical checkups needing parent notification
     */
    List<MedicalCheckupDTO> getCheckupsNeedingParentNotification();
    
    /**
     * Get all checkups with health implications within date range
     * @param startDate Start date
     * @param endDate End date
     * @return List of medical checkups with health implications
     */
    List<MedicalCheckupDTO> getCheckupsWithHealthImplications(LocalDate startDate, LocalDate endDate);
}
