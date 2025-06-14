package com.fpt.medically_be.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NonNull;

import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = false)
public class MedicationRequestDTO {
    @NotNull(message = "Student ID is required")
    private Long studentId;

    @NotBlank(message = "Medication name is required")
    @Size(max = 255, message = "Medication name cannot exceed 255 characters")
    private String medicationName;

    @NotBlank(message = "Dosage instructions are required")
    private String dosageInstructions;

    @NotNull(message = "Start date is required")
    @Future(message = "Start date must be in the future")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @NotNull(message = "Frequency per day is required")
    @Min(value = 1, message = "Frequency must be at least 1")
    @Max(value = 6, message = "Frequency cannot exceed 6 times per day")
    private Integer frequencyPerDay;

    @NotBlank(message = "Time of day is required")
    private String timeOfDay; // JSON array: ["morning", "afternoon", "evening"]

    private String specialInstructions;




}
