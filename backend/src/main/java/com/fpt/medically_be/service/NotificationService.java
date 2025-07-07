package com.fpt.medically_be.service;

import com.fpt.medically_be.dto.response.MedicationAdministrationResponseDTO;
import com.fpt.medically_be.dto.response.MedicationInstructionDTO;

import java.util.Map;
import java.util.List;

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

    /**
     * Send notification to a specific user by Long ID
     * @param userId The ID of the user to receive the notification
     * @param title The title of the notification
     * @param content The content of the notification
     * @param data Additional data to include in the notification
     * @param type The type of notification
     */
    void sendNotificationToUser(Long userId, String title, String content, Map<String, Object> data, String type);

    /**
     * Send notification to a specific user by String ID
     * @param userId The ID of the user to receive the notification (String format)
     * @param title The title of the notification
     * @param content The content of the notification
     * @param data Additional data to include in the notification
     * @param type The type of notification
     */
    void sendNotificationToUser(String userId, String title, String content, Map<String, Object> data, String type);

    /**
     * Send notification to multiple users
     * @param userIds List of user IDs to receive the notification
     * @param title The title of the notification
     * @param content The content of the notification
     * @param data Additional data to include in the notification
     * @param type The type of notification
     */
    void sendNotificationToUsers(List<Long> userIds, String title, String content, Map<String, Object> data, String type);
}

