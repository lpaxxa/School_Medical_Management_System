package com.fpt.medically_be.dto.response;

import com.fpt.medically_be.entity.AdministrationStatus;
import lombok.Builder;
import lombok.Data;

import java.util.Date;

@Data
@Builder
public class ParentMedicationAdministrationNotificationDTO {
    private Long administrationId;
    private String medicationName;
    private String studentName;
    private Date administeredAt;
    private String administeredBy;
    private AdministrationStatus administrationStatus;
    private String notes;
    private String message; // User-friendly message for parent
} 