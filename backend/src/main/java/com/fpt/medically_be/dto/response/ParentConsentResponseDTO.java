package com.fpt.medically_be.dto.response;

import com.fpt.medically_be.entity.ConsentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParentConsentResponseDTO {
    private Long id;

    // Thông tin chiến dịch
    private Long healthCampaignId;
    private String campaignTitle;
    private String campaignDescription; // Thêm trường mô tả chiến dịch

    // Thông tin học sinh
    private Long studentId;
    private String studentName;
    private String studentClass;

    // Thông tin phụ huynh
    private Long parentId;
    private String parentName;

    // Thông tin đồng ý
    private ConsentStatus consentStatus;
    private LocalDateTime consentDate;

    // Các mục kiểm tra đặc biệt đã đồng ý
    private List<String> specialCheckupItems;

    // Ghi chú của phụ huynh
    private String parentNotes;

    // Thông tin thời gian
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
