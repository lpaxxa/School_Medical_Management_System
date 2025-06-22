package com.fpt.medically_be.service.impl;

import com.fpt.medically_be.dto.HealthProfileDTO;
import com.fpt.medically_be.dto.request.HealthProfileRequestDTO;
import com.fpt.medically_be.entity.HealthProfile;
import com.fpt.medically_be.entity.Student;
import com.fpt.medically_be.mapper.HealthProfileMapper;
import com.fpt.medically_be.repos.HealthProfileRepository;
import com.fpt.medically_be.repos.StudentRepository;
import com.fpt.medically_be.service.HealthProfileService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
public class HealthProfileServiceImpl implements HealthProfileService {

    private final HealthProfileRepository healthProfileRepository;
    private final HealthProfileMapper healthProfileMapper;
    private final StudentRepository studentRepository;

    @Autowired
    public HealthProfileServiceImpl(HealthProfileRepository healthProfileRepository, HealthProfileMapper healthProfileMapper, StudentRepository studentRepository) {
        this.healthProfileRepository = healthProfileRepository;
        this.healthProfileMapper = healthProfileMapper;
        this.studentRepository = studentRepository;
    }

    @Override
    public Page<HealthProfileDTO> findAll(Pageable pageable) {
        return healthProfileRepository.findAll(pageable).map(healthProfileMapper::toObject);
    }

    @Override
    public List<HealthProfileDTO> findAllWithoutPaging() {
        return healthProfileRepository.findAll().stream()
                .map(healthProfileMapper::toObject)
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public HealthProfileDTO getHealthProfileById(Long id) {
        return healthProfileRepository.findById(id)
                .map(healthProfileMapper::toObject)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy hồ sơ sức khỏe với ID: " + id));
    }

    @Override
    public HealthProfileDTO createHealthProfile(HealthProfileRequestDTO healthProfileRequestDTO) {
        Long studentId = healthProfileRequestDTO.getId();
        if (studentId == null) {
            throw new IllegalArgumentException("Student ID must not be null");
        }

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new EntityNotFoundException("Student not found with id: " + studentId));

        // Check if student already has a health profile
        if (student.getHealthProfile() != null) {
            // Update existing health profile instead of creating new one
            Long existingProfileId = student.getHealthProfile().getId();
            return updateHealthProfile(existingProfileId, healthProfileRequestDTO);
        }

        // Use mapper to create HealthProfile entity
        HealthProfile healthProfile = healthProfileMapper.fromRequestDTO(healthProfileRequestDTO);
        healthProfile.setLastUpdated(java.time.LocalDateTime.now());

        // First save the health profile without setting the student
        HealthProfile savedHealthProfile = healthProfileRepository.save(healthProfile);

        // Now establish both sides of the relationship
        savedHealthProfile.setStudent(student);
        student.setHealthProfile(savedHealthProfile);

        // Save the student to update the relationship
        studentRepository.save(student);

        // Refresh the health profile entity to ensure it has the latest state
        savedHealthProfile = healthProfileRepository.findById(savedHealthProfile.getId()).orElse(savedHealthProfile);

        return healthProfileMapper.toObject(savedHealthProfile);
    }

    @Override
    public HealthProfileDTO updateHealthProfile(Long id, HealthProfileRequestDTO requestDTO) {
        HealthProfile existingHealthProfile = healthProfileRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy hồ sơ sức khỏe với ID: " + id));

        // Use the mapper to apply the requestDTO values to a new entity
        HealthProfile updatedData = healthProfileMapper.fromRequestDTO(requestDTO);

        // Preserve the ID and student relationship from the existing entity
        updatedData.setId(existingHealthProfile.getId());
        updatedData.setStudent(existingHealthProfile.getStudent());
        updatedData.setLastUpdated(java.time.LocalDateTime.now());
        updatedData.setIsActive(existingHealthProfile.getIsActive());

        // Save the updated entity
        HealthProfile savedProfile = healthProfileRepository.save(updatedData);

        // Return the DTO
        return healthProfileMapper.toObject(savedProfile);
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
                .map(healthProfileMapper::toObject)
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
        } else {
            dto.setBmi(healthProfile.getBmi()); // Use stored BMI if height/weight aren't available
        }
        dto.setAllergies(healthProfile.getAllergies());
        dto.setChronicDiseases(healthProfile.getChronicDiseases());
        dto.setVisionLeft(healthProfile.getVisionLeft());
        dto.setVisionRight(healthProfile.getVisionRight());
        dto.setHearingStatus(healthProfile.getHearingStatus());

        // Add the missing fields
        dto.setDietaryRestrictions(healthProfile.getDietaryRestrictions());
        dto.setEmergencyContactInfo(healthProfile.getEmergencyContactInfo());
        dto.setImmunizationStatus(healthProfile.getImmunizationStatus());
        dto.setLastPhysicalExamDate(healthProfile.getLastPhysicalExamDate());
        dto.setSpecialNeeds(healthProfile.getSpecialNeeds());

        dto.setLastUpdated(healthProfile.getLastUpdated());
        return dto;
    }

    // Phương thức chuyển đổi từ DTO sang Entity
    private HealthProfile convertToEntity(HealthProfileRequestDTO dto) {
        HealthProfile healthProfile = new HealthProfile();
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
        healthProfile.setSpecialNeeds(dto.getSpecialNeeds());
        healthProfile.setDietaryRestrictions(dto.getDietaryRestrictions());
        healthProfile.setEmergencyContactInfo(dto.getEmergencyContactInfo());
        healthProfile.setImmunizationStatus(dto.getImmunizationStatus());
        healthProfile.setLastPhysicalExamDate(dto.getLastPhysicalExamDate());
        healthProfile.setLastUpdated(java.time.LocalDateTime.now());

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
