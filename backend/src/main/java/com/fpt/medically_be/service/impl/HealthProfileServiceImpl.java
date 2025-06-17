package com.fpt.medically_be.service.impl;

import com.fpt.medically_be.dto.HealthProfileDTO;
import com.fpt.medically_be.entity.HealthProfile;
import com.fpt.medically_be.entity.Student;
import com.fpt.medically_be.mapper.HealthProfileMapper;
import com.fpt.medically_be.repos.HealthProfileRepository;
import com.fpt.medically_be.service.HealthProfileService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class HealthProfileServiceImpl implements HealthProfileService {

    private final HealthProfileRepository healthProfileRepository;
    private final HealthProfileMapper healthProfileMapper;

    @Autowired
    public HealthProfileServiceImpl(HealthProfileRepository healthProfileRepository, HealthProfileMapper healthProfileMapper) {
        this.healthProfileRepository = healthProfileRepository;
        this.healthProfileMapper = healthProfileMapper;
    }



    @Override
    public Page<HealthProfileDTO> findAll(Pageable pageable) {
        return healthProfileRepository.findAll(pageable).map(this::convertToDTO);
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

        HealthProfile savedHealthProfile = null;
        if( healthProfile.getStudent() == null) {
           savedHealthProfile = healthProfileRepository.save(healthProfile);
        }

        return healthProfileMapper.toObject(savedHealthProfile);

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
        existingHealthProfile.setDietaryRestrictions(healthProfileDTO.getDietaryRestrictions());
        existingHealthProfile.setEmergencyContactInfo(healthProfileDTO.getEmergencyContactInfo());
        existingHealthProfile.setImmunizationStatus(healthProfileDTO.getImmunizationStatus());
        existingHealthProfile.setLastPhysicalExamDate(healthProfileDTO.getLastPhysicalExamDate());
        existingHealthProfile.setSpecialNeeds(healthProfileDTO.getSpecialNeeds());
        existingHealthProfile.setVisionLeft(healthProfileDTO.getVisionLeft());
        existingHealthProfile.setVisionRight(healthProfileDTO.getVisionRight());
        existingHealthProfile.setHearingStatus(healthProfileDTO.getHearingStatus());
        existingHealthProfile.setLastUpdated(java.time.LocalDateTime.now());

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

    @Override
    public HealthProfileDTO getHealthProfileByStudentId(Long studentId) {
        return healthProfileRepository.findByStudentId(studentId)
                .map(this::convertToDTO)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy hồ sơ sức khỏe cho học sinh với ID: " + studentId));
    }

    // Phương thức chuyển đổi từ Entity sang DTO
    private HealthProfileDTO convertToDTO(HealthProfile healthProfile) {
        HealthProfileDTO dto = new HealthProfileDTO();
        dto.setId(healthProfile.getId());
        dto.setBloodType(healthProfile.getBloodType());
        dto.setHeight(healthProfile.getHeight());
        dto.setWeight(healthProfile.getWeight());
        if (healthProfile.getHeight() != null && healthProfile.getWeight() != null) {
            dto.setBmi(calculateBMI(healthProfile.getHeight(), healthProfile.getWeight()));
        }
        dto.setAllergies(healthProfile.getAllergies());
        dto.setChronicDiseases(healthProfile.getChronicDiseases());

        dto.setVisionLeft(healthProfile.getVisionLeft());
        dto.setVisionRight(healthProfile.getVisionRight());
        dto.setHearingStatus(healthProfile.getHearingStatus());

        dto.setLastUpdated(healthProfile.getLastUpdated());
        return dto;
    }

    // Phương thức chuyển đổi từ DTO sang Entity
    private HealthProfile convertToEntity(HealthProfileDTO dto) {
        HealthProfile healthProfile = new HealthProfile();
        healthProfile.setId(dto.getId());
        healthProfile.setBloodType(dto.getBloodType());
        healthProfile.setHeight(dto.getHeight());
        healthProfile.setWeight(dto.getWeight());
        if (healthProfile.getHeight() != null && healthProfile.getWeight() != null) {
            healthProfile.setBmi(calculateBMI(dto.getHeight(), dto.getWeight()));
        }
        healthProfile.setAllergies(dto.getAllergies());
        healthProfile.setChronicDiseases(dto.getChronicDiseases());

        healthProfile.setVisionLeft(dto.getVisionLeft());
        healthProfile.setVisionRight(dto.getVisionRight());
        healthProfile.setHearingStatus(dto.getHearingStatus());

        healthProfile.setLastUpdated(dto.getLastUpdated());
        return healthProfile;
    }

    public Double calculateBMI(Double height, Double weight) {
        if (height == null || weight == null || height == 0) {
            return null;
        }
        // Convert height from cm to meters if necessary (assuming height is in cm)
        double heightInMeters = height / 100.0;
        // BMI formula: weight(kg) / (height(m))²
        return weight / (heightInMeters * heightInMeters);
    }
}
