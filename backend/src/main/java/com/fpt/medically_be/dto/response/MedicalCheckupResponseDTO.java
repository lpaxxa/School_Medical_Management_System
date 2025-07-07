package com.fpt.medically_be.dto.response;

import com.fpt.medically_be.entity.CheckupStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalCheckupResponseDTO {
    private Long id;

    // Thông tin học sinh
    private Long studentId;
    private String studentName;
    private String studentClass;

    // Thông tin chiến dịch
    private Long healthCampaignId;
    private String campaignTitle;

    // Thông tin đồng ý của phụ huynh
    private Long parentConsentId;
    private List<String> specialCheckupItems;

    // Thông tin kiểm tra
    private LocalDate checkupDate;
    private String checkupType;
    private CheckupStatus checkupStatus;

    // Dữ liệu kiểm tra
    private Double height;
    private Double weight;
    private Double bmi;
    private String bloodPressure;
    private String visionLeft;
    private String visionRight;
    private String hearingStatus;
    private Integer heartRate;
    private Double bodyTemperature;
    private String diagnosis;
    private String recommendations;
    private Boolean followUpNeeded;
    private Boolean parentNotified;

    // Thông tin nhân viên y tế
    private Long medicalStaffId;
    private String medicalStaffName;

    // Thông tin thời gian
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
