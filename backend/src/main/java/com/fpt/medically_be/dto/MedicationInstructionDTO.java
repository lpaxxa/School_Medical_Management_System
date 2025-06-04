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
public class MedicationInstructionDTO {
    private Long id;
    private Long healthProfileId;
    private String studentName;
    private String medicationName;
    private String dosageInstructions;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer frequencyPerDay;
    private String timeOfDay;
    private String specialInstructions;
    private Boolean parentProvided;
    private String prescribedBy;
    private LocalDate createdDate;
    private String status;
}
