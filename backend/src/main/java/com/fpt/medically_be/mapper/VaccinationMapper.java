package com.fpt.medically_be.mapper;

import com.fpt.medically_be.dto.request.VaccinationRequestDTO;
import com.fpt.medically_be.dto.response.VaccinationCreateWithHeathResponse;

import com.fpt.medically_be.dto.response.VaccineResponse;
import com.fpt.medically_be.entity.Vaccination;
import com.fpt.medically_be.entity.Vaccine;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Mapper(componentModel = "spring")
public interface VaccinationMapper {

    Vaccination toEntity(VaccinationRequestDTO dto);

    @Mapping(source = "vaccinationDate", target = "vaccinationDate")
    @Mapping(source = "vaccine.name", target = "vaccineName")
    VaccinationCreateWithHeathResponse toCreateWithHealthResponse(Vaccination vaccination);
    default LocalDate map(LocalDateTime vaccinationDate) {
        return vaccinationDate == null ? null : vaccinationDate.toLocalDate();
    }

}
