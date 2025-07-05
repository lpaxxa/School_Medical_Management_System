package com.fpt.medically_be.dto.request;

import lombok.Data;

@Data
public class VaccinationUpdateNoteRequest {
    private Long vaccinationId;
    private String notes;
}
