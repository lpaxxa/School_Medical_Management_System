package com.fpt.medically_be.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class FullHealthProfileRequestDTO {
    @NotNull
    @Valid
    private HealthProfileRequestDTO healthProfile;

    @Valid
    private List<VaccinationRequestDTO> vaccinations;
}
