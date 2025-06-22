package com.fpt.medically_be.dto.request;

import lombok.Data;

import java.time.LocalDate;

@Data
public class VaccinationRequestDTO {

    private String administeredAt;
    private Integer doseNumber;
    private LocalDate nextDoseDate;
    private String notes;
    private LocalDate vaccinationDate;
    private String vaccineName;
    private Long healthProfileId;
    private Long notificationRecipientID;
    private String administeredBy;

}
