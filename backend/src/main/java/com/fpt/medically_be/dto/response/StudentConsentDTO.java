package com.fpt.medically_be.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fpt.medically_be.entity.SpecialCheckupType;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentConsentDTO {
    
    private Long studentId;
    private String studentName;
    private String className;
    private Long parentId;
    private String parentName;
    private String parentEmail;
    
    // Consent status for special checkup items
    private List<SpecialCheckupConsentStatus> specialCheckupConsents;
    
    // Overall consent response
    private String overallResponse; // "PENDING", "APPROVED", "REJECTED", "PARTIAL"
    private LocalDateTime responseAt;
    private Boolean hasResponded;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SpecialCheckupConsentStatus {
        private SpecialCheckupType checkupType;
        private Boolean isConsented;
        private String parentNote;
    }
}