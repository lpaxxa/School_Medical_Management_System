package com.fpt.medically_be.dto.request;

import com.fpt.medically_be.entity.VaccinationPlanStatus;
import lombok.Data;

@Data
public class VaccinationPlanStatusUpdateRequest {
    private VaccinationPlanStatus status;

}
