package com.fpt.medically_be.dto.request;

import com.fpt.medically_be.entity.HealthCampaignStatus;
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
public class HealthCampaignCreateDTO {
    private String title;
    private String description; // Mô tả chi tiết về chiến dịch
    private LocalDate startDate;
    private LocalDate endDate; // Ngày kết thúc chiến dịch
    private String notes;
    private HealthCampaignStatus status;
    private List<String> specialCheckupItems; // Danh sách các mục kiểm tra đặc biệt
}
