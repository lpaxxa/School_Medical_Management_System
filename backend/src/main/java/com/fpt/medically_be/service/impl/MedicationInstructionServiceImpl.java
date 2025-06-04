package com.fpt.medically_be.service.impl;

import com.fpt.medically_be.dto.MedicationInstructionDTO;
import com.fpt.medically_be.entity.HealthProfile;
import com.fpt.medically_be.entity.MedicationInstruction;
import com.fpt.medically_be.entity.Student;
import com.fpt.medically_be.repos.HealthProfileRepository;
import com.fpt.medically_be.repos.MedicationInstructionRepository;
import com.fpt.medically_be.repos.StudentRepository;
import com.fpt.medically_be.service.MedicationInstructionService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MedicationInstructionServiceImpl implements MedicationInstructionService {

    private final MedicationInstructionRepository medicationInstructionRepository;
    private final HealthProfileRepository healthProfileRepository;
    private final StudentRepository studentRepository;

    @Autowired
    public MedicationInstructionServiceImpl(MedicationInstructionRepository medicationInstructionRepository,
                                           HealthProfileRepository healthProfileRepository,
                                           StudentRepository studentRepository) {
        this.medicationInstructionRepository = medicationInstructionRepository;
        this.healthProfileRepository = healthProfileRepository;
        this.studentRepository = studentRepository;
    }

    @Override
    public List<MedicationInstructionDTO> getAllMedicationInstructions() {
        return medicationInstructionRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public MedicationInstructionDTO getMedicationInstructionById(Long id) {
        return medicationInstructionRepository.findById(id)
                .map(this::convertToDTO)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy hướng dẫn thuốc với ID: " + id));
    }

    @Override
    public List<MedicationInstructionDTO> getMedicationInstructionsByHealthProfileId(Long healthProfileId) {
        return medicationInstructionRepository.findByHealthProfileId(healthProfileId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<MedicationInstructionDTO> getMedicationInstructionsByStatus(String status) {
        return medicationInstructionRepository.findByStatus(status).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<MedicationInstructionDTO> getExpiredMedicationInstructions(LocalDate date) {
        return medicationInstructionRepository.findByEndDateBefore(date).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<MedicationInstructionDTO> getMedicationInstructionsByDateRange(LocalDate startDate, LocalDate endDate) {
        return medicationInstructionRepository.findByStartDateBetween(startDate, endDate).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<MedicationInstructionDTO> getParentProvidedMedicationInstructions(Boolean parentProvided) {
        return medicationInstructionRepository.findByParentProvided(parentProvided).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public MedicationInstructionDTO createMedicationInstruction(MedicationInstructionDTO medicationInstructionDTO) {
        MedicationInstruction medicationInstruction = convertToEntity(medicationInstructionDTO);
        MedicationInstruction savedMedicationInstruction = medicationInstructionRepository.save(medicationInstruction);
        return convertToDTO(savedMedicationInstruction);
    }

    @Override
    public MedicationInstructionDTO updateMedicationInstruction(Long id, MedicationInstructionDTO medicationInstructionDTO) {
        MedicationInstruction existingMedicationInstruction = medicationInstructionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy hướng dẫn thuốc với ID: " + id));

        // Cập nhật thông tin hướng dẫn thuốc
        existingMedicationInstruction.setMedicationName(medicationInstructionDTO.getMedicationName());
        existingMedicationInstruction.setDosageInstructions(medicationInstructionDTO.getDosageInstructions());
        existingMedicationInstruction.setStartDate(medicationInstructionDTO.getStartDate());
        existingMedicationInstruction.setEndDate(medicationInstructionDTO.getEndDate());
        existingMedicationInstruction.setFrequencyPerDay(medicationInstructionDTO.getFrequencyPerDay());
        existingMedicationInstruction.setTimeOfDay(medicationInstructionDTO.getTimeOfDay());
        existingMedicationInstruction.setSpecialInstructions(medicationInstructionDTO.getSpecialInstructions());
        existingMedicationInstruction.setParentProvided(medicationInstructionDTO.getParentProvided());
        existingMedicationInstruction.setPrescribedBy(medicationInstructionDTO.getPrescribedBy());
        existingMedicationInstruction.setCreatedDate(medicationInstructionDTO.getCreatedDate());
        existingMedicationInstruction.setStatus(medicationInstructionDTO.getStatus());

        // Cập nhật health profile nếu có thay đổi
        if (medicationInstructionDTO.getHealthProfileId() != null &&
            !medicationInstructionDTO.getHealthProfileId().equals(existingMedicationInstruction.getHealthProfile().getId())) {
            HealthProfile healthProfile = healthProfileRepository.findById(medicationInstructionDTO.getHealthProfileId())
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy hồ sơ sức khỏe với ID: " + medicationInstructionDTO.getHealthProfileId()));
            existingMedicationInstruction.setHealthProfile(healthProfile);
        }

        MedicationInstruction updatedMedicationInstruction = medicationInstructionRepository.save(existingMedicationInstruction);
        return convertToDTO(updatedMedicationInstruction);
    }

    @Override
    public void deleteMedicationInstruction(Long id) {
        if (!medicationInstructionRepository.existsById(id)) {
            throw new EntityNotFoundException("Không tìm thấy hướng dẫn thuốc với ID: " + id);
        }
        medicationInstructionRepository.deleteById(id);
    }

    // Phương thức chuyển đổi từ Entity sang DTO
    private MedicationInstructionDTO convertToDTO(MedicationInstruction medicationInstruction) {
        MedicationInstructionDTO dto = new MedicationInstructionDTO();
        dto.setId(medicationInstruction.getId());
        dto.setMedicationName(medicationInstruction.getMedicationName());
        dto.setDosageInstructions(medicationInstruction.getDosageInstructions());
        dto.setStartDate(medicationInstruction.getStartDate());
        dto.setEndDate(medicationInstruction.getEndDate());
        dto.setFrequencyPerDay(medicationInstruction.getFrequencyPerDay());
        dto.setTimeOfDay(medicationInstruction.getTimeOfDay());
        dto.setSpecialInstructions(medicationInstruction.getSpecialInstructions());
        dto.setParentProvided(medicationInstruction.getParentProvided());
        dto.setPrescribedBy(medicationInstruction.getPrescribedBy());
        dto.setCreatedDate(medicationInstruction.getCreatedDate());
        dto.setStatus(medicationInstruction.getStatus());

        if (medicationInstruction.getHealthProfile() != null) {
            dto.setHealthProfileId(medicationInstruction.getHealthProfile().getId());

            // Tìm tên học sinh từ health profile
            Optional<Student> student = studentRepository.findByHealthProfileId(medicationInstruction.getHealthProfile().getId());
            student.ifPresent(value -> dto.setStudentName(value.getFullName()));
        }

        return dto;
    }

    // Phương thức chuyển đổi từ DTO sang Entity
    private MedicationInstruction convertToEntity(MedicationInstructionDTO dto) {
        MedicationInstruction medicationInstruction = new MedicationInstruction();
        medicationInstruction.setId(dto.getId());
        medicationInstruction.setMedicationName(dto.getMedicationName());
        medicationInstruction.setDosageInstructions(dto.getDosageInstructions());
        medicationInstruction.setStartDate(dto.getStartDate());
        medicationInstruction.setEndDate(dto.getEndDate());
        medicationInstruction.setFrequencyPerDay(dto.getFrequencyPerDay());
        medicationInstruction.setTimeOfDay(dto.getTimeOfDay());
        medicationInstruction.setSpecialInstructions(dto.getSpecialInstructions());
        medicationInstruction.setParentProvided(dto.getParentProvided());
        medicationInstruction.setPrescribedBy(dto.getPrescribedBy());
        medicationInstruction.setCreatedDate(dto.getCreatedDate());
        medicationInstruction.setStatus(dto.getStatus());

        // Thiết lập health profile
        if (dto.getHealthProfileId() != null) {
            healthProfileRepository.findById(dto.getHealthProfileId())
                    .ifPresent(medicationInstruction::setHealthProfile);
        }

        return medicationInstruction;
    }
}
