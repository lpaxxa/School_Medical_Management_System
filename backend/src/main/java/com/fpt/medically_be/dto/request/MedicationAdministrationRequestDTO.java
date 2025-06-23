package com.fpt.medically_be.dto.request;

import com.fpt.medically_be.entity.AdministrationStatus;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MedicationAdministrationRequestDTO {
    
    @NotNull(message = "Medication instruction ID is required")
    private Long medicationInstructionId;
    
    @NotNull(message = "Administration time is required")
    private LocalDateTime administeredAt;
    
    @NotNull(message = "Administration status is required")
    private AdministrationStatus administrationStatus;
    
    @Size(max = 1000, message = "Notes too long")
    private String notes; // Combined: dosage given, student response, side effects, etc.
} 