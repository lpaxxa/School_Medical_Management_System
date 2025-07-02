package com.fpt.medically_be.dto.response;

import com.fpt.medically_be.base.BaseMapper;
import com.fpt.medically_be.entity.MedicationInstruction;
import com.fpt.medically_be.entity.Status;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.logging.Logger;

@EqualsAndHashCode(callSuper = true)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicationInstructionDTO extends BaseMapper<MedicationInstruction, MedicationInstructionDTO> {
        private static final Logger logger = Logger.getLogger(MedicationInstructionDTO.class.getName());
        // System fields
        private Long id;
        private LocalDate submittedAt; // Date when the request was created

        // Student/Parent info (for display)
        private Long healthProfileId;
        private String studentName;
        private String studentClass;
        private String studentId;

        private String requestedBy; // Parent's name who made the request
        private String requestedByAccountId; // Parent's account ID for notifications

        // Medication details
        private String medicationName;
        private String dosageInstructions;
        private LocalDate startDate;
        private LocalDate endDate;
        private Integer frequencyPerDay;
        private String timeOfDay; // morning afternoon before lunch....
        private String specialInstructions;

        // System flags
        private Boolean parentProvided; // Always true for parent requests

        // Approval workflow
        private Status status; // PENDING_APPROVAL, APPROVED, REJECTED, NEEDS_MORE_INFO
        private String rejectionReason;

        private String approvedBy; // For display
        private LocalDateTime responseDate; // Date when the request was approved or rejected

    @Override
    public MedicationInstruction toEntity(MedicationInstructionDTO dto) {
        if (dto == null) {
            return null;
        }

        MedicationInstruction entity = new MedicationInstruction();
        entity.setId(dto.getId());
        entity.setMedicationName(dto.getMedicationName());
        entity.setDosageInstructions(dto.getDosageInstructions());
        entity.setStartDate(dto.getStartDate());
        entity.setEndDate(dto.getEndDate());
        entity.setFrequencyPerDay(dto.getFrequencyPerDay());
        entity.setTimeOfDay(dto.getTimeOfDay());
        entity.setSpecialInstructions(dto.getSpecialInstructions());
        entity.setParentProvided(dto.getParentProvided());
        entity.setSubmittedAt(dto.getSubmittedAt());
        entity.setStatus(dto.getStatus());
        entity.setRejectionReason(dto.getRejectionReason());
        entity.setResponseDate(dto.getResponseDate());


        // Note: Relationships (healthProfile, requestedBy, approvedBy) need to be set separately
        // because you need to fetch them from repositories

        return entity;
    }

    @Override
        public MedicationInstructionDTO toObject(MedicationInstruction entity) {
                if (entity == null) {
                        return null;
                }
                
                try {
                        this.id = entity.getId();
                        this.submittedAt = entity.getSubmittedAt();

                        // Health profile and related information with comprehensive null safety
                        try {
                                if (entity.getHealthProfile() != null) {
                                        this.healthProfileId = entity.getHealthProfile().getId();
                                        if (entity.getHealthProfile().getStudent() != null) {
                                                this.studentName = entity.getHealthProfile().getStudent().getFullName();
                                                this.studentClass = entity.getHealthProfile().getStudent().getClassName();
                                                this.studentId = entity.getHealthProfile().getStudent().getStudentId();
                                        } else {
                                                // Fallback values for missing student data
                                                this.studentName = "Unknown Student";
                                                this.studentClass = "Unknown Class";
                                                this.studentId = "Unknown ID";
                                        }
                                } else {
                                        // Fallback values for missing health profile
                                        this.healthProfileId = null;
                                        this.studentName = "No Health Profile";
                                        this.studentClass = "No Class";
                                        this.studentId = "No ID";
                                }
                        } catch (Exception e) {
                                logger.warning("Error accessing health profile data for medication instruction ID " + entity.getId() + ": " + e.getMessage());
                                // Set safe fallback values
                                this.healthProfileId = null;
                                this.studentName = "Data Error";
                                this.studentClass = "Data Error";
                                this.studentId = "Data Error";
                        }

                        // Parent information with null safety
                        try {
                                if (entity.getRequestedBy() != null) {
                                        this.requestedBy = entity.getRequestedBy().getFullName(); // Set parent's name
                                        
                                        // Set parent's account ID for notifications
                                        if (entity.getRequestedBy().getAccount() != null) {
                                                this.requestedByAccountId = entity.getRequestedBy().getAccount().getId();
                                        } else {
                                                this.requestedByAccountId = null;
                                        }
                                } else {
                                        this.requestedBy = "Unknown Parent";
                                        this.requestedByAccountId = null;
                                }
                        } catch (Exception e) {
                                logger.warning("Error accessing parent data for medication instruction ID " + entity.getId() + ": " + e.getMessage());
                                this.requestedBy = "Data Error";
                                this.requestedByAccountId = null;
                        }

                        // Medication details with null safety
                        this.medicationName = entity.getMedicationName() != null ? entity.getMedicationName() : "Unknown Medicine";
                        this.dosageInstructions = entity.getDosageInstructions() != null ? entity.getDosageInstructions() : "No instructions";
                        this.startDate = entity.getStartDate();
                        this.endDate = entity.getEndDate();
                        this.frequencyPerDay = entity.getFrequencyPerDay();
                        this.timeOfDay = entity.getTimeOfDay() != null ? entity.getTimeOfDay() : "Not specified";
                        this.specialInstructions = entity.getSpecialInstructions();
                        this.parentProvided = entity.getParentProvided() != null ? entity.getParentProvided() : false;

                        // Approval workflow with null safety
                        this.status = entity.getStatus() != null ? entity.getStatus() : Status.PENDING_APPROVAL;
                        this.rejectionReason = entity.getRejectionReason();
                        
                        try {
                                if (entity.getApprovedBy() != null) {
                                        this.approvedBy = entity.getApprovedBy().getFullName();
                                } else {
                                        this.approvedBy = null;
                                }
                        } catch (Exception e) {
                                logger.warning("Error accessing approver data for medication instruction ID " + entity.getId() + ": " + e.getMessage());
                                this.approvedBy = "Data Error";
                        }
                        
                        this.responseDate = entity.getResponseDate();

                        return this;
                        
                } catch (Exception e) {
                        logger.severe("Critical error transforming MedicationInstruction entity to DTO for ID " + 
                                     (entity.getId() != null ? entity.getId() : "null") + ": " + e.getMessage());
                        
                        // Return a safe fallback DTO to prevent complete failure
                        MedicationInstructionDTO fallbackDto = new MedicationInstructionDTO();
                        fallbackDto.id = entity.getId();
                        fallbackDto.medicationName = "Data Error - Please Contact Support";
                        fallbackDto.dosageInstructions = "Unable to load";
                        fallbackDto.studentName = "Unable to load";
                        fallbackDto.requestedBy = "Unable to load";
                        fallbackDto.status = Status.PENDING_APPROVAL;
                        fallbackDto.parentProvided = false;
                        
                        return fallbackDto;
                }
        }
}
