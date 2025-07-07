package com.fpt.medically_be.dto.response;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class VaccinationCreateWithHeathResponse {
    private Long id;
    private Integer doseNumber;
    private LocalDate vaccinationDate;
    private String administeredAt;
    private String notes;
    private String parentNotes;

}
