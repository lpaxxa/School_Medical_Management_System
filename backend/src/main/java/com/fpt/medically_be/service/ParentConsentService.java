package com.fpt.medically_be.service;

import com.fpt.medically_be.dto.request.ParentConsentRequestDTO;
import com.fpt.medically_be.dto.response.ParentConsentResponseDTO;

import java.util.List;

public interface ParentConsentService {
    /**
     * Lấy danh sách xác nhận của phụ huynh theo chiến dịch
     */
    List<ParentConsentResponseDTO> getConsentsByHealthCampaign(Long campaignId);

    /**
     * Lấy danh sách xác nhận của phụ huynh cho một học sinh
     */
    List<ParentConsentResponseDTO> getConsentsByStudent(Long studentId);

    /**
     * Lấy danh sách xác nhận của phụ huynh cụ thể
     */
    List<ParentConsentResponseDTO> getConsentsByParent(Long parentId);

    /**
     * Lấy xác nhận của phụ huynh cho một học sinh trong một chiến dịch cụ thể
     */
    ParentConsentResponseDTO getConsentByHealthCampaignAndStudent(Long campaignId, Long studentId);

    /**
     * Cập nhật xác nhận của phụ huynh
     */
    ParentConsentResponseDTO updateParentConsent(Long consentId, ParentConsentRequestDTO requestDTO);

    /**
     * Lấy danh sách phụ huynh đã đồng ý cho con tham gia kiểm tra trong một chiến dịch
     */
    List<ParentConsentResponseDTO> getApprovedConsentsForCampaign(Long campaignId);

    /**
     * Đếm tổng số lượng xác nhận cho một chiến dịch
     */
    Long countConsentsByHealthCampaign(Long campaignId);

    /**
     * Đếm số lượng xác nhận đã được đồng ý cho một chiến dịch
     */
    Long countApprovedConsentsByHealthCampaign(Long campaignId);

    /**
     * Gửi nhắc nhở cho phụ huynh chưa xác nhận
     */
    int sendRemindersToParents(Long campaignId);

    /**
     * Tạo các yêu cầu xác nhận cho một chiến dịch
     */
    List<ParentConsentResponseDTO> createConsentRequestsForCampaign(Long campaignId, List<Long> studentIds);

    /**
     * Lấy thông tin chi tiết một consent theo ID
     */
    ParentConsentResponseDTO getParentConsentById(Long consentId);
}
