package com.fpt.medically_be.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ParentConsentDTO {
    private Long id;
    private Long healthCampaignId;
    private String campaignTitle;
    private Long studentId;
    private String studentName;
    private Long parentId;
    private String parentName;
    private Boolean consentGiven;
    private LocalDateTime consentDate;
    private List<String> specialCheckupItems; // Các mục kiểm tra đặc biệt mà phụ huynh đồng ý
    private String parentNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
