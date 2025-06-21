package com.fpt.medically_be.mapper;

import com.fpt.medically_be.dto.VaccinationDTO;
import com.fpt.medically_be.entity.Vaccination;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface VaccinationMapper {

    VaccinationDTO toDTO(Vaccination vaccination);
}
