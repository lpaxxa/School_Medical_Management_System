package com.fpt.medically_be.mapper;

import com.fpt.medically_be.base.BaseMapper;
import com.fpt.medically_be.dto.HealthProfileDTO;
import com.fpt.medically_be.dto.request.HealthProfileRequestDTO;
import com.fpt.medically_be.entity.HealthProfile;
import org.springframework.stereotype.Component;

@Component
public class HealthProfileMapper extends BaseMapper<HealthProfile, HealthProfileDTO> {

    @Override
    public HealthProfileDTO toObject(HealthProfile entity) {
        if (entity == null) {
            return null;
        }

        HealthProfileDTO dto = new HealthProfileDTO();
        dto.setId(entity.getId());
        dto.setBloodType(entity.getBloodType());
        dto.setHeight(entity.getHeight());
        dto.setWeight(entity.getWeight());
        dto.setBmi(entity.getBmi());
        dto.setAllergies(entity.getAllergies());
        dto.setChronicDiseases(entity.getChronicDiseases());
        dto.setVisionLeft(entity.getVisionLeft());
        dto.setVisionRight(entity.getVisionRight());
        dto.setHearingStatus(entity.getHearingStatus());
        dto.setDietaryRestrictions(entity.getDietaryRestrictions());
        dto.setEmergencyContactInfo(entity.getEmergencyContactInfo());
        dto.setImmunizationStatus(entity.getImmunizationStatus());
        dto.setLastPhysicalExamDate(entity.getLastPhysicalExamDate());
        dto.setSpecialNeeds(entity.getSpecialNeeds());



        return dto;
    }

    @Override
    public HealthProfile toEntity(HealthProfileDTO dto) {
        if (dto == null) {
            return null;
        }

        HealthProfile entity = new HealthProfile();
        if (dto.getId() != null) {
            entity.setId(dto.getId());
        }
        entity.setBloodType(dto.getBloodType());
        entity.setHeight(dto.getHeight());
        entity.setWeight(dto.getWeight());
        entity.setBmi(dto.getBmi());
        entity.setAllergies(dto.getAllergies());
        entity.setChronicDiseases(dto.getChronicDiseases());
        entity.setVisionLeft(dto.getVisionLeft());
        entity.setVisionRight(dto.getVisionRight());
        entity.setHearingStatus(dto.getHearingStatus());
        entity.setDietaryRestrictions(dto.getDietaryRestrictions());
        entity.setEmergencyContactInfo(dto.getEmergencyContactInfo());
        entity.setImmunizationStatus(dto.getImmunizationStatus());
        entity.setLastPhysicalExamDate(dto.getLastPhysicalExamDate());
        entity.setSpecialNeeds(dto.getSpecialNeeds());

        return entity;
    }

    // Add a method to handle the request DTO conversion
    public HealthProfile fromRequestDTO(HealthProfileRequestDTO requestDTO) {
        if (requestDTO == null) {
            return null;
        }

        HealthProfile entity = new HealthProfile();
        entity.setBloodType(requestDTO.getBloodType());
        entity.setHeight(requestDTO.getHeight());
        entity.setWeight(requestDTO.getWeight());

        // Calculate BMI if height and weight are provided
        if (requestDTO.getHeight() != null && requestDTO.getWeight() != null && requestDTO.getHeight() > 0) {
            double heightInMeters = requestDTO.getHeight() / 100.0;
            entity.setBmi(Math.round((requestDTO.getWeight() / (heightInMeters * heightInMeters)) * 10.0) / 10.0);
        }

        entity.setAllergies(requestDTO.getAllergies());
        entity.setChronicDiseases(requestDTO.getChronicDiseases());
        entity.setVisionLeft(requestDTO.getVisionLeft());
        entity.setVisionRight(requestDTO.getVisionRight());
        entity.setHearingStatus(requestDTO.getHearingStatus());
        entity.setDietaryRestrictions(requestDTO.getDietaryRestrictions());
        entity.setEmergencyContactInfo(requestDTO.getEmergencyContactInfo());
        entity.setImmunizationStatus(requestDTO.getImmunizationStatus());
        entity.setLastPhysicalExamDate(requestDTO.getLastPhysicalExamDate());
        entity.setSpecialNeeds(requestDTO.getSpecialNeeds());

        return entity;
    }
}