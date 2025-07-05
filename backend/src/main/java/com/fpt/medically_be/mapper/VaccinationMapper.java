package com.fpt.medically_be.mapper;

import com.fpt.medically_be.dto.VaccinationDTO;
import com.fpt.medically_be.dto.request.MedicalIncidentCreateDTO;
import com.fpt.medically_be.dto.request.VaccinationRequestDTO;
import com.fpt.medically_be.dto.response.VaccinationCreateWithHeathResponse;

import com.fpt.medically_be.entity.MedicalIncident;
import com.fpt.medically_be.entity.Vaccination;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Mapper(componentModel = "spring")
public interface VaccinationMapper {

    Vaccination toEntity(VaccinationRequestDTO dto);

    @Mapping(source = "vaccinationDate", target = "vaccinationDate")
    VaccinationCreateWithHeathResponse toCreateWithHealthResponse(Vaccination vaccination);
    default LocalDate map(LocalDateTime vaccinationDate) {
        return vaccinationDate == null ? null : vaccinationDate.toLocalDate();
    }
}
