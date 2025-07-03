package com.fpt.medically_be.mapper;

import com.fpt.medically_be.dto.request.MedicationAdministrationRequestDTO;
import com.fpt.medically_be.dto.response.MedicationAdministrationResponseDTO;
import com.fpt.medically_be.entity.MedicationAdministration;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface MedicationAdministrationMapper {

    // Map entity to response DTO
    @Mapping(source = "medicationInstruction.id", target = "medicationInstructionId")
    @Mapping(source = "medicationInstruction.medicationName", target = "medicationName")
    @Mapping(source = "medicationInstruction.frequencyPerDay", target = "frequencyPerDay")
    @Mapping(source = "medicationInstruction.healthProfile.student.fullName", target = "studentName")
    @Mapping(source = "administeredBy.fullName", target = "administeredBy")
    @Mapping(source = "confirmationImageUrl", target = "confirmationImageUrl")
    MedicationAdministrationResponseDTO toResponseDTO(MedicationAdministration entity);

    // Map request DTO to entity (partial - relationships need to be set in service)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "medicationInstruction", ignore = true)
    @Mapping(target = "administeredBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true) // Will be set by @PrePersist
    @Mapping(source = "imgUrl", target = "confirmationImageUrl")
    MedicationAdministration toEntity(MedicationAdministrationRequestDTO dto);
} 