package com.fpt.medically_be.dto.response;


import com.fpt.medically_be.entity.Status;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MedicationAdministrationResponseDTO {
    private Long id;
    private Long medicationInstructionId;
    private String medicationName;
    private String studentName;
    private LocalDateTime administeredAt;
    private Integer frequencyPerDay;
    private String administeredBy; // Nurse name
    private Status administrationStatus;
    private String notes; // Combined: dosage, response, side effects, refusal reason, etc.
    private String confirmationImageUrl; // URL của ảnh xác nhận đã cho uống thuốc
}

