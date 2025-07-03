package com.fpt.medically_be.dto.request;

import com.fpt.medically_be.entity.CheckupStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalCheckupRequestDTO {
    // Thông tin liên kết
    private Long studentId;
    private Long healthCampaignId;
    private Long parentConsentId;
    private Long medicalStaffId;

    // Thông tin kiểm tra
    private LocalDate checkupDate;
    private String checkupType;
    private CheckupStatus checkupStatus;

    // Các mục kiểm tra đặc biệt theo yêu cầu của phụ huynh
    private List<String> specialCheckupItems;

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

    // Kết quả kiểm tra
    private String diagnosis;
    private String recommendations;
    private Boolean followUpNeeded;
}
