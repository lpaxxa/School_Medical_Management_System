package com.fpt.medically_be.service.impl;

import com.fpt.medically_be.dto.VaccinationDTO;
import com.fpt.medically_be.entity.HealthProfile;
import com.fpt.medically_be.entity.Student;
import com.fpt.medically_be.entity.Vaccination;
import com.fpt.medically_be.repos.HealthProfileRepository;
import com.fpt.medically_be.repos.StudentRepository;
import com.fpt.medically_be.repos.VaccinationRepository;
import com.fpt.medically_be.service.VaccinationService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class VaccinationServiceImpl implements VaccinationService {

    private final VaccinationRepository vaccinationRepository;
    private final HealthProfileRepository healthProfileRepository;
    private final StudentRepository studentRepository;

    @Autowired
    public VaccinationServiceImpl(VaccinationRepository vaccinationRepository,
                                 HealthProfileRepository healthProfileRepository,
                                 StudentRepository studentRepository) {
        this.vaccinationRepository = vaccinationRepository;
        this.healthProfileRepository = healthProfileRepository;
        this.studentRepository = studentRepository;
    }

    @Override
    public List<VaccinationDTO> getAllVaccinations() {
        return vaccinationRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public VaccinationDTO getVaccinationById(Long id) {
        return vaccinationRepository.findById(id)
                .map(this::convertToDTO)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy thông tin tiêm chủng với ID: " + id));
    }

    @Override
    public List<VaccinationDTO> getVaccinationsByHealthProfileId(Long healthProfileId) {
        return vaccinationRepository.findByHealthProfileId(healthProfileId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<VaccinationDTO> getVaccinationsByName(String vaccineName) {
        return vaccinationRepository.findByVaccineName(vaccineName).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<VaccinationDTO> getVaccinationsByDateRange(LocalDate startDate, LocalDate endDate) {
        return vaccinationRepository.findByVaccinationDateBetween(startDate, endDate).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<VaccinationDTO> getUpcomingVaccinationsDue(LocalDate beforeDate) {
        return vaccinationRepository.findByNextDoseDateBefore(beforeDate).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public VaccinationDTO createVaccination(VaccinationDTO vaccinationDTO) {
        Vaccination vaccination = convertToEntity(vaccinationDTO);
        Vaccination savedVaccination = vaccinationRepository.save(vaccination);
        return convertToDTO(savedVaccination);
    }

    @Override
    public VaccinationDTO updateVaccination(Long id, VaccinationDTO vaccinationDTO) {
        Vaccination existingVaccination = vaccinationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy thông tin tiêm chủng với ID: " + id));

        // Cập nhật thông tin tiêm chủng
        existingVaccination.setVaccineName(vaccinationDTO.getVaccineName());
        existingVaccination.setVaccinationDate(vaccinationDTO.getVaccinationDate());
        existingVaccination.setNextDoseDate(vaccinationDTO.getNextDoseDate());
        existingVaccination.setDoseNumber(vaccinationDTO.getDoseNumber());
        existingVaccination.setAdministeredBy(vaccinationDTO.getAdministeredBy());
        existingVaccination.setAdministeredAt(vaccinationDTO.getAdministeredAt());
        existingVaccination.setNotes(vaccinationDTO.getNotes());
        existingVaccination.setParentConsent(vaccinationDTO.getParentConsent());

        // Cập nhật health profile nếu có thay đổi
        if (vaccinationDTO.getHealthProfileId() != null &&
            !vaccinationDTO.getHealthProfileId().equals(existingVaccination.getHealthProfile().getId())) {
            HealthProfile healthProfile = healthProfileRepository.findById(vaccinationDTO.getHealthProfileId())
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy hồ sơ sức khỏe với ID: " + vaccinationDTO.getHealthProfileId()));
            existingVaccination.setHealthProfile(healthProfile);
        }

        Vaccination updatedVaccination = vaccinationRepository.save(existingVaccination);
        return convertToDTO(updatedVaccination);
    }

    @Override
    public void deleteVaccination(Long id) {
        if (!vaccinationRepository.existsById(id)) {
            throw new EntityNotFoundException("Không tìm thấy thông tin tiêm chủng với ID: " + id);
        }
        vaccinationRepository.deleteById(id);
    }

    // Phương thức chuyển đổi từ Entity sang DTO
    private VaccinationDTO convertToDTO(Vaccination vaccination) {
        VaccinationDTO dto = new VaccinationDTO();
        dto.setId(vaccination.getId());
        dto.setVaccineName(vaccination.getVaccineName());
        dto.setVaccinationDate(vaccination.getVaccinationDate());
        dto.setNextDoseDate(vaccination.getNextDoseDate());
        dto.setDoseNumber(vaccination.getDoseNumber());
        dto.setAdministeredBy(vaccination.getAdministeredBy());
        dto.setAdministeredAt(vaccination.getAdministeredAt());
        dto.setNotes(vaccination.getNotes());
        dto.setParentConsent(vaccination.getParentConsent());

        if (vaccination.getHealthProfile() != null) {
            dto.setHealthProfileId(vaccination.getHealthProfile().getId());

            // Tìm tên học sinh từ health profile
            Optional<Student> student = studentRepository.findByHealthProfileId(vaccination.getHealthProfile().getId());
            student.ifPresent(value -> dto.setStudentName(value.getFullName()));
        }

        return dto;
    }

    // Phương thức chuyển đổi từ DTO sang Entity
    private Vaccination convertToEntity(VaccinationDTO dto) {
        Vaccination vaccination = new Vaccination();
        vaccination.setId(dto.getId());
        vaccination.setVaccineName(dto.getVaccineName());
        vaccination.setVaccinationDate(dto.getVaccinationDate());
        vaccination.setNextDoseDate(dto.getNextDoseDate());
        vaccination.setDoseNumber(dto.getDoseNumber());
        vaccination.setAdministeredBy(dto.getAdministeredBy());
        vaccination.setAdministeredAt(dto.getAdministeredAt());
        vaccination.setNotes(dto.getNotes());
        vaccination.setParentConsent(dto.getParentConsent());

        // Thiết lập health profile
        if (dto.getHealthProfileId() != null) {
            healthProfileRepository.findById(dto.getHealthProfileId())
                    .ifPresent(vaccination::setHealthProfile);
        }

        return vaccination;
    }
}
