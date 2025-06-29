package com.fpt.medically_be.dto.request;

import com.fpt.medically_be.entity.HealthCampaignStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthCampaignCreateDTO {
    private String title;
    private LocalDate startDate;
    private String notes;
    private HealthCampaignStatus status;
}
