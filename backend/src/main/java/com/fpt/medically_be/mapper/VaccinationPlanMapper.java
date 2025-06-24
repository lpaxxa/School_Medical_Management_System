package com.fpt.medically_be.mapper;

import com.fpt.medically_be.dto.VaccinationPlanRequestDTO;
import com.fpt.medically_be.dto.VaccinationPlanResponseDTO;
import com.fpt.medically_be.entity.VaccinationPlan;
import org.springframework.stereotype.Component;

@Component
public class VaccinationPlanMapper {

    public VaccinationPlan toEntity(VaccinationPlanRequestDTO dto) {
        return VaccinationPlan.builder()
                .vaccineName(dto.getVaccineName())
                .vaccinationDate(dto.getVaccinationDate())
                .status(dto.getStatus())
                .description(dto.getDescription())
                .build();
    }

    public void updateEntityFromDTO(VaccinationPlan entity, VaccinationPlanRequestDTO dto) {
        entity.setVaccineName(dto.getVaccineName());
        entity.setVaccinationDate(dto.getVaccinationDate());
        entity.setStatus(dto.getStatus());
        entity.setDescription(dto.getDescription());
    }

    public VaccinationPlanResponseDTO toDTO(VaccinationPlan entity) {
        return VaccinationPlanResponseDTO.builder()
                .id(entity.getId())
                .vaccineName(entity.getVaccineName())
                .vaccinationDate(entity.getVaccinationDate())
                .status(entity.getStatus())
                .statusVietnamese(entity.getStatus().getVietnameseName())
                .description(entity.getDescription())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
