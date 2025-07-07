package com.fpt.medically_be.service;

import com.fpt.medically_be.dto.VaccinationPlanRequestDTO;
import com.fpt.medically_be.dto.VaccinationPlanResponseDTO;
import com.fpt.medically_be.dto.request.ConfirmVaccinesRequest;
import com.fpt.medically_be.dto.request.VaccinePlanCreateRequestDTO;
import com.fpt.medically_be.dto.response.*;
import com.fpt.medically_be.entity.VaccinationPlan;
import com.fpt.medically_be.entity.VaccinationPlanStatus;
import com.fpt.medically_be.exception.ResourceNotFoundException;
import com.fpt.medically_be.mapper.VaccinationPlanMapper;
import com.fpt.medically_be.repos.VaccinationPlanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service

public interface VaccinationPlanService {

    /**
     * Lấy tất cả kế hoạch tiêm chủng
     */

    VaccinePlanCreateResponse createVaccinationPlan(VaccinePlanCreateRequestDTO dto);

    List<VaccinationPlanListResponse> getAllPlans();

    List<VaccinationPlanListResponse> filterPlanByStatusOrName(VaccinationPlanStatus status, String planName);

    VaccinationPlanDetailResponse getVaccinationPlanById(Long id);


    List<VaccinationPlanForParentResponse> getPlansForStudent(Long studentId);

    VaccinationPlanDetailResponse getVaccinationPlanStudents(Long planId, String className);

    void updateStatus(Long id, VaccinationPlanStatus status);
    /**
     * Lấy kế hoạch tiêm chủng theo ID
     */


    /**
     * Tìm kiếm kế hoạch tiêm chủng theo tên vaccine
     */

    /**
     * Tìm kiếm kế hoạch tiêm chủng theo trạng thái
     */

    /**
     * Tạo mới kế hoạch tiêm chủng
     */


    /**
     * Cập nhật kế hoạch tiêm chủng
     */


    /**
     * Xóa kế hoạch tiêm chủng
     */


    // Helper method to get entity by id

}
