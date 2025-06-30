package com.fpt.medically_be.mapper;

import com.fpt.medically_be.dto.VaccinationDTO;
import com.fpt.medically_be.dto.request.VaccinationRequestDTO;
import com.fpt.medically_be.dto.response.VaccinationDetailResponse;
import com.fpt.medically_be.entity.Vaccination;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface VaccinationMapper {

    @Mapping(source = "healthProfile.id", target = "healthProfileId")
    @Mapping(source = "healthProfile.student.id",target = "studentName")
    @Mapping(source = "notificationRecipient.response", target = "parentResponse")
    @Mapping(source = "nurse.fullName", target = "administeredBy")
    @Mapping(source = "nurse.id", target = "administeredById")
    VaccinationDTO toDTO(Vaccination vaccination);

    @Mapping(source = "notificationRecipient.id", target = "notificationRecipientId")
    @Mapping(source = "healthProfile.student.studentId", target = "studentId")
    @Mapping(source = "healthProfile.student.fullName", target = "studentName")
    @Mapping(source = "healthProfile.student.className", target = "className")
    @Mapping(source = "nurse.fullName", target = "administeredBy")
    VaccinationDetailResponse toVaccinationDetailResponse(Vaccination vaccinationDetailResponse);

    Vaccination toVaccinationDetailRequest(VaccinationRequestDTO vaccination);

}
