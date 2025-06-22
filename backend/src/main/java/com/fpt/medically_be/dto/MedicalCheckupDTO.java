package com.fpt.medically_be.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalCheckupDTO {
    private Long id;
    private Long studentId;
    private String studentName;
    private LocalDate checkupDate;
    private String checkupType;
    private Double height;
    private Double weight;
    private Double bmi;
    private String bloodPressure;
    private String visionLeft;
    private String visionRight;
    private String hearingStatus;
    private Integer heartRate;
    private Double bodyTemperature;
    private String diagnosis;
    private String recommendations;
    private Boolean followUpNeeded;
    private Boolean parentNotified;
    private Long medicalStaffId;
    private String medicalStaffName;
}
