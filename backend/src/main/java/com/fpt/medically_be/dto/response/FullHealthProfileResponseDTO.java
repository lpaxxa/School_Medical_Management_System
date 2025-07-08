package com.fpt.medically_be.dto.response;

import com.fpt.medically_be.dto.HealthProfileDTO;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class FullHealthProfileResponseDTO {
    private HealthProfileDTO healthProfile;
    private List<VaccinationCreateWithHeathResponse> vaccinations;
}