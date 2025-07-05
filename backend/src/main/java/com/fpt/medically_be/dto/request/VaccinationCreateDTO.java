package com.fpt.medically_be.dto.request;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class VaccinationCreateDTO {
    private Long healthProfileId;
    private Long vaccineId;
    private Long vaccinationPlanId;
    private Long nurseId;
    private LocalDateTime vaccinationDate;
    private Integer doseNumber;
    private String administeredAt;
    private String notes;
}
