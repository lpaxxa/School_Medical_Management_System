package com.fpt.medically_be.mapper;

import com.fpt.medically_be.dto.VaccinationDTO;
import com.fpt.medically_be.dto.response.VaccinationDetailResponse;
import com.fpt.medically_be.entity.Vaccination;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface VaccinationMapper {

    VaccinationDTO toDTO(Vaccination vaccination);

    @Mapping(source = "notificationRecipient.id", target = "notificationRecipientId")
    @Mapping(source = "healthProfile.student.studentId", target = "studentId")
    @Mapping(source = "healthProfile.student.fullName", target = "studentName")
    @Mapping(source = "healthProfile.student.className", target = "className")
    @Mapping(source = "nurse.fullName", target = "administeredBy")
    VaccinationDetailResponse toVaccinationDetailResponse(Vaccination vaccinationDetailResponse);

}
