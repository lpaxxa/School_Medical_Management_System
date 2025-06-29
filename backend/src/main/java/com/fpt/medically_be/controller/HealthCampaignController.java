package com.fpt.medically_be.controller;

import com.fpt.medically_be.dto.request.HealthCampaignCreateDTO;
import com.fpt.medically_be.dto.response.HealthCampaignResponseDTO;
import com.fpt.medically_be.entity.HealthCampaignStatus;
import com.fpt.medically_be.service.HealthCampaignService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/health-campaigns")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Tag(name = "Chiến dịch sức khỏe", description = "API quản lý các chiến dịch sức khỏe trong trường học")
public class HealthCampaignController {

    private final HealthCampaignService healthCampaignService;

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
}
