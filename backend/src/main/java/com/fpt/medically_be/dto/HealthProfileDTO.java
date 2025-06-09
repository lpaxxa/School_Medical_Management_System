package com.fpt.medically_be.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthProfileDTO {
    private Long id;
    private String bloodType;
    private Double height;
    private Double weight;
    private Double bmi;
    private String allergies;
    private String chronicDiseases;
    private String treatmentHistory;
    private String visionLeft;
    private String visionRight;
    private String hearingStatus;
}
