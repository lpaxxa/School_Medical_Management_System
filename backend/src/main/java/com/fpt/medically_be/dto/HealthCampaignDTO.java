package com.fpt.medically_be.dto;

import com.fpt.medically_be.entity.HealthCampaignStatus;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class HealthCampaignDTO {
    private Long id;
    private String title;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private String notes;
    private HealthCampaignStatus status;
    private List<String> specialCheckupItems = new ArrayList<>(); // Các mục khám đặc biệt của chiến dịch

    // Thông tin thống kê
    private Long totalStudents; // Tổng số học sinh trong chiến dịch
    private Long consentedStudents; // Số học sinh có sự đồng ý của phụ huynh
    private Long completedCheckups; // Số học sinh đã hoàn thành khám
    private Long pendingCheckups; // Số học sinh đang chờ khám
    private Long followUpNeeded; // Số học sinh cần theo dõi thêm

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
