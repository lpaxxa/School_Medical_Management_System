package com.fpt.medically_be.service.impl;

import com.fpt.medically_be.dto.HealthProfileDTO;
import com.fpt.medically_be.entity.HealthProfile;
import com.fpt.medically_be.repos.HealthProfileRepository;
import com.fpt.medically_be.service.HealthProfileService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class HealthProfileServiceImpl implements HealthProfileService {

    private final HealthProfileRepository healthProfileRepository;

    @Autowired
    public HealthProfileServiceImpl(HealthProfileRepository healthProfileRepository) {
        this.healthProfileRepository = healthProfileRepository;
    }

    @Override
    public List<HealthProfileDTO> getAllHealthProfiles() {
        return healthProfileRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public HealthProfileDTO getHealthProfileById(Long id) {
        return healthProfileRepository.findById(id)
                .map(this::convertToDTO)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy hồ sơ sức khỏe với ID: " + id));
    }

    @Override
    public HealthProfileDTO createHealthProfile(HealthProfileDTO healthProfileDTO) {
        HealthProfile healthProfile = convertToEntity(healthProfileDTO);
        HealthProfile savedHealthProfile = healthProfileRepository.save(healthProfile);
        return convertToDTO(savedHealthProfile);
    }

    @Override
    public HealthProfileDTO updateHealthProfile(Long id, HealthProfileDTO healthProfileDTO) {
        HealthProfile existingHealthProfile = healthProfileRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy hồ sơ sức khỏe với ID: " + id));

        // Cập nhật thông tin hồ sơ sức khỏe
        existingHealthProfile.setBloodType(healthProfileDTO.getBloodType());
        existingHealthProfile.setHeight(healthProfileDTO.getHeight());
        existingHealthProfile.setWeight(healthProfileDTO.getWeight());
        existingHealthProfile.setBmi(healthProfileDTO.getBmi());
        existingHealthProfile.setAllergies(healthProfileDTO.getAllergies());
        existingHealthProfile.setChronicDiseases(healthProfileDTO.getChronicDiseases());
        existingHealthProfile.setTreatmentHistory(healthProfileDTO.getTreatmentHistory());
        existingHealthProfile.setVisionLeft(healthProfileDTO.getVisionLeft());
        existingHealthProfile.setVisionRight(healthProfileDTO.getVisionRight());
        existingHealthProfile.setHearingStatus(healthProfileDTO.getHearingStatus());

        HealthProfile updatedHealthProfile = healthProfileRepository.save(existingHealthProfile);
        return convertToDTO(updatedHealthProfile);
    }

    @Override
    public void deleteHealthProfile(Long id) {
        if (!healthProfileRepository.existsById(id)) {
            throw new EntityNotFoundException("Không tìm thấy hồ sơ sức khỏe với ID: " + id);
        }
        healthProfileRepository.deleteById(id);
    }

    // Phương thức chuyển đổi từ Entity sang DTO
    private HealthProfileDTO convertToDTO(HealthProfile healthProfile) {
        HealthProfileDTO dto = new HealthProfileDTO();
        dto.setId(healthProfile.getId());
        dto.setBloodType(healthProfile.getBloodType());
        dto.setHeight(healthProfile.getHeight());
        dto.setWeight(healthProfile.getWeight());
        dto.setBmi(healthProfile.getBmi());
        dto.setAllergies(healthProfile.getAllergies());
        dto.setChronicDiseases(healthProfile.getChronicDiseases());
        dto.setTreatmentHistory(healthProfile.getTreatmentHistory());
        dto.setVisionLeft(healthProfile.getVisionLeft());
        dto.setVisionRight(healthProfile.getVisionRight());
        dto.setHearingStatus(healthProfile.getHearingStatus());
        return dto;
    }

    // Phương thức chuyển đổi từ DTO sang Entity
    private HealthProfile convertToEntity(HealthProfileDTO dto) {
        HealthProfile healthProfile = new HealthProfile();
        healthProfile.setId(dto.getId());
        healthProfile.setBloodType(dto.getBloodType());
        healthProfile.setHeight(dto.getHeight());
        healthProfile.setWeight(dto.getWeight());
        healthProfile.setBmi(dto.getBmi());
        healthProfile.setAllergies(dto.getAllergies());
        healthProfile.setChronicDiseases(dto.getChronicDiseases());
        healthProfile.setTreatmentHistory(dto.getTreatmentHistory());
        healthProfile.setVisionLeft(dto.getVisionLeft());
        healthProfile.setVisionRight(dto.getVisionRight());
        healthProfile.setHearingStatus(dto.getHearingStatus());
        return healthProfile;
    }
}
