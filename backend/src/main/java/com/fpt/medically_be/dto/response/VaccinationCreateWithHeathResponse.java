package com.fpt.medically_be.dto.response;

import com.fpt.medically_be.entity.VaccinationType;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class VaccinationCreateWithHeathResponse {
    private Long id;
    private String vaccineName;
    private Integer doseNumber;
    private LocalDate vaccinationDate;
    private String administeredAt;
    private String notes;
    private String parentNotes;
    private LocalDate nextDoseDate;
    private VaccinationType vaccinationType;


}
