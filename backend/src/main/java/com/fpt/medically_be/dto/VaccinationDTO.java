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
public class VaccinationDTO {
    private Long id;
    private Long healthProfileId;
    private String studentName;
    private String vaccineName;
    private LocalDate vaccinationDate;
    private LocalDate nextDoseDate;
    private Integer doseNumber;
    private String administeredBy;
    private String administeredAt;
    private String notes;
    private Boolean parentConsent;
}
