package com.fpt.medically_be.controller;

import com.fpt.medically_be.dto.VaccinationPlanRequestDTO;
import com.fpt.medically_be.dto.VaccinationPlanResponseDTO;
import com.fpt.medically_be.dto.request.VaccinationPlanStatusUpdateRequest;
import com.fpt.medically_be.dto.request.VaccinePlanCreateRequestDTO;
import com.fpt.medically_be.dto.response.*;
import com.fpt.medically_be.entity.VaccinationPlan;
import com.fpt.medically_be.entity.VaccinationPlanStatus;
import com.fpt.medically_be.service.VaccinationPlanService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/v1/vaccination-plans")
public class VaccinationPlanController {


    @Autowired
    private VaccinationPlanService vaccinationPlanService;


    @Operation(summary = "Cập nhật trạng thái kế hoạch tiêm chủng", description = "WAITING_PARENT, IN_PROGRESS, CANCELED, COMPLETED")
    @PatchMapping("/{id}/status")
    public ResponseEntity<String> updateStatus(
            @PathVariable Long id,
            @RequestBody VaccinationPlanStatusUpdateRequest request) {

        vaccinationPlanService.updateStatus(id, request.getStatus());
        return ResponseEntity.ok("Cập nhật trạng thái thành công");
    }

    @Operation(summary = "Tạo kế hoạch tiêm chủng mới", description = "Tạo một kế hoạch tiêm chủng mới với thông tin chi tiết về vaccine và lịch trình tiêm")
    @PostMapping("/create")
    public ResponseEntity<VaccinePlanCreateResponse> createPlan(@RequestBody VaccinePlanCreateRequestDTO dto) {
        VaccinePlanCreateResponse plan = vaccinationPlanService.createVaccinationPlan(dto);
        return ResponseEntity.ok(plan);
    }

    @Operation(summary = "Y tá hoặc admin xem tất cả các dánh sách vaccine plan đã gửi đi")
    @GetMapping("/getAllVaccinationPlans")
    public List<VaccinationPlanListResponse> getAllPlans() {
        return vaccinationPlanService.getAllPlans();
    }


    @Operation(summary = "Lấy danh sách kế hoạch tiêm chủng theo trạng thái hoặc tên",description = "WAITING_PARENT,   IN_PROGRESS,CANCELED,COMPLETED")
    @GetMapping("/filterVaccinationPlans")
    public List<VaccinationPlanListResponse> filterPlans(
            @RequestParam(value = "status", required = false) VaccinationPlanStatus status,
            @RequestParam(value = "name", required = false) String planName) {
        return vaccinationPlanService.filterPlanByStatusOrName(status, planName);
    }

    @Operation(summary = "Admin hoặc Nurse Lấy chi tiết kế hoạch tiêm chủng theo ID",description = "Lấy thông tin chi tiết của một kế hoạch tiêm chủng cụ thể")
    @GetMapping("/getDetailsVaccinePlanById/{id}")
    public ResponseEntity<VaccinationPlanDetailResponse> getVaccinationPlanById(@PathVariable("id") Long id) {
        VaccinationPlanDetailResponse plan = vaccinationPlanService.getVaccinationPlanById(id);
        return ResponseEntity.ok(plan);
    }

    @Operation(summary = "Lấy kế hoạch tiêm chủng cho phụ huynh xem bằng ID học sinh",description = "Lấy danh sách kế hoạch tiêm chủng cho một học sinh cụ thể")
    @GetMapping("/students/{studentId}")
    public ResponseEntity<List<VaccinationPlanForParentResponse>> getPlansForStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(vaccinationPlanService.getPlansForStudent(studentId));
    }

    @Operation(summary = "(CÓ FILTER BẰNG CLASS)Lấy kế hoạch tiêm chủng cho phụ huynh xem bằng ID học sinh",description = "Lấy danh sách kế hoạch tiêm chủng cho một học sinh cụ thể")
    @GetMapping("/{id}/students")
    public VaccinationPlanDetailResponse getVaccinationPlanStudents(
            @PathVariable Long id,
            @RequestParam(required = false) String className
    ) {
        return vaccinationPlanService.getVaccinationPlanStudents(id, className);
    }
}

