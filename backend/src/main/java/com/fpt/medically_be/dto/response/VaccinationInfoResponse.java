package com.fpt.medically_be.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VaccinationInfoResponse {
    private String vaccineName;
    private Integer doseNumber;
    private LocalDateTime vaccinationDate;
    private String administeredAt;
    private String nurseName;
    private String vaccinationType;
    private String planName;
    private String notes;
    private LocalDate nextDoseDate;

}
