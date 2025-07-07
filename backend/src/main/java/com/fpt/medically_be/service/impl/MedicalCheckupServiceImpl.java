package com.fpt.medically_be.service.impl;

import com.fpt.medically_be.dto.request.MedicalCheckupRequestDTO;
import com.fpt.medically_be.dto.response.MedicalCheckupResponseDTO;
import com.fpt.medically_be.entity.CheckupStatus;
import com.fpt.medically_be.entity.MedicalCheckup;
import com.fpt.medically_be.entity.Nurse;
import com.fpt.medically_be.entity.Student;
import com.fpt.medically_be.entity.HealthCampaign;
import com.fpt.medically_be.entity.ParentConsent;
import com.fpt.medically_be.repos.MedicalCheckupRepository;
import com.fpt.medically_be.repos.NurseRepository;
import com.fpt.medically_be.repos.StudentRepository;
import com.fpt.medically_be.repos.HealthCampaignRepository;
import com.fpt.medically_be.repos.ParentConsentRepository;
import com.fpt.medically_be.service.MedicalCheckupService;
import com.fpt.medically_be.service.NotificationService;
import com.fpt.medically_be.service.EmailService;
import com.fpt.medically_be.exception.ResourceNotFoundException;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class MedicalCheckupServiceImpl implements MedicalCheckupService {

    private final MedicalCheckupRepository medicalCheckupRepository;
    private final StudentRepository studentRepository;
    private final NurseRepository nurseRepository;
    private final HealthCampaignRepository healthCampaignRepository;
    private final ParentConsentRepository parentConsentRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    @Autowired
    public MedicalCheckupServiceImpl(MedicalCheckupRepository medicalCheckupRepository,
                                    StudentRepository studentRepository,
                                    NurseRepository nurseRepository,
                                    HealthCampaignRepository healthCampaignRepository,
                                    ParentConsentRepository parentConsentRepository,
                                    NotificationService notificationService,
                                    EmailService emailService) {
        this.medicalCheckupRepository = medicalCheckupRepository;
        this.studentRepository = studentRepository;
        this.nurseRepository = nurseRepository;
        this.healthCampaignRepository = healthCampaignRepository;
        this.parentConsentRepository = parentConsentRepository;
        this.notificationService = notificationService;
        this.emailService = emailService;
    }

    @Override
    public List<MedicalCheckupResponseDTO> getAllMedicalCheckups() {
        return medicalCheckupRepository.findAll().stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public MedicalCheckupResponseDTO getMedicalCheckupById(Long id) {
        return medicalCheckupRepository.findById(id)
                .map(this::convertToResponseDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lịch sử khám bệnh với ID: " + id));
    }

    @Override
    public MedicalCheckupResponseDTO createMedicalCheckup(MedicalCheckupRequestDTO requestDTO) {
        MedicalCheckup medicalCheckup = convertToEntity(requestDTO);
        MedicalCheckup savedMedicalCheckup = medicalCheckupRepository.save(medicalCheckup);
        return convertToResponseDTO(savedMedicalCheckup);
    }

    @Override
    public MedicalCheckupResponseDTO updateMedicalCheckup(Long id, MedicalCheckupRequestDTO requestDTO) {
        MedicalCheckup existingCheckup = medicalCheckupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lịch sử khám bệnh với ID: " + id));

        updateEntityFromRequest(existingCheckup, requestDTO);
        MedicalCheckup updatedCheckup = medicalCheckupRepository.save(existingCheckup);
        return convertToResponseDTO(updatedCheckup);
    }

    @Override
    public MedicalCheckupResponseDTO updateMedicalCheckupResults(Long id, MedicalCheckupRequestDTO requestDTO) {
        MedicalCheckup existingCheckup = medicalCheckupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lịch sử khám bệnh với ID: " + id));

        // Cập nhật chỉ kết quả kiểm tra
        updateResultsFromRequest(existingCheckup, requestDTO);
        existingCheckup.setCheckupStatus(CheckupStatus.COMPLETED);

        MedicalCheckup updatedCheckup = medicalCheckupRepository.save(existingCheckup);
        return convertToResponseDTO(updatedCheckup);
    }

    @Override
    public MedicalCheckupResponseDTO updateMedicalCheckupStatus(Long id, CheckupStatus status) {
        MedicalCheckup checkup = medicalCheckupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lịch sử khám bệnh với ID: " + id));

        checkup.setCheckupStatus(status);
        MedicalCheckup updatedCheckup = medicalCheckupRepository.save(checkup);
        return convertToResponseDTO(updatedCheckup);
    }

    @Override
    public List<MedicalCheckupResponseDTO> getMedicalCheckupsByHealthCampaign(Long campaignId) {
        return medicalCheckupRepository.findByHealthCampaignId(campaignId).stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<MedicalCheckupResponseDTO> getMedicalCheckupsByHealthCampaignAndStatus(Long campaignId, CheckupStatus status) {
        return medicalCheckupRepository.findByHealthCampaignIdAndCheckupStatus(campaignId, status).stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<MedicalCheckupResponseDTO> getMedicalCheckupsByStudent(Long studentId) {
        return medicalCheckupRepository.findByStudentId(studentId).stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<MedicalCheckupResponseDTO> getMedicalCheckupsByMedicalStaff(Long staffId) {
        return medicalCheckupRepository.findByMedicalStaffId(staffId).stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<MedicalCheckupResponseDTO> getMedicalCheckupsByDateRange(LocalDate startDate, LocalDate endDate) {
        return medicalCheckupRepository.findByCheckupDateBetween(startDate, endDate).stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public boolean sendCheckupResultsToParent(Long checkupId) {
        MedicalCheckup checkup = medicalCheckupRepository.findById(checkupId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lịch sử khám bệnh với ID: " + checkupId));

        try {
            String title = "Kết quả kiểm tra sức khỏe";
            String content = String.format("Kết quả kiểm tra sức khỏe của học sinh %s đã sẵn sàng. " +
                    "Vui lòng đăng nhập vào hệ thống để xem chi tiết.",
                    checkup.getStudent().getFullName());

            Map<String, Object> data = new HashMap<>();
            data.put("checkupId", checkup.getId());
            data.put("studentId", checkup.getStudent().getId());
            data.put("studentName", checkup.getStudent().getFullName());
            data.put("checkupDate", checkup.getCheckupDate());

            // Gửi thông báo đến phụ huynh
            if (checkup.getParentConsent() != null) {
                notificationService.sendNotificationToUser(
                        checkup.getParentConsent().getParent().getId(),
                        title,
                        content,
                        data,
                        "CHECKUP_RESULT"
                );
            }

            // Cập nhật trạng thái đã thông báo
            checkup.setParentNotified(true);
            medicalCheckupRepository.save(checkup);

            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public List<MedicalCheckupResponseDTO> getStudentsNeedingFollowUp(Long campaignId) {
        return medicalCheckupRepository.findByHealthCampaignIdAndFollowUpNeededTrue(campaignId).stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public boolean scheduleHealthConsultation(Long checkupId, Map<String, Object> consultationDetails) {
        MedicalCheckup checkup = medicalCheckupRepository.findById(checkupId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lịch s�� khám bệnh với ID: " + checkupId));

        try {
            String title = "Lịch hẹn tư vấn sức khỏe";
            String content = String.format("Đã lên lịch tư vấn sức khỏe cho học sinh %s. " +
                    "Vui lòng xem chi tiết lịch hẹn.",
                    checkup.getStudent().getFullName());

            Map<String, Object> data = new HashMap<>();
            data.put("checkupId", checkup.getId());
            data.put("studentId", checkup.getStudent().getId());
            data.put("consultationDetails", consultationDetails);

            // Gửi thông báo đến phụ huynh
            if (checkup.getParentConsent() != null) {
                notificationService.sendNotificationToUser(
                        checkup.getParentConsent().getParent().getId(),
                        title,
                        content,
                        data,
                        "CONSULTATION_SCHEDULED"
                );
            }

            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public boolean sendResultsToParent(Long checkupId) {
        return sendCheckupResultsToParent(checkupId);
    }

    @Override
    public List<MedicalCheckupResponseDTO> getCheckupsByStatus(CheckupStatus status) {
        return medicalCheckupRepository.findByCheckupStatus(status).stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<MedicalCheckupResponseDTO> getCheckupsByDate(LocalDate date) {
        return medicalCheckupRepository.findByCheckupDate(date).stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<MedicalCheckupResponseDTO> getCheckupHistoryByStudent(Long studentId) {
        return getMedicalCheckupsByStudent(studentId);
    }

    private boolean needsAttention(MedicalCheckup checkup) {
        // Check vital signs
        if (checkup.getBodyTemperature() != null && (checkup.getBodyTemperature() > 37.5 || checkup.getBodyTemperature() < 35.0)) {
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

    private MedicalCheckupResponseDTO convertToResponseDTO(MedicalCheckup checkup) {
        MedicalCheckupResponseDTO dto = new MedicalCheckupResponseDTO();
        dto.setId(checkup.getId());
        dto.setCheckupDate(checkup.getCheckupDate());
        dto.setCheckupType(checkup.getCheckupType());
        dto.setCheckupStatus(checkup.getCheckupStatus());

        // Thông tin học sinh
        if (checkup.getStudent() != null) {
            dto.setStudentId(checkup.getStudent().getId());
            dto.setStudentName(checkup.getStudent().getFullName());
            dto.setStudentClass(checkup.getStudent().getClassName());
        }

        // Thông tin chiến dịch
        if (checkup.getHealthCampaign() != null) {
            dto.setHealthCampaignId(checkup.getHealthCampaign().getId());
            dto.setCampaignTitle(checkup.getHealthCampaign().getTitle());
        }

        // Thông tin đồng ý phụ huynh
        if (checkup.getParentConsent() != null) {
            dto.setParentConsentId(checkup.getParentConsent().getId());
        }

        // Dữ liệu kiểm tra
        dto.setHeight(checkup.getHeight());
        dto.setWeight(checkup.getWeight());
        dto.setBmi(checkup.getBmi());
        dto.setBloodPressure(checkup.getBloodPressure());
        dto.setVisionLeft(checkup.getVisionLeft());
        dto.setVisionRight(checkup.getVisionRight());
        dto.setHearingStatus(checkup.getHearingStatus());
        dto.setHeartRate(checkup.getHeartRate());
        dto.setBodyTemperature(checkup.getBodyTemperature());
        dto.setDiagnosis(checkup.getDiagnosis());
        dto.setRecommendations(checkup.getRecommendations());
        dto.setFollowUpNeeded(checkup.getFollowUpNeeded());
        dto.setParentNotified(checkup.getParentNotified());

        // Thông tin nhân viên y tế
        if (checkup.getMedicalStaff() != null) {
            dto.setMedicalStaffId(checkup.getMedicalStaff().getId());
            dto.setMedicalStaffName(checkup.getMedicalStaff().getFullName());
        }

        dto.setCreatedAt(checkup.getCreatedAt());
        dto.setUpdatedAt(checkup.getUpdatedAt());

        return dto;
    }

    private MedicalCheckup convertToEntity(MedicalCheckupRequestDTO requestDTO) {
        MedicalCheckup checkup = new MedicalCheckup();

        // Set basic information
        checkup.setCheckupDate(requestDTO.getCheckupDate());
        checkup.setCheckupType(requestDTO.getCheckupType());
        checkup.setCheckupStatus(requestDTO.getCheckupStatus() != null ? requestDTO.getCheckupStatus() : CheckupStatus.WAITING);

        // Set relationships
        if (requestDTO.getStudentId() != null) {
            Student student = studentRepository.findById(requestDTO.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy học sinh với ID: " + requestDTO.getStudentId()));
            checkup.setStudent(student);
        }

        if (requestDTO.getHealthCampaignId() != null) {
            HealthCampaign campaign = healthCampaignRepository.findById(requestDTO.getHealthCampaignId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chiến dịch với ID: " + requestDTO.getHealthCampaignId()));
            checkup.setHealthCampaign(campaign);
        }

        if (requestDTO.getParentConsentId() != null) {
            ParentConsent consent = parentConsentRepository.findById(requestDTO.getParentConsentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đồng ý phụ huynh với ID: " + requestDTO.getParentConsentId()));
            checkup.setParentConsent(consent);
        }

        if (requestDTO.getMedicalStaffId() != null) {
            Nurse nurse = nurseRepository.findById(requestDTO.getMedicalStaffId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy y tá với ID: " + requestDTO.getMedicalStaffId()));
            checkup.setMedicalStaff(nurse);
        }

        // Set checkup data
        updateResultsFromRequest(checkup, requestDTO);

        return checkup;
    }

    private void updateEntityFromRequest(MedicalCheckup checkup, MedicalCheckupRequestDTO requestDTO) {
        checkup.setCheckupDate(requestDTO.getCheckupDate());
        checkup.setCheckupType(requestDTO.getCheckupType());

        if (requestDTO.getCheckupStatus() != null) {
            checkup.setCheckupStatus(requestDTO.getCheckupStatus());
        }

        updateResultsFromRequest(checkup, requestDTO);
    }

    private void updateResultsFromRequest(MedicalCheckup checkup, MedicalCheckupRequestDTO requestDTO) {
        checkup.setHeight(requestDTO.getHeight());
        checkup.setWeight(requestDTO.getWeight());
        checkup.setBmi(requestDTO.getBmi());
        checkup.setBloodPressure(requestDTO.getBloodPressure());
        checkup.setVisionLeft(requestDTO.getVisionLeft());
        checkup.setVisionRight(requestDTO.getVisionRight());
        checkup.setHearingStatus(requestDTO.getHearingStatus());
        checkup.setHeartRate(requestDTO.getHeartRate());
        checkup.setBodyTemperature(requestDTO.getBodyTemperature());
        checkup.setDiagnosis(requestDTO.getDiagnosis());
        checkup.setRecommendations(requestDTO.getRecommendations());
        checkup.setFollowUpNeeded(requestDTO.getFollowUpNeeded());
    }
}
