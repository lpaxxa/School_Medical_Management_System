package com.fpt.medically_be.service;

import com.fpt.medically_be.dto.request.HealthCampaignCreateDTO;
import com.fpt.medically_be.dto.response.HealthCampaignResponseDTO;
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
}
