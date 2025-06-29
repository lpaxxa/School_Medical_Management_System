package com.fpt.medically_be.dto.response;

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
public class HealthCampaignResponseDTO {
    private Long id;
    private String title;
    private LocalDate startDate;
    private String notes;
    private HealthCampaignStatus status;
}
