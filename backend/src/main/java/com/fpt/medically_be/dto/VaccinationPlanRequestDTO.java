package com.fpt.medically_be.dto;

import com.fpt.medically_be.entity.VaccinationPlanStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VaccinationPlanRequestDTO {

    @NotBlank(message = "Tên vaccine không được để trống")
    private String vaccineName;

    @NotNull(message = "Ngày tiêm không được để trống")
    private LocalDate vaccinationDate;

    @NotNull(message = "Trạng thái không được để trống")
    private VaccinationPlanStatus status;

    private String description;
}

