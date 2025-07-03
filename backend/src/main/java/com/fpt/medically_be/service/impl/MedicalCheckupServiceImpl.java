package com.fpt.medically_be.service.impl;

import com.fpt.medically_be.dto.MedicalCheckupDTO;
import com.fpt.medically_be.dto.StudentDTO;
import com.fpt.medically_be.dto.request.MedicalCheckupCreateRequestDTO;
import com.fpt.medically_be.dto.response.ClassDTO;
import com.fpt.medically_be.dto.response.StudentConsentDTO;
import com.fpt.medically_be.entity.MedicalCheckup;
import com.fpt.medically_be.entity.Nurse;
import com.fpt.medically_be.entity.Student;
import com.fpt.medically_be.repos.MedicalCheckupRepository;
import com.fpt.medically_be.repos.NurseRepository;
import com.fpt.medically_be.repos.StudentRepository;
import com.fpt.medically_be.service.MedicalCheckupService;
import com.fpt.medically_be.service.EmailService;
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
    private final EmailService emailService;

    @Autowired
    public MedicalCheckupServiceImpl(MedicalCheckupRepository medicalCheckupRepository,
                                    StudentRepository studentRepository,
                                    NurseRepository medicalStaffRepository,
                                    EmailService emailService) {
        this.medicalCheckupRepository = medicalCheckupRepository;
        this.studentRepository = studentRepository;
        this.medicalStaffRepository = medicalStaffRepository;
        this.emailService = emailService;
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

    // COMMENTED OUT - Replaced with in-app notification system
    // @Override
    // public MedicalCheckupDTO createMedicalCheckupWithNotification(MedicalCheckupDTO medicalCheckupDTO, boolean autoNotifyParent) {
    //     MedicalCheckup medicalCheckup = convertToEntity(medicalCheckupDTO);
    //     MedicalCheckup savedMedicalCheckup = medicalCheckupRepository.save(medicalCheckup);
    //     
    //     // Send notification if health implications detected and auto-notify is enabled
    //     if (autoNotifyParent && hasHealthImplications(savedMedicalCheckup)) {
    //         try {
    //             emailService.sendHealthCheckupNotificationByCheckupId(savedMedicalCheckup.getId());
    //         } catch (Exception e) {
    //             // Log error but don't fail the main operation
    //             System.err.println("Failed to send health notification for checkup ID " + savedMedicalCheckup.getId() + ": " + e.getMessage());
    //         }
    //     }
    //     
    //     return convertToDTO(savedMedicalCheckup);
    // }

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

    // COMMENTED OUT - Replaced with in-app notification system
    // @Override
    // public MedicalCheckupDTO updateMedicalCheckupWithNotification(Long id, MedicalCheckupDTO medicalCheckupDTO, boolean autoNotifyParent) {
    //     // Store previous notification status
    //     MedicalCheckup existing = medicalCheckupRepository.findById(id)
    //             .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy lịch sử khám bệnh với ID: " + id));
    //     boolean wasNotified = existing.getParentNotified() != null && existing.getParentNotified();
    //     
    //     // Update the checkup
    //     MedicalCheckupDTO updated = updateMedicalCheckup(id, medicalCheckupDTO);
    //     
    //     // Send notification if health implications detected, auto-notify is enabled, and parent wasn't already notified
    //     if (autoNotifyParent && !wasNotified) {
    //         MedicalCheckup updatedEntity = medicalCheckupRepository.findById(id).get();
    //         if (hasHealthImplications(updatedEntity)) {
    //             try {
    //                 emailService.sendHealthCheckupNotificationByCheckupId(updatedEntity.getId());
    //             } catch (Exception e) {
    //                 // Log error but don't fail the main operation
    //                 System.err.println("Failed to send health notification for updated checkup ID " + updatedEntity.getId() + ": " + e.getMessage());
    //             }
    //         }
    //     }
    //     
    //     return updated;
    // }

    // COMMENTED OUT - Replaced with in-app notification system
    // @Override
    // public void sendHealthNotificationToParent(Long checkupId) {
    //     emailService.sendHealthCheckupNotificationByCheckupId(checkupId);
    // }

    // COMMENTED OUT - Replaced with in-app notification system
    // @Override
    // public void sendBatchHealthNotificationsToParents(List<Long> checkupIds) {
    //     emailService.sendBatchHealthCheckupNotifications(checkupIds);
    // }

    // COMMENTED OUT - Replaced with in-app notification system
    // @Override
    // public List<MedicalCheckupDTO> getCheckupsNeedingParentNotification() {
    //     return medicalCheckupRepository.findAll().stream()
    //             .filter(checkup -> hasHealthImplications(checkup) && 
    //                              (checkup.getParentNotified() == null || !checkup.getParentNotified()))
    //             .map(this::convertToDTO)
    //             .collect(Collectors.toList());
    // }

    // COMMENTED OUT - Replaced with in-app notification system
    // @Override
    // public List<MedicalCheckupDTO> getCheckupsWithHealthImplications(LocalDate startDate, LocalDate endDate) {
    //     return medicalCheckupRepository.findByCheckupDateBetween(startDate, endDate).stream()
    //             .filter(this::hasHealthImplications)
    //             .map(this::convertToDTO)
    //             .collect(Collectors.toList());
    // }

    @Override
    public void deleteMedicalCheckup(Long id) {
        if (!medicalCheckupRepository.existsById(id)) {
            throw new EntityNotFoundException("Không tìm thấy lịch sử khám bệnh với ID: " + id);
        }
        medicalCheckupRepository.deleteById(id);
    }

    /**
     * Check if a medical checkup has health implications that require parent notification
     */
    private boolean hasHealthImplications(MedicalCheckup checkup) {
        // Check for urgent conditions
        if (checkup.getBodyTemperature() != null && (checkup.getBodyTemperature() > 38.5 || checkup.getBodyTemperature() < 35.0)) {
            return true;
        }
        
        if (checkup.getBloodPressure() != null && (
            checkup.getBloodPressure().contains("140") || 
            checkup.getBloodPressure().contains("90") ||
            checkup.getBloodPressure().toLowerCase().contains("high") ||
            checkup.getBloodPressure().toLowerCase().contains("low"))) {
            return true;
        }

        if (checkup.getHeartRate() != null && (checkup.getHeartRate() > 120 || checkup.getHeartRate() < 60)) {
            return true;
        }

        // Check for attention needed conditions
        if (checkup.getFollowUpNeeded() != null && checkup.getFollowUpNeeded()) {
            return true;
        }

        if (checkup.getDiagnosis() != null && !checkup.getDiagnosis().trim().isEmpty() && 
            !checkup.getDiagnosis().toLowerCase().contains("bình thường") &&
            !checkup.getDiagnosis().toLowerCase().contains("khỏe mạnh")) {
            return true;
        }

        if (checkup.getBmi() != null && (checkup.getBmi() > 25 || checkup.getBmi() < 18.5)) {
            return true;
        }

        if ((checkup.getVisionLeft() != null && !checkup.getVisionLeft().equals("20/20")) ||
            (checkup.getVisionRight() != null && !checkup.getVisionRight().equals("20/20"))) {
            return true;
        }

        return false;
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
    
    // === NEW IN-APP NOTIFICATION SYSTEM IMPLEMENTATIONS ===

    @Override
    public List<MedicalCheckupDTO> createMedicalCheckupsWithStudents(MedicalCheckupCreateRequestDTO request) {
        // TODO: Implement proper business logic for creating checkups with students and notifications
        // For now, return empty list to allow compilation
        return List.of();
    }

    @Override
    public void notifyParentsCheckup(Long checkupId) {
        // TODO: Implement in-app notification system for parents
        // This should create SystemNotification records and update notification recipients
    }

    @Override
    public List<StudentConsentDTO> getStudentConsents(Long checkupId) {
        // TODO: Implement logic to get parent consent status for special checkups
        // This should query SpecialCheckupConsent and NotificationRecipients tables
        return List.of();
    }

    @Override
    public List<ClassDTO> getClasses() {
        // Get distinct classes from students
        return studentRepository.findDistinctClassNames().stream()
                .map(className -> {
                    List<Student> studentsInClass = studentRepository.findByClassName(className);
                    String gradeLevel = studentsInClass.isEmpty() ? "" : studentsInClass.get(0).getGradeLevel();
                    String schoolYear = studentsInClass.isEmpty() ? "" : studentsInClass.get(0).getSchoolYear();
                    
                    return ClassDTO.builder()
                            .className(className)
                            .gradeLevel(gradeLevel)
                            .schoolYear(schoolYear)
                            .studentCount(studentsInClass.size())
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<StudentDTO> getStudentsByClass(String classId) {
        return studentRepository.findByClassName(classId).stream()
                .map(this::convertStudentToDTO)
                .collect(Collectors.toList());
    }
    
    // Helper method to convert Student entity to DTO
    private StudentDTO convertStudentToDTO(Student student) {
        return StudentDTO.builder()
                .id(student.getId())
                .fullName(student.getFullName())
                .dateOfBirth(student.getDateOfBirth())
                .gender(student.getGender())
                .studentId(student.getStudentId())
                .className(student.getClassName())
                .gradeLevel(student.getGradeLevel())
                .schoolYear(student.getSchoolYear())
                .imageUrl(student.getImageUrl())
                .healthProfileId(student.getHealthProfile() != null ? student.getHealthProfile().getId() : null)
                .parentId(student.getParent() != null ? student.getParent().getId() : null)
                .build();
    }
}
