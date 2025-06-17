package com.fpt.medically_be.service;

import com.fpt.medically_be.dto.HealthProfileDTO;
import com.fpt.medically_be.entity.HealthProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface HealthProfileService {
    Page<HealthProfileDTO> findAll(Pageable pageable);;
    HealthProfileDTO getHealthProfileById(Long id);
    HealthProfileDTO createHealthProfile(HealthProfileDTO healthProfileDTO);
    HealthProfileDTO updateHealthProfile(Long id, HealthProfileDTO healthProfileDTO);
    void deleteHealthProfile(Long id);
    HealthProfileDTO getHealthProfileByStudentId(Long studentId);
}
