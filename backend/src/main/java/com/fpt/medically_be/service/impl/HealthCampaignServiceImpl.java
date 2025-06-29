package com.fpt.medically_be.service.impl;

import com.fpt.medically_be.dto.request.HealthCampaignCreateDTO;
import com.fpt.medically_be.dto.response.HealthCampaignResponseDTO;
import com.fpt.medically_be.entity.HealthCampaign;
import com.fpt.medically_be.entity.HealthCampaignStatus;
import com.fpt.medically_be.exception.ResourceNotFoundException;
import com.fpt.medically_be.repos.HealthCampaignRepository;
import com.fpt.medically_be.service.HealthCampaignService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HealthCampaignServiceImpl implements HealthCampaignService {

    private final HealthCampaignRepository healthCampaignRepository;

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
        campaign.setStartDate(dto.getStartDate());
        campaign.setNotes(dto.getNotes());
        campaign.setStatus(dto.getStatus());

        HealthCampaign savedCampaign = healthCampaignRepository.save(campaign);
        return mapToDTO(savedCampaign);
    }

    @Override
    public HealthCampaignResponseDTO updateHealthCampaign(Long id, HealthCampaignCreateDTO dto) {
        HealthCampaign campaign = healthCampaignRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chiến dịch sức khỏe với ID: " + id));

        campaign.setTitle(dto.getTitle());
        campaign.setStartDate(dto.getStartDate());
        campaign.setNotes(dto.getNotes());
        campaign.setStatus(dto.getStatus());

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

    // Helper method để chuyển đổi từ Entity sang DTO
    private HealthCampaignResponseDTO mapToDTO(HealthCampaign campaign) {
        return HealthCampaignResponseDTO.builder()
                .id(campaign.getId())
                .title(campaign.getTitle())
                .startDate(campaign.getStartDate())
                .notes(campaign.getNotes())
                .status(campaign.getStatus())
                .build();
    }
}
