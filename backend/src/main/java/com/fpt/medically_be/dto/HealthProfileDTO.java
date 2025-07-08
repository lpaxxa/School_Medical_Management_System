package com.fpt.medically_be.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

import java.time.LocalDate;
import com.fpt.medically_be.entity.CheckupStatus;

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
    private CheckupStatus checkupStatus;

}
