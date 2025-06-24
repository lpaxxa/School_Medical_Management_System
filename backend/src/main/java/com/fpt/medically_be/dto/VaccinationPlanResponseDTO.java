package com.fpt.medically_be.dto;

import com.fpt.medically_be.entity.VaccinationPlanStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VaccinationPlanResponseDTO {

    private Long id;
    private String vaccineName;
    private LocalDate vaccinationDate;
    private VaccinationPlanStatus status;
    private String statusVietnamese;
    private String description;
    private LocalDate createdAt;
    private LocalDate updatedAt;
}
