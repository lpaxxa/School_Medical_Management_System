package com.fpt.medically_be.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fpt.medically_be.dto.request.ParentConsentRequestDTO;
import com.fpt.medically_be.dto.response.ParentConsentResponseDTO;
import com.fpt.medically_be.dto.response.ParentAllChildrenNotificationsDTO;
import com.fpt.medically_be.entity.ConsentStatus;
import com.fpt.medically_be.entity.HealthCampaign;
import com.fpt.medically_be.entity.ParentConsent;
import com.fpt.medically_be.entity.Student;
import com.fpt.medically_be.entity.AccountMember;
import com.fpt.medically_be.entity.Parent;
import com.fpt.medically_be.entity.MedicalCheckup;
import com.fpt.medically_be.exception.ResourceNotFoundException;
import com.fpt.medically_be.repos.HealthCampaignRepository;
import com.fpt.medically_be.repos.ParentConsentRepository;
import com.fpt.medically_be.repos.StudentRepository;
import com.fpt.medically_be.repos.MedicalCheckupRepository;
import com.fpt.medically_be.service.ParentConsentService;
import com.fpt.medically_be.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ParentConsentServiceImpl implements ParentConsentService {

    private final ParentConsentRepository parentConsentRepository;
    private final HealthCampaignRepository healthCampaignRepository;
    private final StudentRepository studentRepository;
    private final MedicalCheckupRepository medicalCheckupRepository;
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    @Override
    public List<ParentConsentResponseDTO> getConsentsByHealthCampaign(Long campaignId) {
        List<ParentConsent> consents = parentConsentRepository.findByHealthCampaignId(campaignId);
        return consents.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ParentConsentResponseDTO> getConsentsByStudent(Long studentId) {
        List<ParentConsent> consents = parentConsentRepository.findByStudentId(studentId);
        return consents.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ParentConsentResponseDTO> getConsentsByParent(Long parentId) {
        // Chuyển đổi Long parentId thành String vì AccountMember sử dụng ID kiểu String
        String parentIdStr = parentId.toString();
        List<ParentConsent> consents = parentConsentRepository.findByParent_Id(parentIdStr);
        return consents.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ParentAllChildrenNotificationsDTO getAllChildrenNotificationsByParent(Long parentId) {
        // Lấy danh sách học sinh của phụ huynh
        List<Student> children = studentRepository.findByParentId(parentId);
        
        if (children.isEmpty()) {
            throw new ResourceNotFoundException("Không tìm thấy học sinh nào thuộc về phụ huynh với ID: " + parentId);
        }
        
        // Lấy thông tin phụ huynh
        Parent parent = children.get(0).getParent();
        String parentName = parent != null ? parent.getFullName() : "Unknown";
        
        // Tạo danh sách thông báo cho từng con
        List<ParentAllChildrenNotificationsDTO.ChildNotificationInfo> childrenNotifications = new ArrayList<>();
        long totalNotifications = 0;
        long pendingConsents = 0;
        long approvedConsents = 0;
        long completedCheckups = 0;
        
        for (Student child : children) {
            // Lấy tất cả consent của học sinh này
            List<ParentConsent> childConsents = parentConsentRepository.findByStudentId(child.getId());
            
            // Chuyển đổi thành NotificationDetail
            List<ParentAllChildrenNotificationsDTO.NotificationDetail> notifications = childConsents.stream()
                    .map(this::convertToNotificationDetail)
                    .collect(Collectors.toList());
            
            // Tính tuổi học sinh
            Integer studentAge = null;
            if (child.getDateOfBirth() != null) {
                Period age = Period.between(child.getDateOfBirth(), LocalDate.now());
                studentAge = age.getYears();
            }
            
            // Tạo thông tin cho con này
            ParentAllChildrenNotificationsDTO.ChildNotificationInfo childInfo = ParentAllChildrenNotificationsDTO.ChildNotificationInfo.builder()
                    .studentId(child.getId())
                    .studentName(child.getFullName())
                    .studentClass(child.getClassName())
                    .studentAge(studentAge)
                    .totalNotifications((long) notifications.size())
                    .notifications(notifications)
                    .build();
            
            childrenNotifications.add(childInfo);
            
            // Cập nhật thống kê tổng quan
            totalNotifications += notifications.size();
            pendingConsents += notifications.stream()
                    .filter(n -> n.getConsentStatus() == ConsentStatus.PENDING)
                    .count();
            approvedConsents += notifications.stream()
                    .filter(n -> n.getConsentStatus() == ConsentStatus.APPROVED)
                    .count();
            completedCheckups += notifications.stream()
                    .filter(n -> "COMPLETED".equals(n.getCheckupStatus()))
                    .count();
        }
        
        return ParentAllChildrenNotificationsDTO.builder()
                .parentId(parentId)
                .parentName(parentName)
                .totalNotifications(totalNotifications)
                .pendingConsents(pendingConsents)
                .approvedConsents(approvedConsents)
                .completedCheckups(completedCheckups)
                .childrenNotifications(childrenNotifications)
                .build();
    }

    @Override
    public ParentConsentResponseDTO getConsentByHealthCampaignAndStudent(Long campaignId, Long studentId) {
        ParentConsent consent = parentConsentRepository.findByHealthCampaignIdAndStudentId(campaignId, studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy xác nhận của phụ huynh"));
        return convertToResponseDTO(consent);
    }

    @Override
    @Transactional
    public ParentConsentResponseDTO updateParentConsent(Long consentId, ParentConsentRequestDTO requestDTO) {
        ParentConsent consent = parentConsentRepository.findById(consentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy xác nhận với ID: " + consentId));

        consent.setConsentStatus(requestDTO.getConsentStatus());
        consent.setParentNotes(requestDTO.getParentNotes());

        if (requestDTO.getConsentStatus() == ConsentStatus.APPROVED) {
            consent.setConsentDate(LocalDateTime.now());

            // Lưu danh sách mục kiểm tra đặc biệt
            if (requestDTO.getSpecialCheckupItems() != null && !requestDTO.getSpecialCheckupItems().isEmpty()) {
                try {
                    String specialCheckupItemsJson = objectMapper.writeValueAsString(requestDTO.getSpecialCheckupItems());
                    consent.setSpecialCheckupItems(specialCheckupItemsJson);
                } catch (JsonProcessingException e) {
                    throw new RuntimeException("Lỗi khi xử lý danh sách mục kiểm tra đặc biệt", e);
                }
            }
        }

        ParentConsent updatedConsent = parentConsentRepository.save(consent);
        return convertToResponseDTO(updatedConsent);
    }

    @Override
    public List<ParentConsentResponseDTO> getApprovedConsentsForCampaign(Long campaignId) {
        List<ParentConsent> consents = parentConsentRepository.findByHealthCampaignIdAndConsentStatus(campaignId, ConsentStatus.APPROVED);
        return consents.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Long countConsentsByHealthCampaign(Long campaignId) {
        return (long) parentConsentRepository.findByHealthCampaignId(campaignId).size();
    }

    @Override
    public Long countApprovedConsentsByHealthCampaign(Long campaignId) {
        return parentConsentRepository.countByHealthCampaignIdAndConsentStatus(campaignId, ConsentStatus.APPROVED);
    }

    @Override
    @Transactional
    public int sendRemindersToParents(Long campaignId) {
        HealthCampaign campaign = healthCampaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chiến dịch với ID: " + campaignId));

        // Lấy danh sách các consent chưa được xác nhận
        List<ParentConsent> pendingConsents = parentConsentRepository.findByHealthCampaignId(campaignId)
                .stream()
                .filter(consent -> consent.getConsentStatus() == ConsentStatus.PENDING)
                .collect(Collectors.toList());

        int remindersSent = 0;
        for (ParentConsent consent : pendingConsents) {
            try {
                String title = "Nhắc nhở: Xác nhận kiểm tra y tế định kỳ";
                String content = String.format("Kính gửi Phụ huynh, Nhà trường nhắc nhở về việc xác nhận " +
                        "cho con tham gia kiểm tra sức khỏe định kỳ trong chiến dịch '%s'. " +
                        "Vui lòng xác nhận sớm nhất có thể.", campaign.getTitle());

                Map<String, Object> data = new HashMap<>();
                data.put("consentId", consent.getId());
                data.put("campaignId", campaign.getId());
                data.put("campaignTitle", campaign.getTitle());
                data.put("studentId", consent.getStudent().getId());
                data.put("studentName", consent.getStudent().getFullName());

                notificationService.sendNotificationToUser(
                        consent.getParent().getId(),
                        title,
                        content,
                        data,
                        "HEALTH_CAMPAIGN_REMINDER"
                );

                remindersSent++;
            } catch (Exception e) {
                // Log error nhưng tiếp tục với các consent khác
            }
        }

        return remindersSent;
    }

    @Override
    @Transactional
    public List<ParentConsentResponseDTO> createConsentRequestsForCampaign(Long campaignId, List<Long> studentIds) {
        HealthCampaign campaign = healthCampaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chiến dịch với ID: " + campaignId));

        List<ParentConsentResponseDTO> results = new ArrayList<>();

        for (Long studentId : studentIds) {
            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy học sinh với ID: " + studentId));

            // Kiểm tra xem đã có yêu cầu đồng ý cho học sinh này trong chiến dịch chưa
            if (parentConsentRepository.findByHealthCampaignIdAndStudentId(campaignId, studentId).isPresent()) {
                continue; // Bỏ qua nếu đã có
            }

            Parent studentParent = student.getParent();
            if (studentParent == null) {
                continue; // Bỏ qua nếu học sinh không có thông tin phụ huynh
            }

            AccountMember parentAccount = studentParent.getAccount();
            if (parentAccount == null) {
                continue; // Bỏ qua nếu phụ huynh không có tài khoản
            }

            // Tạo yêu cầu đồng ý mới
            ParentConsent consent = new ParentConsent();
            consent.setHealthCampaign(campaign);
            consent.setStudent(student);
            consent.setParent(parentAccount);
            consent.setConsentStatus(ConsentStatus.PENDING);

            ParentConsent savedConsent = parentConsentRepository.save(consent);

            // Gửi thông báo cho phụ huynh
            sendNotificationToParent(savedConsent);

            // Chuyển đổi thành DTO để trả về
            results.add(convertToResponseDTO(savedConsent));
        }

        return results;
    }

    @Override
    public ParentConsentResponseDTO getParentConsentById(Long consentId) {
        ParentConsent consent = parentConsentRepository.findById(consentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy xác nhận với ID: " + consentId));
        return convertToResponseDTO(consent);
    }

    private void sendNotificationToParent(ParentConsent consent) {
        try {
            String title = "Thông báo kiểm tra y tế định kỳ";
            String content = String.format("Kính gửi Phụ huynh, Nhà trường thông báo về kế hoạch " +
                    "kiểm tra sức khỏe định kỳ cho học sinh %s trong chiến dịch '%s'. " +
                    "Vui lòng xác nhận đồng ý cho con tham gia kiểm tra sức khỏe.",
                    consent.getStudent().getFullName(),
                    consent.getHealthCampaign().getTitle());

            Map<String, Object> data = new HashMap<>();
            data.put("consentId", consent.getId());
            data.put("campaignId", consent.getHealthCampaign().getId());
            data.put("campaignTitle", consent.getHealthCampaign().getTitle());
            data.put("studentId", consent.getStudent().getId());
            data.put("studentName", consent.getStudent().getFullName());

            notificationService.sendNotificationToUser(
                    consent.getParent().getId(),
                    title,
                    content,
                    data,
                    "HEALTH_CAMPAIGN"
            );
        } catch (Exception e) {
            // Log error nhưng không throw exception để không làm gián đoạn luồng chính
        }
    }

    private ParentConsentResponseDTO convertToResponseDTO(ParentConsent consent) {
        ParentConsentResponseDTO dto = new ParentConsentResponseDTO();
        dto.setId(consent.getId());
        dto.setHealthCampaignId(consent.getHealthCampaign().getId());
        dto.setCampaignTitle(consent.getHealthCampaign().getTitle());
        dto.setCampaignDescription(consent.getHealthCampaign().getDescription()); // Thêm dòng này
        dto.setStudentId(consent.getStudent().getId());
        dto.setStudentName(consent.getStudent().getFullName());
        dto.setStudentClass(consent.getStudent().getClassName());

        // Convert parent ID from String to Long
        try {
            dto.setParentId(Long.parseLong(consent.getParent().getId()));
        } catch (NumberFormatException e) {
            dto.setParentId(null);
        }

        // Lấy tên phụ huynh từ Student.getParent() thay vì từ AccountMember
        Parent studentParent = consent.getStudent().getParent();
        String parentName = (studentParent != null) ? studentParent.getFullName() : consent.getParent().getUsername();
        dto.setParentName(parentName);

        dto.setConsentStatus(consent.getConsentStatus());
        dto.setConsentDate(consent.getConsentDate());
        dto.setParentNotes(consent.getParentNotes());
        dto.setCreatedAt(consent.getCreatedAt());
        dto.setUpdatedAt(consent.getUpdatedAt());

        // Chuyển đổi JSON thành List<String> cho specialCheckupItems
        if (consent.getSpecialCheckupItems() != null && !consent.getSpecialCheckupItems().isEmpty()) {
            try {
                List<String> specialItems = objectMapper.readValue(
                        consent.getSpecialCheckupItems(),
                        new TypeReference<>() {}
                );
                dto.setSpecialCheckupItems(specialItems);
            } catch (JsonProcessingException e) {
                dto.setSpecialCheckupItems(new ArrayList<>());
            }
        } else {
            dto.setSpecialCheckupItems(new ArrayList<>());
        }

        return dto;
    }

    private ParentAllChildrenNotificationsDTO.NotificationDetail convertToNotificationDetail(ParentConsent consent) {
        ParentAllChildrenNotificationsDTO.NotificationDetail dto = new ParentAllChildrenNotificationsDTO.NotificationDetail();
        
        // Thông tin consent
        dto.setConsentId(consent.getId());
        
        // Thông tin chiến dịch
        HealthCampaign campaign = consent.getHealthCampaign();
        dto.setHealthCampaignId(campaign.getId());
        dto.setCampaignTitle(campaign.getTitle());
        dto.setCampaignDescription(campaign.getDescription());
        dto.setCampaignStartDate(campaign.getStartDate());
        dto.setCampaignEndDate(campaign.getEndDate());
        dto.setCampaignStatus(campaign.getStatus());
        
        // Thông tin xác nhận
        dto.setConsentStatus(consent.getConsentStatus());
        dto.setConsentDate(consent.getConsentDate());
        dto.setParentNotes(consent.getParentNotes());
        
        // Chuyển đổi JSON thành List<String> cho specialCheckupItems
        if (consent.getSpecialCheckupItems() != null && !consent.getSpecialCheckupItems().isEmpty()) {
            try {
                List<String> specialItems = objectMapper.readValue(
                        consent.getSpecialCheckupItems(),
                        new TypeReference<>() {}
                );
                dto.setSpecialCheckupItems(specialItems);
            } catch (JsonProcessingException e) {
                dto.setSpecialCheckupItems(new ArrayList<>());
            }
        } else {
            dto.setSpecialCheckupItems(new ArrayList<>());
        }
        
        // Thông tin kiểm tra (nếu đã có)
        Optional<MedicalCheckup> checkupOpt = medicalCheckupRepository.findByHealthCampaignIdAndStudentId(
                campaign.getId(), consent.getStudent().getId());
        
        if (checkupOpt.isPresent()) {
            MedicalCheckup checkup = checkupOpt.get();
            dto.setMedicalCheckupId(checkup.getId());
            dto.setCheckupStatus(checkup.getCheckupStatus() != null ? checkup.getCheckupStatus().name() : null);
            dto.setCheckupDate(checkup.getCheckupDate());
            dto.setFollowUpNeeded(checkup.getFollowUpNeeded());
            dto.setResultNotified(checkup.getParentNotified());
        }
        
        // Thông tin thời gian
        dto.setCreatedAt(consent.getCreatedAt());
        dto.setUpdatedAt(consent.getUpdatedAt());
        
        return dto;
    }
}
