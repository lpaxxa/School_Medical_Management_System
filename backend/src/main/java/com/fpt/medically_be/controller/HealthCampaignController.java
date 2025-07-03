package com.fpt.medically_be.controller;

import com.fpt.medically_be.dto.request.HealthCampaignCreateDTO;
import com.fpt.medically_be.dto.response.CampaignStatisticsDTO;
import com.fpt.medically_be.dto.response.HealthCampaignResponseDTO;
import com.fpt.medically_be.dto.response.StudentCheckupStatusDTO;
import com.fpt.medically_be.entity.HealthCampaignStatus;
import com.fpt.medically_be.entity.Student;
import com.fpt.medically_be.service.HealthCampaignService;
import com.fpt.medically_be.repos.StudentRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/health-campaigns")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Tag(name = "Chiến dịch sức khỏe", description = "API quản lý các chiến dịch sức khỏe trong trường học")
public class HealthCampaignController {

    private final HealthCampaignService healthCampaignService;
    private final StudentRepository studentRepository; // Thêm dependency

    /**
     * Lấy danh sách tất cả các chiến dịch sức khỏe
     * GET /api/v1/health-campaigns
     */
    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả chiến dịch sức khỏe")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy danh sách thành công")
    })
    public ResponseEntity<List<HealthCampaignResponseDTO>> getAllHealthCampaigns() {
        List<HealthCampaignResponseDTO> campaigns = healthCampaignService.getAllHealthCampaigns();
        return ResponseEntity.ok(campaigns);
    }

    /**
     * Lấy thông tin chi tiết một chiến dịch sức khỏe theo ID
     * GET /api/v1/health-campaigns/{id}
     */
    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết chiến dịch sức khỏe theo ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy thông tin thành công"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy chiến dịch")
    })
    public ResponseEntity<HealthCampaignResponseDTO> getHealthCampaignById(@PathVariable Long id) {
        HealthCampaignResponseDTO campaign = healthCampaignService.getHealthCampaignById(id);
        return ResponseEntity.ok(campaign);
    }

    /**
     * Tạo mới chiến dịch sức khỏe
     * POST /api/v1/health-campaigns
     */
    @PostMapping
//    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    @Operation(summary = "Tạo mới chiến dịch sức khỏe")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Tạo chiến dịch thành công")
    })
    public ResponseEntity<HealthCampaignResponseDTO> createHealthCampaign(@RequestBody HealthCampaignCreateDTO dto) {
        HealthCampaignResponseDTO createdCampaign = healthCampaignService.createHealthCampaign(dto);
        return new ResponseEntity<>(createdCampaign, HttpStatus.CREATED);
    }

    /**
     * Cập nhật thông tin chiến dịch sức khỏe
     * PUT /api/v1/health-campaigns/{id}
     */
    @PutMapping("/{id}")
//    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    @Operation(summary = "Cập nhật thông tin chiến dịch sức khỏe")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Cập nhật thành công"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy chiến dịch")
    })
    public ResponseEntity<HealthCampaignResponseDTO> updateHealthCampaign(@PathVariable Long id, @RequestBody HealthCampaignCreateDTO dto) {
        HealthCampaignResponseDTO updatedCampaign = healthCampaignService.updateHealthCampaign(id, dto);
        return ResponseEntity.ok(updatedCampaign);
    }

    /**
     * Xóa chiến dịch sức khỏe
     * DELETE /api/v1/health-campaigns/{id}
     */
    @DeleteMapping("/{id}")
//    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Xóa chiến dịch sức khỏe")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Xóa thành công"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy chiến dịch")
    })
    public ResponseEntity<Void> deleteHealthCampaign(@PathVariable Long id) {
        healthCampaignService.deleteHealthCampaign(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Tìm kiếm chiến dịch sức khỏe theo tiêu đề
     * GET /api/v1/health-campaigns/search/title?title=<tiêu đề>
     */
    @GetMapping("/search/title")
    @Operation(summary = "Tìm kiếm chiến dịch sức khỏe theo tiêu đề")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Tìm kiếm thành công")
    })
    public ResponseEntity<List<HealthCampaignResponseDTO>> findByTitle(@RequestParam("title") String title) {
        List<HealthCampaignResponseDTO> campaigns = healthCampaignService.findByTitle(title);
        return ResponseEntity.ok(campaigns);
    }

    /**
     * Tìm kiếm chiến dịch sức khỏe theo trạng thái
     * GET /api/v1/health-campaigns/search/status?status=<PREPARING|ONGOING|COMPLETED|CANCELLED>
     */
    @GetMapping("/search/status")
    @Operation(summary = "Tìm kiếm chiến dịch sức khỏe theo trạng thái")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Tìm kiếm thành công")
    })
    public ResponseEntity<List<HealthCampaignResponseDTO>> findByStatus(@RequestParam("status") HealthCampaignStatus status) {
        List<HealthCampaignResponseDTO> campaigns = healthCampaignService.findByStatus(status);
        return ResponseEntity.ok(campaigns);
    }

    /**
     * Thay đổi trạng thái chiến dịch sức khỏe
     * PATCH /api/v1/health-campaigns/{id}/status
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    @Operation(summary = "Thay đổi trạng thái chiến dịch sức khỏe")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Thay đổi trạng thái thành công"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy chiến dịch")
    })
    public ResponseEntity<HealthCampaignResponseDTO> updateHealthCampaignStatus(
            @PathVariable Long id,
            @RequestParam HealthCampaignStatus status) {
        HealthCampaignResponseDTO updatedCampaign = healthCampaignService.updateHealthCampaignStatus(id, status);
        return ResponseEntity.ok(updatedCampaign);
    }

    /**
     * Gửi thông báo kiểm tra y tế định kỳ đến phụ huynh học sinh
     * POST /api/v1/health-campaigns/{id}/send-notifications
     */
    @PostMapping("/{id}/send-notifications")
