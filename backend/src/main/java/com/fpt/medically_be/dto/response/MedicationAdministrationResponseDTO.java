package com.fpt.medically_be.dto.response;

import com.fpt.medically_be.entity.AdministrationStatus;
import lombok.Data;

import java.util.Date;

@Data
public class MedicationAdministrationResponseDTO {
    private Long id;
    private Long medicationInstructionId;
    private String medicationName;
    private String studentName;
    private Date administeredAt;
    private String administeredBy; // Nurse name
    private AdministrationStatus administrationStatus;
    private String notes; // Combined: dosage, response, side effects, refusal reason, etc.
    private String confirmationImageUrl; // URL của ảnh xác nhận đã cho uống thuốc
}

