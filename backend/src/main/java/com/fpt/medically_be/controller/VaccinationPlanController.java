package com.fpt.medically_be.controller;

import com.fpt.medically_be.dto.VaccinationPlanRequestDTO;
import com.fpt.medically_be.dto.VaccinationPlanResponseDTO;
import com.fpt.medically_be.entity.VaccinationPlanStatus;
import com.fpt.medically_be.service.VaccinationPlanService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/v1/vaccination-plans")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class VaccinationPlanController {

    private final VaccinationPlanService vaccinationPlanService;

    /**
     * Lấy tất cả kế hoạch tiêm chủng
     * GET /api/v1/vaccination-plans
     */
//    @GetMapping
//    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<List<VaccinationPlanResponseDTO>> getAllVaccinationPlans() {
//        List<VaccinationPlanResponseDTO> plans = vaccinationPlanService.getAllVaccinationPlans();
//        return ResponseEntity.ok(plans);
//    }

    /**
     * Lấy kế hoạch tiêm chủng theo ID
     * GET /api/v1/vaccination-plans/{id}
     */
//    @GetMapping("/{id}")
////    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<VaccinationPlanResponseDTO> getVaccinationPlanById(@PathVariable Long id) {
//        VaccinationPlanResponseDTO plan = vaccinationPlanService.getVaccinationPlanById(id);
//        return ResponseEntity.ok(plan);
//    }

    /**
     * Tìm kiếm kế hoạch tiêm chủng theo tên vaccine
     * GET /api/v1/vaccination-plans/search/vaccine?name=<tên vaccine>
     */
//    @GetMapping("/search/vaccine")
////    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<List<VaccinationPlanResponseDTO>> findByVaccineName(@RequestParam("name") String vaccineName) {
//        List<VaccinationPlanResponseDTO> plans = vaccinationPlanService.findByVaccineName(vaccineName);
//        return ResponseEntity.ok(plans);
//    }

    /**
     * Tìm kiếm kế hoạch tiêm chủng theo trạng thái
     * GET /api/v1/vaccination-plans/search/status?status=<ONGOING|COMPLETED|CANCELLED>
     */
//    @GetMapping("/search/status")
////    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<List<VaccinationPlanResponseDTO>> findByStatus(@RequestParam("status") VaccinationPlanStatus status) {
//        List<VaccinationPlanResponseDTO> plans = vaccinationPlanService.findByStatus(status);
//        return ResponseEntity.ok(plans);
//    }

    /**
     * Tạo mới kế hoạch tiêm chủng
     * POST /api/v1/vaccination-plans
     */
//    @PostMapping
////    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<VaccinationPlanResponseDTO> createVaccinationPlan(@Valid @RequestBody VaccinationPlanRequestDTO requestDTO) {
//        VaccinationPlanResponseDTO createdPlan = vaccinationPlanService.createVaccinationPlan(requestDTO);
//        return ResponseEntity.status(HttpStatus.CREATED).body(createdPlan);
//    }

    /**
     * Cập nhật kế hoạch tiêm chủng
     * PUT /api/v1/vaccination-plans/{id}
     */
//    @PutMapping("/{id}")
////    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<VaccinationPlanResponseDTO> updateVaccinationPlan(
//            @PathVariable Long id,
//            @Valid @RequestBody VaccinationPlanRequestDTO requestDTO) {
//        VaccinationPlanResponseDTO updatedPlan = vaccinationPlanService.updateVaccinationPlan(id, requestDTO);
//        return ResponseEntity.ok(updatedPlan);
//    }

    /**
     * Xóa kế hoạch tiêm chủng
     * DELETE /api/v1/vaccination-plans/{id}
     */
//    @DeleteMapping("/{id}")
////    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<Void> deleteVaccinationPlan(@PathVariable Long id) {
//        vaccinationPlanService.deleteVaccinationPlan(id);
//        return ResponseEntity.noContent().build();
//    }
}

