package com.fpt.medically_be.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fpt.medically_be.entity.SpecialCheckupType;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalCheckupCreateRequestDTO {
    
    private Long healthCampaignId;
    private String checkupType;
    private LocalDate checkupDate;
    private String notes;
    
    // List of student IDs for this checkup campaign
    private List<Long> studentIds;
    
    // Special checkup items that require parent consent
    private List<SpecialCheckupType> specialCheckupItems;
    
    // Created by nurse/admin
    private Long createdByNurseId;
    
    // Optional: Auto-notify parents when creating
    private Boolean autoNotifyParents = true;
}