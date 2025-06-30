package com.fpt.medically_be.dto;

import com.fpt.medically_be.entity.SpecialCheckupType;
import lombok.Data;

@Data
public class SpecialCheckupConsentDTO {
    private Long id;
    private SpecialCheckupType checkupType;
    private String checkupDisplayName;
    private Boolean isConsented;
    private String parentNote;

    public SpecialCheckupConsentDTO() {}

    public SpecialCheckupConsentDTO(SpecialCheckupType checkupType) {
        this.checkupType = checkupType;
        this.checkupDisplayName = checkupType.getDisplayName();
        this.isConsented = null; // Chưa có phản hồi
    }
}
