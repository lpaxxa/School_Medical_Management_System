package com.fpt.medically_be.service;

import com.fpt.medically_be.dto.request.HealthCampaignCreateDTO;
import com.fpt.medically_be.dto.response.CampaignStatisticsDTO;
import com.fpt.medically_be.dto.response.HealthCampaignResponseDTO;
import com.fpt.medically_be.dto.response.StudentCheckupStatusDTO;
import com.fpt.medically_be.entity.HealthCampaignStatus;

import java.util.List;

public interface HealthCampaignService {
    List<HealthCampaignResponseDTO> getAllHealthCampaigns();
    HealthCampaignResponseDTO getHealthCampaignById(Long id);
    HealthCampaignResponseDTO createHealthCampaign(HealthCampaignCreateDTO dto);
    HealthCampaignResponseDTO updateHealthCampaign(Long id, HealthCampaignCreateDTO dto);
    void deleteHealthCampaign(Long id);

    // Tìm kiếm theo tiêu đề
    List<HealthCampaignResponseDTO> findByTitle(String title);

    // Tìm kiếm theo trạng thái
    List<HealthCampaignResponseDTO> findByStatus(HealthCampaignStatus status);

    // Cập nhật trạng thái chiến dịch
    HealthCampaignResponseDTO updateHealthCampaignStatus(Long id, HealthCampaignStatus status);

    // Gửi thông báo kiểm tra y tế định kỳ đến phụ huynh học sinh
    int sendNotificationsToParents(Long campaignId, List<Long> studentIds);

    // Lấy danh sách học sinh đã được đăng ký kiểm tra cho chiến dịch
    List<StudentCheckupStatusDTO> getStudentsForCampaign(Long campaignId, Boolean consentGiven);

    // Lấy thống kê về chiến dịch kiểm tra y tế
    CampaignStatisticsDTO getCampaignStatistics(Long campaignId);

    // Lấy danh sách các mục kiểm tra đặc biệt của chiến dịch
    List<String> getSpecialCheckupItems(Long campaignId);
}
