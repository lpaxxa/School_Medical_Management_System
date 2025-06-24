package com.fpt.medically_be.service;

import com.fpt.medically_be.dto.VaccinationPlanRequestDTO;
import com.fpt.medically_be.dto.VaccinationPlanResponseDTO;
import com.fpt.medically_be.entity.VaccinationPlan;
import com.fpt.medically_be.entity.VaccinationPlanStatus;
import com.fpt.medically_be.exception.ResourceNotFoundException;
import com.fpt.medically_be.mapper.VaccinationPlanMapper;
import com.fpt.medically_be.repos.VaccinationPlanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class VaccinationPlanService {

    private final VaccinationPlanRepository vaccinationPlanRepository;
    private final VaccinationPlanMapper vaccinationPlanMapper;

    /**
     * Lấy tất cả kế hoạch tiêm chủng
     */
    public List<VaccinationPlanResponseDTO> getAllVaccinationPlans() {
        return vaccinationPlanRepository.findAll().stream()
                .map(vaccinationPlanMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lấy kế hoạch tiêm chủng theo ID
     */
    public VaccinationPlanResponseDTO getVaccinationPlanById(Long id) {
        VaccinationPlan vaccinationPlan = getVaccinationPlanEntityById(id);
        return vaccinationPlanMapper.toDTO(vaccinationPlan);
    }

    /**
     * Tìm kiếm kế hoạch tiêm chủng theo tên vaccine
     */
    public List<VaccinationPlanResponseDTO> findByVaccineName(String vaccineName) {
        return vaccinationPlanRepository.findByVaccineNameContainingIgnoreCase(vaccineName).stream()
                .map(vaccinationPlanMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Tìm kiếm kế hoạch tiêm chủng theo trạng thái
     */
    public List<VaccinationPlanResponseDTO> findByStatus(VaccinationPlanStatus status) {
        return vaccinationPlanRepository.findByStatus(status).stream()
                .map(vaccinationPlanMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Tạo mới kế hoạch tiêm chủng
     */
    public VaccinationPlanResponseDTO createVaccinationPlan(VaccinationPlanRequestDTO requestDTO) {
        VaccinationPlan vaccinationPlan = vaccinationPlanMapper.toEntity(requestDTO);
        VaccinationPlan savedPlan = vaccinationPlanRepository.save(vaccinationPlan);
        return vaccinationPlanMapper.toDTO(savedPlan);
    }

    /**
     * Cập nhật kế hoạch tiêm chủng
     */
    public VaccinationPlanResponseDTO updateVaccinationPlan(Long id, VaccinationPlanRequestDTO requestDTO) {
        VaccinationPlan existingPlan = getVaccinationPlanEntityById(id);
        vaccinationPlanMapper.updateEntityFromDTO(existingPlan, requestDTO);
        VaccinationPlan updatedPlan = vaccinationPlanRepository.save(existingPlan);
        return vaccinationPlanMapper.toDTO(updatedPlan);
    }

    /**
     * Xóa kế hoạch tiêm chủng
     */
    public void deleteVaccinationPlan(Long id) {
        if (!vaccinationPlanRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy kế hoạch tiêm chủng với ID: " + id);
        }
        vaccinationPlanRepository.deleteById(id);
    }

    // Helper method to get entity by id
    private VaccinationPlan getVaccinationPlanEntityById(Long id) {
        return vaccinationPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy kế hoạch tiêm chủng với ID: " + id));
    }
}
