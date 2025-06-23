package com.fpt.medically_be.service;

import com.fpt.medically_be.dto.response.MedicationAdministrationResponseDTO;
import com.fpt.medically_be.dto.response.MedicationInstructionDTO;

public interface NotificationService {
    
    /**
     * Send notification to nurses about new medication request
     * @param medicationRequest The created medication instruction
     */
    void sendNotificationToNurses(MedicationInstructionDTO medicationRequest);
    
    /**
     * Send notification to parent about approval/rejection decision
     * @param medicationRequest The processed medication instruction
     */
    void sendNotificationToParent(MedicationInstructionDTO medicationRequest);
    
    /**
     * Send notification to parent when their child receives medication
     * @param administrationRecord The medication administration record
     * @param parentAccountId The parent's account ID for targeted notification
     */
    void sendMedicationAdministrationNotificationToParent(MedicationAdministrationResponseDTO administrationRecord, String parentAccountId);
} 