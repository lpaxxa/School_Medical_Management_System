package com.fpt.medically_be.mapper;

import com.fpt.medically_be.dto.request.VaccineConfirmation;
import com.fpt.medically_be.dto.response.VaccineResponseDTO;
import com.fpt.medically_be.entity.NotificationRecipientVaccine;
import com.fpt.medically_be.service.NotificationRecipientVaccineService;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface NotificationRecipientVaccineMapper {

    NotificationRecipientVaccine toEntity(VaccineConfirmation confirmation);

    @Mapping(source = "vaccine.id",   target = "vaccineId")
    @Mapping(source = "vaccine.name", target = "vaccineName")
    @Mapping(source = "response",     target = "response")   // enum -> String (MapStruct tự .name())
    @Mapping(source = "parentNotes",  target = "notes")
    VaccineResponseDTO toDto(NotificationRecipientVaccine nrv);

}
