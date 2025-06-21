package com.fpt.medically_be.mapper;

import com.fpt.medically_be.dto.response.MedicationInstructionDTO;
import com.fpt.medically_be.dto.response.NurseMedicationNotificationDTO;
import com.fpt.medically_be.dto.response.ParentMedicationResponseNotification;
import org.springframework.stereotype.Component;

/**
 * Unified notification mapper for all notification operations
 * Handles mapping and routing for both parent and nurse notifications
 */
@Component
public class NotificationMapper {
    
    // Parent notification constants
    private static final String PARENT_DESTINATION = "/queue/medication-approval";
    private static final boolean PARENT_IS_TARGETED = true;
    
    // Nurse notification constants
    private static final String NURSE_DESTINATION = "/topic/parent-medication-requests";
    private static final boolean NURSE_IS_TARGETED = false;
    
    /**
     * Maps MedicationInstructionDTO to ParentMedicationResponseNotification
     * @param medicationRequest The source medication instruction
     * @return The parent notification DTO
     */

    public ParentMedicationResponseNotification mapToParentNotification(MedicationInstructionDTO medicationRequest) {
        return ParentMedicationResponseNotification.builder()
            .Id(medicationRequest.getId())
            .medicationName(medicationRequest.getMedicationName())
            .dosage(medicationRequest.getDosageInstructions())
            .frequency(medicationRequest.getFrequencyPerDay())
            .specialInstructions(medicationRequest.getSpecialInstructions())
            .responseDate(medicationRequest.getResponseDate() != null ? medicationRequest.getResponseDate().toString() : null)
            .status(medicationRequest.getStatus())
            .build();
    }
    
    /**
     * Maps MedicationInstructionDTO to NurseMedicationNotificationDTO
     * @param medicationRequest The source medication instruction
     * @return The nurse notification DTO
     */
    public NurseMedicationNotificationDTO mapToNurseNotification(MedicationInstructionDTO medicationRequest) {
        return NurseMedicationNotificationDTO.builder()
            .Id(medicationRequest.getId())
            .medicationName(medicationRequest.getMedicationName())
            .dosage(medicationRequest.getDosageInstructions())
            .frequency(medicationRequest.getFrequencyPerDay())
            .specialInstructions(medicationRequest.getSpecialInstructions())
            .submittedDate(medicationRequest.getSubmittedAt() != null ? medicationRequest.getSubmittedAt().toString() : null)
            .build();
    }
    
    /**
     * Gets the WebSocket destination for parent notifications
     * @return The parent WebSocket destination path
     */
    public String getParentDestination() {
        return PARENT_DESTINATION;
    }
    
    /**
     * Gets the WebSocket destination for nurse notifications
     * @return The nurse WebSocket destination path
     */
    public String getNurseDestination() {
        return NURSE_DESTINATION;
    }
    
    /**
     * Determines if parent notifications are targeted
     * @return true (parent notifications are always targeted)
     */
    public boolean isParentNotificationTargeted() {
        return PARENT_IS_TARGETED;
    }
    
    /**
     * Determines if nurse notifications are targeted
     * @return false (nurse notifications are broadcast)
     */
    public boolean isNurseNotificationTargeted() {
        return NURSE_IS_TARGETED;
    }
    
    /**
     * Gets the target user ID for parent notifications
     * @param medicationRequest The source medication instruction
     * @return The parent's account ID
     */
    public String getParentTargetUserId(MedicationInstructionDTO medicationRequest) {
        return medicationRequest.getRequestedByAccountId();
    }
    
    /**
     * Gets the target user ID for nurse notifications (not applicable for broadcast)
     * @param medicationRequest The source medication instruction
     * @return null (nurse notifications are broadcast)
     */
    public String getNurseTargetUserId(MedicationInstructionDTO medicationRequest) {
        return null; // Not used for broadcast notifications
    }
} 