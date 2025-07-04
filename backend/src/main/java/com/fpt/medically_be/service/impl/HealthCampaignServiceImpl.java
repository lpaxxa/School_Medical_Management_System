package com.fpt.medically_be.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fpt.medically_be.dto.request.HealthCampaignCreateDTO;
import com.fpt.medically_be.dto.response.CampaignStatisticsDTO;
import com.fpt.medically_be.dto.response.HealthCampaignResponseDTO;
import com.fpt.medically_be.dto.response.StudentCheckupStatusDTO;
import com.fpt.medically_be.entity.CheckupStatus;
import com.fpt.medically_be.entity.HealthCampaign;
import com.fpt.medically_be.entity.HealthCampaignStatus;
import com.fpt.medically_be.entity.ParentConsent;
import com.fpt.medically_be.entity.Student;
import com.fpt.medically_be.entity.Parent;
import com.fpt.medically_be.entity.AccountMember;
import com.fpt.medically_be.exception.ResourceNotFoundException;
import com.fpt.medically_be.repos.HealthCampaignRepository;
import com.fpt.medically_be.repos.MedicalCheckupRepository;
import com.fpt.medically_be.repos.ParentConsentRepository;
import com.fpt.medically_be.repos.StudentRepository;
import com.fpt.medically_be.repos.AccountMemberRepository;
import com.fpt.medically_be.service.HealthCampaignService;
import com.fpt.medically_be.service.NotificationService;
import com.fpt.medically_be.service.ParentConsentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HealthCampaignServiceImpl implements HealthCampaignService {

    private final HealthCampaignRepository healthCampaignRepository;
    private final StudentRepository studentRepository;
    private final ParentConsentRepository parentConsentRepository;
    private final MedicalCheckupRepository medicalCheckupRepository;
    private final ParentConsentService parentConsentService;
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;
    private final AccountMemberRepository accountMemberRepository;

    @Override
    public List<HealthCampaignResponseDTO> getAllHealthCampaigns() {
        List<HealthCampaign> campaigns = healthCampaignRepository.findAll();
        return campaigns.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public HealthCampaignResponseDTO getHealthCampaignById(Long id) {
        HealthCampaign campaign = healthCampaignRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chiến dịch sức khỏe với ID: " + id));
        return mapToDTO(campaign);
    }

    @Override
    public HealthCampaignResponseDTO createHealthCampaign(HealthCampaignCreateDTO dto) {
        HealthCampaign campaign = new HealthCampaign();
        campaign.setTitle(dto.getTitle());
        campaign.setDescription(dto.getDescription());
        campaign.setStartDate(dto.getStartDate());
        campaign.setEndDate(dto.getEndDate());
        campaign.setNotes(dto.getNotes());
        campaign.setStatus(dto.getStatus());

        // Xử lý danh sách mục kiểm tra đặc biệt
        if (dto.getSpecialCheckupItems() != null && !dto.getSpecialCheckupItems().isEmpty()) {
            try {
                String specialCheckupItemsJson = objectMapper.writeValueAsString(dto.getSpecialCheckupItems());
                campaign.setSpecialCheckupItems(specialCheckupItemsJson);
            } catch (JsonProcessingException e) {
                throw new RuntimeException("Lỗi khi xử lý danh sách mục kiểm tra đặc biệt", e);
            }
        }

        HealthCampaign savedCampaign = healthCampaignRepository.save(campaign);
        return mapToDTO(savedCampaign);
    }

    @Override
    public HealthCampaignResponseDTO updateHealthCampaign(Long id, HealthCampaignCreateDTO dto) {
        HealthCampaign campaign = healthCampaignRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chiến dịch sức khỏe với ID: " + id));

        campaign.setTitle(dto.getTitle());
        campaign.setDescription(dto.getDescription());
        campaign.setStartDate(dto.getStartDate());
        campaign.setEndDate(dto.getEndDate());
        campaign.setNotes(dto.getNotes());
        campaign.setStatus(dto.getStatus());

        // Xử lý danh sách mục kiểm tra đặc biệt
        if (dto.getSpecialCheckupItems() != null && !dto.getSpecialCheckupItems().isEmpty()) {
            try {
                String specialCheckupItemsJson = objectMapper.writeValueAsString(dto.getSpecialCheckupItems());
                campaign.setSpecialCheckupItems(specialCheckupItemsJson);
            } catch (JsonProcessingException e) {
                throw new RuntimeException("Lỗi khi xử lý danh sách mục kiểm tra đặc biệt", e);
            }
        }

        HealthCampaign updatedCampaign = healthCampaignRepository.save(campaign);
        return mapToDTO(updatedCampaign);
    }

    @Override
    public void deleteHealthCampaign(Long id) {
        if (!healthCampaignRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy chiến dịch sức khỏe với ID: " + id);
        }
        healthCampaignRepository.deleteById(id);
    }

    @Override
    public List<HealthCampaignResponseDTO> findByTitle(String title) {
        List<HealthCampaign> campaigns = healthCampaignRepository.findByTitleContainingIgnoreCase(title);
        return campaigns.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<HealthCampaignResponseDTO> findByStatus(HealthCampaignStatus status) {
        List<HealthCampaign> campaigns = healthCampaignRepository.findByStatus(status);
        return campaigns.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public HealthCampaignResponseDTO updateHealthCampaignStatus(Long id, HealthCampaignStatus status) {
        HealthCampaign campaign = healthCampaignRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chiến dịch sức khỏe với ID: " + id));

        campaign.setStatus(status);
        HealthCampaign updatedCampaign = healthCampaignRepository.save(campaign);
        return mapToDTO(updatedCampaign);
    }

    @Override
    @Transactional
    public int sendNotificationsToParents(Long campaignId, List<Long> studentIds) {
        HealthCampaign campaign = healthCampaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chiến dịch sức khỏe với ID: " + campaignId));

        int notificationCount = 0;

        for (Long studentId : studentIds) {
            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy học sinh với ID: " + studentId));

            if (parentConsentRepository.findByHealthCampaignIdAndStudentId(campaignId, studentId).isPresent()) {
                continue;
            }

            Parent studentParent = student.getParent();
            if (studentParent == null) {
                continue;
            }

            // Sửa lỗi: Sử dụng account thay vì accountId vì Parent có mối quan hệ @OneToOne với AccountMember
            AccountMember parentAccount = studentParent.getAccount();
            if (parentAccount == null) {
                // Bỏ qua nếu phụ huynh không có tài khoản liên kết
                continue;
            }

            ParentConsent consent = new ParentConsent();
            consent.setHealthCampaign(campaign);
            consent.setStudent(student);
            consent.setParent(parentAccount);
            consent.setConsentGiven(false);

            ParentConsent savedConsent = parentConsentRepository.save(consent);

            boolean notificationSent = sendNotificationToParent(savedConsent);

            if (notificationSent) {
                notificationCount++;
            }
        }

        return notificationCount;
    }

    private boolean sendNotificationToParent(ParentConsent consent) {
        try {
            String title = "Thông báo kiểm tra y tế định kỳ";
            String content = "Kính gửi Phụ huynh, Nhà trường thông báo về kế hoạch kiểm tra sức khỏe định kỳ cho học sinh. " +
                    "Vui lòng xác nhận đồng ý cho con tham gia kiểm tra sức khỏe.";

            Map<String, Object> data = new HashMap<>();
            data.put("consentId", consent.getId());
            data.put("campaignId", consent.getHealthCampaign().getId());
            data.put("campaignTitle", consent.getHealthCampaign().getTitle());
            data.put("studentId", consent.getStudent().getId());
            data.put("studentName", consent.getStudent().getFullName());

            // AccountMember có ID là String, không phải Long, nên cần truyền trực tiếp ID dạng String
            String parentId = consent.getParent().getId();

            // Gọi phương thức đã được cập nhật để nhận String ID
            notificationService.sendNotificationToUser(
                    parentId,
                    title,
                    content,
                    data,
                    "HEALTH_CAMPAIGN"
            );

            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public List<StudentCheckupStatusDTO> getStudentsForCampaign(Long campaignId, Boolean consentGiven) {
        HealthCampaign campaign = healthCampaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chiến dịch sức khỏe với ID: " + campaignId));

        List<ParentConsent> consents;

        if (consentGiven != null) {
            if (consentGiven) {
                consents = parentConsentRepository.findByHealthCampaignIdAndConsentGivenTrue(campaignId);
            } else {
                List<ParentConsent> allConsents = parentConsentRepository.findByHealthCampaignId(campaignId);
                consents = allConsents.stream()
                        .filter(consent -> !consent.getConsentGiven())
                        .collect(Collectors.toList());
            }
        } else {
            consents = parentConsentRepository.findByHealthCampaignId(campaignId);
        }

        return consents.stream().map(consent -> {
            StudentCheckupStatusDTO dto = new StudentCheckupStatusDTO();

            dto.setStudentId(consent.getStudent().getId());
            dto.setStudentName(consent.getStudent().getFullName());
            dto.setStudentClass(consent.getStudent().getClassName());

            dto.setParentId(consent.getParent().getId());

            // Sửa lỗi: Lấy tên phụ huynh từ Student.getParent() thay vì từ AccountMember
            // vì AccountMember không có fullName, chỉ có username
            Parent studentParent = consent.getStudent().getParent();
            String parentName = (studentParent != null) ? studentParent.getFullName() : consent.getParent().getUsername();
            dto.setParentName(parentName);

            dto.setParentConsentId(consent.getId());
            dto.setConsentGiven(consent.getConsentGiven());
            dto.setConsentDate(consent.getConsentDate());

            dto.setParentNotes(consent.getParentNotes());

            if (consent.getSpecialCheckupItems() != null && !consent.getSpecialCheckupItems().isEmpty()) {
                try {
                    List<String> specialItems = objectMapper.readValue(
                            consent.getSpecialCheckupItems(),
                            new TypeReference<List<String>>() {}
                    );
                    dto.setSpecialCheckupItems(specialItems);
                } catch (JsonProcessingException e) {
                    dto.setSpecialCheckupItems(new ArrayList<>());
                }
            } else {
                dto.setSpecialCheckupItems(new ArrayList<>());
            }

            medicalCheckupRepository.findByHealthCampaignIdAndStudentId(campaignId, consent.getStudent().getId())
                    .ifPresent(checkup -> {
                        dto.setMedicalCheckupId(checkup.getId());
                        dto.setCheckupStatus(checkup.getCheckupStatus());
                    });

            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    public CampaignStatisticsDTO getCampaignStatistics(Long campaignId) {
        HealthCampaign campaign = healthCampaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chiến dịch sức khỏe với ID: " + campaignId));

        List<ParentConsent> allConsents = parentConsentRepository.findByHealthCampaignId(campaignId);
        long totalStudents = allConsents.size();

        long notificationsSent = totalStudents;

        long consentReceived = allConsents.stream()
                .filter(consent -> consent.getConsentGiven() != null)
                .count();

        long consentApproved = parentConsentRepository.countByHealthCampaignIdAndConsentGivenTrue(campaignId);

        long consentRejected = allConsents.stream()
                .filter(consent -> consent.getConsentGiven() != null && !consent.getConsentGiven())
                .count();

        long checkupsWaiting = medicalCheckupRepository.countByHealthCampaignIdAndCheckupStatus(campaignId, CheckupStatus.WAITING);
        long checkupsInProgress = medicalCheckupRepository.countByHealthCampaignIdAndCheckupStatus(campaignId, CheckupStatus.IN_PROGRESS);
        long checkupsCompleted = medicalCheckupRepository.countByHealthCampaignIdAndCheckupStatus(campaignId, CheckupStatus.COMPLETED);
        long checkupsCancelled = medicalCheckupRepository.countByHealthCampaignIdAndCheckupStatus(campaignId, CheckupStatus.CANCELLED);

        long followUpNeeded = medicalCheckupRepository.countStudentsNeedingFollowUpByHealthCampaignId(campaignId);
        long normalResults = checkupsCompleted - followUpNeeded;

        double consentRate = totalStudents > 0 ? (double) consentApproved / totalStudents * 100 : 0;
        double completionRate = consentApproved > 0 ? (double) checkupsCompleted / consentApproved * 100 : 0;
        double followUpRate = checkupsCompleted > 0 ? (double) followUpNeeded / checkupsCompleted * 100 : 0;

        return CampaignStatisticsDTO.builder()
                .campaignId(campaign.getId())
                .campaignTitle(campaign.getTitle())
                .startDate(campaign.getStartDate())
                .endDate(campaign.getEndDate())
                .totalStudents(totalStudents)
                .notificationsSent(notificationsSent)
                .consentReceived(consentReceived)
                .consentApproved(consentApproved)
                .consentRejected(consentRejected)
                .checkupsWaiting(checkupsWaiting)
                .checkupsInProgress(checkupsInProgress)
                .checkupsCompleted(checkupsCompleted)
                .checkupsCancelled(checkupsCancelled)
                .normalResults(normalResults)
                .followUpNeeded(followUpNeeded)
                .consentRate(consentRate)
                .completionRate(completionRate)
                .followUpRate(followUpRate)
                .build();
    }

    @Override
    public List<String> getSpecialCheckupItems(Long campaignId) {
        HealthCampaign campaign = healthCampaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chiến dịch sức khỏe với ID: " + campaignId));

        if (campaign.getSpecialCheckupItems() != null && !campaign.getSpecialCheckupItems().isEmpty()) {
            try {
                return objectMapper.readValue(
                        campaign.getSpecialCheckupItems(),
                        new TypeReference<List<String>>() {}
                );
            } catch (JsonProcessingException e) {
                return new ArrayList<>();
            }
        }

        return new ArrayList<>();
    }

    private HealthCampaignResponseDTO mapToDTO(HealthCampaign campaign) {
        // Lấy thông tin thống kê
        Long totalStudents = (long) parentConsentRepository.findByHealthCampaignId(campaign.getId()).size();
        Long consentedStudents = parentConsentRepository.countByHealthCampaignIdAndConsentGivenTrue(campaign.getId());
        Long completedCheckups = medicalCheckupRepository.countByHealthCampaignIdAndCheckupStatus(campaign.getId(), CheckupStatus.COMPLETED);
        Long pendingCheckups = medicalCheckupRepository.countByHealthCampaignIdAndCheckupStatus(campaign.getId(), CheckupStatus.WAITING);

        // Chuyển đổi JSON thành List<String> cho specialCheckupItems
        List<String> specialItems = new ArrayList<>();
        if (campaign.getSpecialCheckupItems() != null && !campaign.getSpecialCheckupItems().isEmpty()) {
            try {
                specialItems = objectMapper.readValue(
                        campaign.getSpecialCheckupItems(),
                        new TypeReference<List<String>>() {}
                );
            } catch (JsonProcessingException e) {
                // Log error và để danh sách trống
            }
        }

        return HealthCampaignResponseDTO.builder()
                .id(campaign.getId())
                .title(campaign.getTitle())
                .description(campaign.getDescription())
                .startDate(campaign.getStartDate())
                .endDate(campaign.getEndDate())
                .notes(campaign.getNotes())
                .status(campaign.getStatus())
                .specialCheckupItems(specialItems)
                .totalStudents(totalStudents)
                .consentedStudents(consentedStudents)
                .completedCheckups(completedCheckups)
                .pendingCheckups(pendingCheckups)
                .createdAt(campaign.getCreatedAt())
                .updatedAt(campaign.getUpdatedAt())
                .build();
    }
}
