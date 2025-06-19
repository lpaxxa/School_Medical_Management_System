package com.fpt.medically_be.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class HealthProfileRequestDTO {
    private Long studentId;
    @NotBlank(message = "Blood type must not be blank")
    @Pattern(regexp = "^(A|B|AB|O)[+-]$", message = "Blood type must be valid (A+, B-, AB+, O+, etc.)")
    private String bloodType;

    @DecimalMin(value = "0.0", message = "Height cannot be negative")
    @DecimalMax(value = "300.0", message = "Height exceeds maximum value")
    private Double height;

    @DecimalMin(value = "0.0", message = "Weight cannot be negative")
    @DecimalMax(value = "500.0", message = "Weight exceeds maximum value")
    private Double weight;
    private String allergies;
    private String chronicDiseases;
    @Pattern(regexp = "^(6/\\d+|20/\\d+)$", message = "Vision format should be like 6/6, 20/20, etc.")
    private String visionLeft;
    @Pattern(regexp = "^(6/\\d+|20/\\d+)$", message = "Vision format should be like 6/6, 20/20, etc.")
    private String visionRight;
    private String hearingStatus;
    private String dietaryRestrictions;
    @Pattern(regexp = "^(\\+?[0-9]{10,15})$", message = "Emergency contact should be a valid phone number (10-15 digits)")
    private String emergencyContactInfo;
    private String immunizationStatus;
    private LocalDate lastPhysicalExamDate;
    private String specialNeeds;


}
