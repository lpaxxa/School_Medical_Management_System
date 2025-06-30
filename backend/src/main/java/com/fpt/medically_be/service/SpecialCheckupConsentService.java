package com.fpt.medically_be.service;

import com.fpt.medically_be.dto.SpecialCheckupConsentDTO;
import com.fpt.medically_be.entity.NotificationRecipients;
import com.fpt.medically_be.entity.SpecialCheckupConsent;
import com.fpt.medically_be.entity.SpecialCheckupType;
import com.fpt.medically_be.repos.SpecialCheckupConsentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SpecialCheckupConsentService {

    private final SpecialCheckupConsentRepository specialCheckupConsentRepository;

    /**
     * Tạo danh sách các phần khám đặc biệt mặc định cho thông báo khám sức khỏe
     */
    @Transactional
    public void createDefaultSpecialCheckupConsents(NotificationRecipients notificationRecipient) {
        List<SpecialCheckupConsent> consents = Arrays.stream(SpecialCheckupType.values())
                .map(type -> {
                    SpecialCheckupConsent consent = new SpecialCheckupConsent();
                    consent.setNotificationRecipient(notificationRecipient);
                    consent.setCheckupType(type);
                    consent.setIsConsented(null); // Chưa có phản hồi
                    return consent;
                })
                .collect(Collectors.toList());

        specialCheckupConsentRepository.saveAll(consents);
    }

    /**
     * Lấy danh sách phần khám đặc biệt theo notification recipient
     */
    public List<SpecialCheckupConsentDTO> getSpecialCheckupConsents(Long notificationRecipientId) {
        List<SpecialCheckupConsent> consents = specialCheckupConsentRepository.findByNotificationRecipientId(notificationRecipientId);

        return consents.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Cập nhật phản hồi của phụ huynh cho các phần khám đặc biệt
     */
    @Transactional
    public void updateConsentResponses(Long notificationRecipientId, List<SpecialCheckupConsentDTO> consentDTOs) {
        List<SpecialCheckupConsent> existingConsents = specialCheckupConsentRepository.findByNotificationRecipientId(notificationRecipientId);

        for (SpecialCheckupConsentDTO dto : consentDTOs) {
            existingConsents.stream()
                    .filter(consent -> consent.getCheckupType().equals(dto.getCheckupType()))
                    .findFirst()
                    .ifPresent(consent -> {
                        consent.setIsConsented(dto.getIsConsented());
                        consent.setParentNote(dto.getParentNote());
                    });
        }

        specialCheckupConsentRepository.saveAll(existingConsents);
    }

    private SpecialCheckupConsentDTO convertToDTO(SpecialCheckupConsent consent) {
        SpecialCheckupConsentDTO dto = new SpecialCheckupConsentDTO();
        dto.setId(consent.getId());
        dto.setCheckupType(consent.getCheckupType());
        dto.setCheckupDisplayName(consent.getCheckupType().getDisplayName());
        dto.setIsConsented(consent.getIsConsented());
        dto.setParentNote(consent.getParentNote());
        return dto;
    }
}
