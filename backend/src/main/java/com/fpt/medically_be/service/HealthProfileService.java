package com.fpt.medically_be.service;

import com.fpt.medically_be.dto.HealthProfileDTO;
import java.util.List;

public interface HealthProfileService {
    List<HealthProfileDTO> getAllHealthProfiles();
    HealthProfileDTO getHealthProfileById(Long id);
    HealthProfileDTO createHealthProfile(HealthProfileDTO healthProfileDTO);
    HealthProfileDTO updateHealthProfile(Long id, HealthProfileDTO healthProfileDTO);
    void deleteHealthProfile(Long id);

}
