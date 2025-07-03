package com.fpt.medically_be.service.impl;

import com.fpt.medically_be.dto.MedicalCheckupDTO;
import com.fpt.medically_be.dto.StudentDTO;
import com.fpt.medically_be.dto.request.MedicalCheckupCreateRequestDTO;
import com.fpt.medically_be.dto.response.ClassDTO;
import com.fpt.medically_be.dto.response.StudentConsentDTO;
import com.fpt.medically_be.entity.*;
import com.fpt.medically_be.repos.*;
import com.fpt.medically_be.service.MedicalCheckupService;
import com.fpt.medically_be.service.EmailService;
import com.fpt.medically_be.service.SystemNotificationService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class MedicalCheckupServiceImpl implements MedicalCheckupService {

    private final MedicalCheckupRepository medicalCheckupRepository;
    private final StudentRepository studentRepository;
    private final NurseRepository medicalStaffRepository;
    private final EmailService emailService;
    private final HealthCampaignRepository healthCampaignRepository;
    private final ParentRepository parentRepository;
    private final NotificationRecipientsRepo notificationRecipientsRepo;
    private final SpecialCheckupConsentRepository specialCheckupConsentRepository;
    private final SystemNotificationService systemNotificationService;

    @Autowired
    public MedicalCheckupServiceImpl(MedicalCheckupRepository medicalCheckupRepository,
                                    StudentRepository studentRepository,
                                    NurseRepository medicalStaffRepository,
                                    EmailService emailService,
                                    HealthCampaignRepository healthCampaignRepository,
                                    ParentRepository parentRepository,
                                    NotificationRecipientsRepo notificationRecipientsRepo,
                                    SpecialCheckupConsentRepository specialCheckupConsentRepository,
                                    SystemNotificationService systemNotificationService) {
        this.medicalCheckupRepository = medicalCheckupRepository;
        this.studentRepository = studentRepository;
        this.medicalStaffRepository = medicalStaffRepository;
        this.emailService = emailService;
        this.healthCampaignRepository = healthCampaignRepository;
        this.parentRepository = parentRepository;
        this.notificationRecipientsRepo = notificationRecipientsRepo;
        this.specialCheckupConsentRepository = specialCheckupConsentRepository;
        this.systemNotificationService = systemNotificationService;
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
        // Get the health campaign
        HealthCampaign healthCampaign = healthCampaignRepository.findById(request.getHealthCampaignId())
                .orElseThrow(() -> new EntityNotFoundException("Health campaign not found with ID: " + request.getHealthCampaignId()));
        
        // Get the nurse creating the checkups
        Nurse nurse = medicalStaffRepository.findById(request.getCreatedByNurseId())
                .orElseThrow(() -> new EntityNotFoundException("Nurse not found with ID: " + request.getCreatedByNurseId()));
        
        List<MedicalCheckupDTO> createdCheckups = List.of();
        
        if (request.getStudentIds() != null && !request.getStudentIds().isEmpty()) {
            // Create checkups for specified students
            List<Student> students = studentRepository.findAllById(request.getStudentIds());
            
            createdCheckups = students.stream().map(student -> {
                // Create medical checkup record
                MedicalCheckup checkup = new MedicalCheckup();
                checkup.setStudent(student);
                checkup.setMedicalStaff(nurse);
                checkup.setCheckupDate(request.getCheckupDate());
                checkup.setCheckupType(request.getCheckupType());
                checkup.setParentNotified(false);
                
                MedicalCheckup savedCheckup = medicalCheckupRepository.save(checkup);
                
                // Create in-app notification for parent if auto-notify is enabled
                if (request.getAutoNotifyParents() && student.getParent() != null) {
                    String message = String.format("Thông báo khám sức khỏe định kỳ cho học sinh %s vào ngày %s. " +
                            "Vui lòng xác nhận các hạng mục khám đặc biệt.", 
                            student.getFullName(), request.getCheckupDate());
                    
                    systemNotificationService.createHealthCheckupNotification(
                            student.getParent(), student, healthCampaign, message);
                }
                
                return convertToDTO(savedCheckup);
            }).collect(Collectors.toList());
        }
        
        return createdCheckups;
    }

    @Override
    public void notifyParentsCheckup(Long checkupId) {
        MedicalCheckup checkup = medicalCheckupRepository.findById(checkupId)
                .orElseThrow(() -> new EntityNotFoundException("Medical checkup not found with ID: " + checkupId));
        
        if (checkup.getStudent() != null && checkup.getStudent().getParent() != null) {
            String message = String.format("Kết quả khám sức khỏe của học sinh %s đã có. " +
                    "Chẩn đoán: %s. Khuyến nghị: %s", 
                    checkup.getStudent().getFullName(),
                    checkup.getDiagnosis() != null ? checkup.getDiagnosis() : "Bình thường",
                    checkup.getRecommendations() != null ? checkup.getRecommendations() : "Không có khuyến nghị đặc biệt");
            
            systemNotificationService.createMedicalCheckupResultNotification(
                    checkup.getStudent().getParent(), checkup.getStudent(), checkup, message);
            
            // Mark as parent notified
            checkup.setParentNotified(true);
            medicalCheckupRepository.save(checkup);
        }
    }

    @Override
    public List<StudentConsentDTO> getStudentConsents(Long checkupId) {
        MedicalCheckup checkup = medicalCheckupRepository.findById(checkupId)
                .orElseThrow(() -> new EntityNotFoundException("Medical checkup not found with ID: " + checkupId));
        
        // For now, return basic consent information
        // This would typically involve querying NotificationRecipients and SpecialCheckupConsent
        List<StudentConsentDTO> consents = List.of();
        
        if (checkup.getStudent() != null) {
            Student student = checkup.getStudent();
            Parent parent = student.getParent();
            
            if (parent != null) {
                StudentConsentDTO consent = StudentConsentDTO.builder()
                        .studentId(student.getId())
                        .studentName(student.getFullName())
                        .className(student.getClassName())
                        .parentId(parent.getId())
                        .parentName(parent.getFullName())
                        .parentEmail(parent.getEmail())
                        .overallResponse("PENDING")
                        .hasResponded(false)
                        .specialCheckupConsents(List.of()) // TODO: Implement special checkup consent lookup
                        .build();
                
                consents = List.of(consent);
            }
        }
        
        return consents;
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
