package com.fpt.medically_be.dto.response;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class VaccinationDetailResponse {

    private Long notificationRecipientId; // ID của người nhận thông báo
    private String studentId;         // Mã học sinh
    private String studentName;        // Họ tên học sinh
    private String className;
    private String vaccineName;      // Vaccine
    private LocalDateTime vaccinationDate; // Ngày tiêm (cả ngày và giờ nếu bạn có trường giờ)
    private String administeredAt;   // Nơi tiêm
    private String administeredBy;   // Người tiêm
    private Integer doseNumber;
    private LocalDate nextDoseDate;
    private String notes;
}
