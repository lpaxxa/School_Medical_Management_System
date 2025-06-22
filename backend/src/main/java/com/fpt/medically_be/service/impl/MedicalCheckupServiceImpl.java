package com.fpt.medically_be.service.impl;

import com.fpt.medically_be.dto.MedicalCheckupDTO;
import com.fpt.medically_be.entity.MedicalCheckup;
import com.fpt.medically_be.entity.Nurse;
import com.fpt.medically_be.entity.Student;
import com.fpt.medically_be.repos.MedicalCheckupRepository;
import com.fpt.medically_be.repos.NurseRepository;
import com.fpt.medically_be.repos.StudentRepository;
import com.fpt.medically_be.service.MedicalCheckupService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MedicalCheckupServiceImpl implements MedicalCheckupService {

    private final MedicalCheckupRepository medicalCheckupRepository;
    private final StudentRepository studentRepository;
    private final NurseRepository medicalStaffRepository;

    @Autowired
    public MedicalCheckupServiceImpl(MedicalCheckupRepository medicalCheckupRepository,
                                    StudentRepository studentRepository,
                                    NurseRepository medicalStaffRepository) {
        this.medicalCheckupRepository = medicalCheckupRepository;
        this.studentRepository = studentRepository;
        this.medicalStaffRepository = medicalStaffRepository;
    }

    @Override
    public List<MedicalCheckupDTO> getAllMedicalCheckups() {
        return medicalCheckupRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public MedicalCheckupDTO getMedicalCheckupById(Long id) {
        return medicalCheckupRepository.findById(id)
                .map(this::convertToDTO)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy lịch sử khám bệnh với ID: " + id));
    }

    @Override
    public List<MedicalCheckupDTO> getMedicalCheckupsByStudentId(Long studentId) {
        return medicalCheckupRepository.findByStudentId(studentId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<MedicalCheckupDTO> getMedicalCheckupsByStaffId(Long staffId) {
        return medicalCheckupRepository.findByMedicalStaffId(staffId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<MedicalCheckupDTO> getMedicalCheckupsByDateRange(LocalDate startDate, LocalDate endDate) {
        return medicalCheckupRepository.findByCheckupDateBetween(startDate, endDate).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<MedicalCheckupDTO> getMedicalCheckupsByStudentAndDateRange(Long studentId, LocalDate startDate, LocalDate endDate) {
        return medicalCheckupRepository.findByStudentIdAndCheckupDateBetween(studentId, startDate, endDate).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<MedicalCheckupDTO> getMedicalCheckupsByType(String checkupType) {
        return medicalCheckupRepository.findByCheckupType(checkupType).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<MedicalCheckupDTO> getMedicalCheckupsNeedingFollowUp() {
        return medicalCheckupRepository.findByFollowUpNeeded(true).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public MedicalCheckupDTO createMedicalCheckup(MedicalCheckupDTO medicalCheckupDTO) {
        MedicalCheckup medicalCheckup = convertToEntity(medicalCheckupDTO);
        MedicalCheckup savedMedicalCheckup = medicalCheckupRepository.save(medicalCheckup);
        return convertToDTO(savedMedicalCheckup);
    }

    @Override
    public MedicalCheckupDTO updateMedicalCheckup(Long id, MedicalCheckupDTO medicalCheckupDTO) {
        MedicalCheckup existingMedicalCheckup = medicalCheckupRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy lịch sử khám bệnh với ID: " + id));

        // Cập nhật thông tin khám bệnh
        existingMedicalCheckup.setCheckupDate(medicalCheckupDTO.getCheckupDate());
        existingMedicalCheckup.setCheckupType(medicalCheckupDTO.getCheckupType());
        existingMedicalCheckup.setHeight(medicalCheckupDTO.getHeight());
        existingMedicalCheckup.setWeight(medicalCheckupDTO.getWeight());
        existingMedicalCheckup.setBmi(medicalCheckupDTO.getBmi());
        existingMedicalCheckup.setBloodPressure(medicalCheckupDTO.getBloodPressure());
        existingMedicalCheckup.setVisionLeft(medicalCheckupDTO.getVisionLeft());
        existingMedicalCheckup.setVisionRight(medicalCheckupDTO.getVisionRight());
        existingMedicalCheckup.setHearingStatus(medicalCheckupDTO.getHearingStatus());
        existingMedicalCheckup.setHeartRate(medicalCheckupDTO.getHeartRate());
        existingMedicalCheckup.setBodyTemperature(medicalCheckupDTO.getBodyTemperature());
        existingMedicalCheckup.setDiagnosis(medicalCheckupDTO.getDiagnosis());
        existingMedicalCheckup.setRecommendations(medicalCheckupDTO.getRecommendations());
        existingMedicalCheckup.setFollowUpNeeded(medicalCheckupDTO.getFollowUpNeeded());
        existingMedicalCheckup.setParentNotified(medicalCheckupDTO.getParentNotified());

        // Cập nhật student nếu có
        if (medicalCheckupDTO.getStudentId() != null) {
            Student student = studentRepository.findById(medicalCheckupDTO.getStudentId())
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy học sinh với ID: " + medicalCheckupDTO.getStudentId()));
            existingMedicalCheckup.setStudent(student);
        }

        // Cập nhật medical staff nếu có
        if (medicalCheckupDTO.getMedicalStaffId() != null) {
            Nurse medicalStaff = medicalStaffRepository.findById(medicalCheckupDTO.getMedicalStaffId())
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy nhân viên y tế với ID: " + medicalCheckupDTO.getMedicalStaffId()));
            existingMedicalCheckup.setMedicalStaff(medicalStaff);
        }

        MedicalCheckup updatedMedicalCheckup = medicalCheckupRepository.save(existingMedicalCheckup);
        return convertToDTO(updatedMedicalCheckup);
    }

    @Override
    public void deleteMedicalCheckup(Long id) {
        if (!medicalCheckupRepository.existsById(id)) {
            throw new EntityNotFoundException("Không tìm thấy lịch sử khám bệnh với ID: " + id);
        }
        medicalCheckupRepository.deleteById(id);
    }

    // Phương thức chuyển đổi từ Entity sang DTO
    private MedicalCheckupDTO convertToDTO(MedicalCheckup medicalCheckup) {
        MedicalCheckupDTO dto = new MedicalCheckupDTO();
        dto.setId(medicalCheckup.getId());
        dto.setCheckupDate(medicalCheckup.getCheckupDate());
        dto.setCheckupType(medicalCheckup.getCheckupType());
        dto.setHeight(medicalCheckup.getHeight());
        dto.setWeight(medicalCheckup.getWeight());
        dto.setBmi(medicalCheckup.getBmi());
        dto.setBloodPressure(medicalCheckup.getBloodPressure());
        dto.setVisionLeft(medicalCheckup.getVisionLeft());
        dto.setVisionRight(medicalCheckup.getVisionRight());
        dto.setHearingStatus(medicalCheckup.getHearingStatus());
        dto.setHeartRate(medicalCheckup.getHeartRate());
        dto.setBodyTemperature(medicalCheckup.getBodyTemperature());
        dto.setDiagnosis(medicalCheckup.getDiagnosis());
        dto.setRecommendations(medicalCheckup.getRecommendations());
        dto.setFollowUpNeeded(medicalCheckup.getFollowUpNeeded());
        dto.setParentNotified(medicalCheckup.getParentNotified());

        if (medicalCheckup.getStudent() != null) {
            dto.setStudentId(medicalCheckup.getStudent().getId());
            dto.setStudentName(medicalCheckup.getStudent().getFullName());
        }

        if (medicalCheckup.getMedicalStaff() != null) {
            dto.setMedicalStaffId(medicalCheckup.getMedicalStaff().getId());
            dto.setMedicalStaffName(medicalCheckup.getMedicalStaff().getFullName());
        }

        return dto;
    }

    // Phương thức chuyển đổi từ DTO sang Entity
    private MedicalCheckup convertToEntity(MedicalCheckupDTO dto) {
        MedicalCheckup medicalCheckup = new MedicalCheckup();
        medicalCheckup.setId(dto.getId());
        medicalCheckup.setCheckupDate(dto.getCheckupDate());
        medicalCheckup.setCheckupType(dto.getCheckupType());
        medicalCheckup.setHeight(dto.getHeight());
        medicalCheckup.setWeight(dto.getWeight());
        medicalCheckup.setBmi(dto.getBmi());
        medicalCheckup.setBloodPressure(dto.getBloodPressure());
        medicalCheckup.setVisionLeft(dto.getVisionLeft());
        medicalCheckup.setVisionRight(dto.getVisionRight());
        medicalCheckup.setHearingStatus(dto.getHearingStatus());
        medicalCheckup.setHeartRate(dto.getHeartRate());
        medicalCheckup.setBodyTemperature(dto.getBodyTemperature());
        medicalCheckup.setDiagnosis(dto.getDiagnosis());
        medicalCheckup.setRecommendations(dto.getRecommendations());
        medicalCheckup.setFollowUpNeeded(dto.getFollowUpNeeded());
        medicalCheckup.setParentNotified(dto.getParentNotified());

        // Thiết lập Student nếu có
        if (dto.getStudentId() != null) {
            studentRepository.findById(dto.getStudentId())
                    .ifPresent(medicalCheckup::setStudent);
        }

        // Thiết lập MedicalStaff nếu có
        if (dto.getMedicalStaffId() != null) {
            medicalStaffRepository.findById(dto.getMedicalStaffId())
                    .ifPresent(medicalCheckup::setMedicalStaff);
        }

        return medicalCheckup;
    }
}
