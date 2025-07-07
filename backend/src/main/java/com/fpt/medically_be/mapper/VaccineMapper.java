package com.fpt.medically_be.mapper;

import com.fpt.medically_be.dto.response.VaccineResponse;
import com.fpt.medically_be.entity.Vaccine;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface VaccineMapper {

    VaccineResponse toEntityResponse(Vaccine vaccination);

}
