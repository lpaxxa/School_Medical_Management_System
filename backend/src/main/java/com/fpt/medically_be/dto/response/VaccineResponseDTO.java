package com.fpt.medically_be.dto.response;

import lombok.Data;

@Data
public class VaccineResponseDTO {
    private Long vaccineId;
    private String vaccineName;
    private String response;   // ACCEPTED | REJECTED | PENDING
    private String notes;
}
