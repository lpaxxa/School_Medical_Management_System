package com.fpt.medically_be.dto.response;

import com.fpt.medically_be.entity.Status;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ParentMedicationAdministrationNotificationDTO {
    private Long administrationId;
    private String medicationName;
    private String studentName;
    private LocalDateTime administeredAt;
    private String administeredBy;
    private Status administrationStatus;
    private String notes;
    private String message; // User-friendly message for parent
} 