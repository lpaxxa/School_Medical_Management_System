package com.fpt.medically_be.mapper;

import com.fpt.medically_be.dto.response.MedicationAdministrationResponseDTO;
import com.fpt.medically_be.dto.response.MedicationInstructionDTO;
import com.fpt.medically_be.dto.response.NurseMedicationNotificationDTO;
import com.fpt.medically_be.dto.response.ParentMedicationAdministrationNotificationDTO;
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
    private static final String PARENT_ADMINISTRATION_DESTINATION = "/queue/medication-administration";
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
     * Maps MedicationAdministrationResponseDTO to ParentMedicationAdministrationNotificationDTO
     * @param administrationRecord The medication administration record
     * @return The parent administration notification DTO
     */
    public ParentMedicationAdministrationNotificationDTO mapToParentAdministrationNotification(MedicationAdministrationResponseDTO administrationRecord) {
        String message = generateAdministrationMessage(administrationRecord);
        
        return ParentMedicationAdministrationNotificationDTO.builder()
            .administrationId(administrationRecord.getId())
            .medicationName(administrationRecord.getMedicationName())
            .studentName(administrationRecord.getStudentName())
            .administeredAt(administrationRecord.getAdministeredAt())
            .administeredBy(administrationRecord.getAdministeredBy())
            .administrationStatus(administrationRecord.getAdministrationStatus())
            .notes(administrationRecord.getNotes())
            .message(message)
            .build();
    }
    
    /**
     * Generates a user-friendly message for parents about medication administration
     */
    private String generateAdministrationMessage(MedicationAdministrationResponseDTO record) {
        switch (record.getAdministrationStatus()) {
            case FULLY_TAKEN:
                return String.format("Your child %s has successfully received %s at %s.", 
                    record.getStudentName(), record.getMedicationName(), 
                    record.getAdministeredAt().toString());
            case PARTIALLY_TAKEN:
                return String.format("Your child %s refused to take %s. Please contact the school for more details.", 
                    record.getStudentName(), record.getMedicationName());
            case NOT_TAKEN:
                return String.format("Your child %s received only a partial dose of %s. Please check the notes for details.", 
                    record.getStudentName(), record.getMedicationName());
            case ISSUE:
                return String.format("There was an issue administering %s to your child %s. Please contact the school.", 
                    record.getMedicationName(), record.getStudentName());
            default:
                return String.format("Medication administration update for your child %s regarding %s.", 
                    record.getStudentName(), record.getMedicationName());
        }
    }
    
    /**
     * Gets the WebSocket destination for parent notifications
     * @return The parent WebSocket destination path
     */
    public String getParentDestination() {
        return PARENT_DESTINATION;
    }
    
    /**
     * Gets the WebSocket destination for parent administration notifications
     * @return The parent administration WebSocket destination path
     */
    public String getParentAdministrationDestination() {
        return PARENT_ADMINISTRATION_DESTINATION;
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
    
    /**
     * Gets the parent account ID for administration notifications
     * Note: This method assumes the parent account ID is passed separately 
     * since MedicationAdministrationResponseDTO doesn't contain parent info
     * @param administrationRecord The administration record (for future use)
     * @return null (parent account ID should be retrieved from medication instruction)
     */
    public String getParentAccountIdForAdministration(MedicationAdministrationResponseDTO administrationRecord) {
        // This method is for future use if we decide to include parent info in the response DTO
        // For now, the service layer handles getting the parent account ID from the medication instruction
        return null;
    }
} 