//    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    @Operation(summary = "Gửi thông báo kiểm tra y tế định kỳ đến phụ huynh")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Gửi thông báo thành công"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy chiến dịch")
    })
    public ResponseEntity<Map<String, Object>> sendNotificationsToParents(
            @PathVariable Long id,
            @RequestBody List<Long> studentIds) {
        int notificationsSent = healthCampaignService.sendNotificationsToParents(id, studentIds);
        Map<String, Object> response = new HashMap<>();
        response.put("campaignId", id);
        response.put("notificationsSent", notificationsSent);
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy danh sách học sinh đã được đăng ký kiểm tra cho chiến dịch
     * GET /api/v1/health-campaigns/{id}/students
     */
    @GetMapping("/{id}/students")
    @Operation(summary = "Lấy danh sách học sinh đã đăng ký kiểm tra")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy danh sách thành công"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy chiến dịch")
    })
    public ResponseEntity<List<StudentCheckupStatusDTO>> getStudentsForCampaign(
            @PathVariable Long id,
            @RequestParam(required = false) Boolean consentGiven) {
        List<StudentCheckupStatusDTO> students = healthCampaignService.getStudentsForCampaign(id, consentGiven);
        return ResponseEntity.ok(students);
    }

    /**
     * Lấy thống kê về chiến dịch kiểm tra y tế
     * GET /api/v1/health-campaigns/{id}/statistics
     */
    @GetMapping("/{id}/statistics")
    @Operation(summary = "Lấy thống kê về chiến dịch kiểm tra y tế")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy thống kê thành công"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy chiến dịch")
    })
    public ResponseEntity<CampaignStatisticsDTO> getCampaignStatistics(@PathVariable Long id) {
        CampaignStatisticsDTO statistics = healthCampaignService.getCampaignStatistics(id);
        return ResponseEntity.ok(statistics);
    }

    /**
     * Lấy danh sách các mục kiểm tra đặc biệt của chiến dịch
     * GET /api/v1/health-campaigns/{id}/special-checkup-items
     */
    @GetMapping("/{id}/special-checkup-items")
    @Operation(summary = "Lấy danh sách các mục kiểm tra đặc biệt của chiến dịch")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy danh sách thành công"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy chiến dịch")
    })
    public ResponseEntity<List<String>> getSpecialCheckupItems(@PathVariable Long id) {
        List<String> items = healthCampaignService.getSpecialCheckupItems(id);
        return ResponseEntity.ok(items);
    }

    /**
     * Tự động tạo yêu cầu đồng ý cho tất cả học sinh trong chiến dịch
     * POST /api/v1/health-campaigns/{id}/create-consent-requests
     */
    @PostMapping("/{id}/create-consent-requests")
//    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    @Operation(summary = "Tự động tạo yêu cầu đồng ý cho tất cả học sinh")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Tạo yêu cầu đồng ý thành công"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy chiến dịch")
    })
    public ResponseEntity<Map<String, Object>> createConsentRequestsForAllStudents(
            @PathVariable Long id,
            @RequestBody(required = false) List<Long> studentIds) {

        Map<String, Object> response = new HashMap<>();

        if (studentIds == null || studentIds.isEmpty()) {
            // Gửi thông báo cho tất cả học sinh trong hệ thống
            // Bạn có thể thay đổi logic này để chỉ gửi cho học sinh của một lớp hoặc khối cụ thể
            int notificationsSent = healthCampaignService.sendNotificationsToParents(id, getAllStudentIds());
            response.put("message", "Đã gửi thông báo cho tất cả học sinh");
            response.put("notificationsSent", notificationsSent);
        } else {
            // Gửi thông báo cho danh sách học sinh được chỉ định
            int notificationsSent = healthCampaignService.sendNotificationsToParents(id, studentIds);
            response.put("message", "Đã gửi thông báo cho danh sách học sinh được chọn");
            response.put("notificationsSent", notificationsSent);
        }

        response.put("campaignId", id);
        return ResponseEntity.ok(response);
    }

    /**
     * Helper method để lấy tất cả ID học sinh (có thể tùy chỉnh theo yêu cầu)
     */
    private List<Long> getAllStudentIds() {
        // Implement logic để lấy tất cả student IDs
        return studentRepository.findAll().stream()
                .map(Student::getId)
                .collect(Collectors.toList());
    }
}
