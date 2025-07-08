package com.fpt.medically_be.dto.response;

import com.fpt.medically_be.entity.HealthCampaignStatus;
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
public class HealthCampaignResponseDTO {
    private Long id;
    private String title;
    private String description; // Mô tả chi tiết về chiến dịch
    private LocalDate startDate;
    private LocalDate endDate; // Ngày kết thúc chiến dịch
    private String notes;
    private HealthCampaignStatus status;
    private List<String> specialCheckupItems; // Danh sách các mục kiểm tra đặc biệt

    // Thông tin thống kê
    private Long totalStudents; // Tổng số học sinh trong chiến dịch
    private Long consentedStudents; // Số học sinh có sự đồng ý của phụ huynh
    private Long completedCheckups; // Số học sinh đã hoàn thành khám
    private Long followUpCheckups; // Số học sinh cần theo dõi thêm

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
