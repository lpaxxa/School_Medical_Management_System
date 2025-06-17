package com.fpt.medically_be.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthProfileDTO {
    private Long id;

    private String bloodType;


    private Double height;
private Double bmi;

    private Double weight;
    private String allergies;
    private String chronicDiseases;

    private String visionLeft;

    private String visionRight;
    private String hearingStatus;

    private String dietaryRestrictions;

    private String emergencyContactInfo;
    private String immunizationStatus;
    private LocalDate lastPhysicalExamDate;
    private String specialNeeds;
   
    private LocalDateTime lastUpdated;

}
