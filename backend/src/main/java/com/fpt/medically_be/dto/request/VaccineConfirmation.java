package com.fpt.medically_be.dto.request;

import com.fpt.medically_be.entity.ResponseStatus;
import lombok.Data;

@Data
public class VaccineConfirmation {
    private Long vaccineId;
    private ResponseStatus response; // APPROVED, REJECTED
    private String parentNotes;
}
