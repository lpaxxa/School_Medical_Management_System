package com.fpt.medically_be.service.impl;

import com.fpt.medically_be.dto.response.MedicationAdministrationResponseDTO;
import com.fpt.medically_be.dto.response.MedicationInstructionDTO;
import com.fpt.medically_be.dto.response.NurseMedicationNotificationDTO;
import com.fpt.medically_be.dto.response.ParentMedicationAdministrationNotificationDTO;
import com.fpt.medically_be.dto.response.ParentMedicationResponseNotification;
import com.fpt.medically_be.mapper.NotificationMapper;
import com.fpt.medically_be.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class NotificationServiceImpl implements NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationServiceImpl.class);
    
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationMapper notificationMapper;

    @Autowired
    public NotificationServiceImpl(SimpMessagingTemplate messagingTemplate,
                                 NotificationMapper notificationMapper) {
        this.messagingTemplate = messagingTemplate;
        this.notificationMapper = notificationMapper;
    }

    @Override
    public void sendNotificationToNurses(MedicationInstructionDTO medicationRequest) {
        try {
            // Use the unified mapper to create nurse notification
            NurseMedicationNotificationDTO notification = notificationMapper.mapToNurseNotification(medicationRequest);
            
            // Send broadcast notification to all nurses
            messagingTemplate.convertAndSend(notificationMapper.getNurseDestination(), notification);
            
            logger.info("Notification2 sent successfully to nurses for new medication request: {}", medicationRequest.getId());
            
        } catch (Exception e) {
            logger.error("Failed to send notification to nurses for medication request: {}", medicationRequest.getId(), e);
            // Don't throw the exception - the main operation should still succeed even if notification fails
        }
    }

    @Override
    public void sendNotificationToParent(MedicationInstructionDTO medicationRequest) {
        try {
            // Get the parent's account ID for targeted notification
            String parentAccountId = notificationMapper.getParentTargetUserId(medicationRequest);
            
            if (parentAccountId != null && !parentAccountId.trim().isEmpty()) {
                // Use the unified mapper to create parent notification
                ParentMedicationResponseNotification notification = notificationMapper.mapToParentNotification(medicationRequest);

                // Send targeted notification to specific parent
                if (notificationMapper.isParentNotificationTargeted()) {
                    messagingTemplate.convertAndSendToUser(
                        parentAccountId, 
                        notificationMapper.getParentDestination(), 
                        notification
                    );
                } else {
                    messagingTemplate.convertAndSend(notificationMapper.getParentDestination(), notification);
                }
                
                logger.info("Notification2 sent successfully to parent with account ID: {} for medication request: {}",
                           parentAccountId, medicationRequest.getId());
            } else {
                logger.warn("Cannot send notification - parent account ID is missing for medication request: {}", medicationRequest.getId());
            }
            
        } catch (Exception e) {
            logger.error("Failed to send notification to parent for medication request: {}", medicationRequest.getId(), e);
            // Don't throw the exception - the main operation should still succeed even if notification fails
        }
    }

    @Override
    public void sendMedicationAdministrationNotificationToParent(MedicationAdministrationResponseDTO administrationRecord, String parentAccountId) {
        try {
            // Create the notification DTO
            ParentMedicationAdministrationNotificationDTO notification = notificationMapper.mapToParentAdministrationNotification(administrationRecord);
            
            if (parentAccountId != null && !parentAccountId.trim().isEmpty()) {
                // Send targeted notification to the specific parent only
                messagingTemplate.convertAndSendToUser(
                    parentAccountId,
                    notificationMapper.getParentAdministrationDestination(), 
                    notification
                );
                
                logger.info("Medication administration notification sent successfully to parent {} for administration ID: {}", 
                           parentAccountId, administrationRecord.getId());
            } else {
                logger.warn("Cannot send medication administration notification - parent account ID is missing for administration ID: {}", 
                           administrationRecord.getId());
            }
            
        } catch (Exception e) {
            logger.error("Failed to send medication administration notification for administration ID: {}", administrationRecord.getId(), e);
            // Don't throw the exception - the main operation should still succeed even if notification fails
        }
    }
} 