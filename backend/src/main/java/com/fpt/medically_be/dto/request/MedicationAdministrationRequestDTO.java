package com.fpt.medically_be.dto.request;


import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MedicationAdministrationRequestDTO {
    
    @NotNull(message = "Medication instruction ID is required")
    private Long medicationInstructionId;
    
    @NotNull(message = "Administration time is required")
    private LocalDateTime administeredAt;

//    @NotNull(message = "Frequency per day is required")
//    @Min(value = 0, message = "Frequency cannot be negative")
//    private Integer frequencyPerDay;
    
//    @NotNull(message = "Administration status is required")
////    private AdministrationStatus administrationStatus;
//    private Status administrationStatus;
    
    @Size(max = 1000, message = "Notes too long")
    private String notes; // Combined: dosage given, student response, side effects, etc.
    
    @Size(max = 500, message = "Image URL too long")
    private String imgUrl; // Optional image URL for photos of child taking medicine
} 