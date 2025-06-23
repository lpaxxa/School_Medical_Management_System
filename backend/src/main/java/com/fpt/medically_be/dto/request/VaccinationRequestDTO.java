package com.fpt.medically_be.dto.request;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class VaccinationRequestDTO {

    private String administeredAt;
    private Integer doseNumber;
    private LocalDate nextDoseDate;
    private String notes;
//    private LocalDateTime vaccinationDate;
    private String vaccineName;
    private Long healthProfileId;
    private Long notificationRecipientID;
    private Long administeredBy;

}
