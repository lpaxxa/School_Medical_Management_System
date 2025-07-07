package com.fpt.medically_be.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.EqualsAndHashCode;


import java.time.LocalDate;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = false)
public class MedicationRequestDTO {

    private Long studentId;

    @NotBlank(message = "Medicine name is required")
    @Size(max = 255, message = "Medicine name cannot exceed 255 characters")
    private String medicineName;

    @NotBlank(message = "Dosage is required")
    private String dosage;

    @NotNull(message = "Frequency is required")
    private Integer frequency;

    @NotNull(message = "Start date is required")
    @FutureOrPresent(message = "Start date must be today or in the future")
    private LocalDate startDate;

    @FutureOrPresent(message = "Start date must be today or in the future")
    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @NotEmpty(message = "Time to take is required")
    private List<String> timeToTake;

    private String notes;

    // Optional fields for image upload
    private String prescriptionImageBase64; // Base64 encoded image

}
