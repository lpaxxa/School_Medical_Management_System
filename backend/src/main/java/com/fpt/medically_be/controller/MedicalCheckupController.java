package com.fpt.medically_be.controller;

import com.fpt.medically_be.dto.MedicalCheckupDTO;
import com.fpt.medically_be.service.MedicalCheckupService;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/medical-checkups")
public class MedicalCheckupController {

    private final MedicalCheckupService medicalCheckupService;

    @Autowired
    public MedicalCheckupController(MedicalCheckupService medicalCheckupService) {
        this.medicalCheckupService = medicalCheckupService;
    }

    @GetMapping
//    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    @Operation(summary = "Lấy danh sách tất cả các đợt khám sức khỏe", description = "Trả về danh sách tất cả các đợt khám sức khỏe trong hệ thống.")
    public ResponseEntity<List<MedicalCheckupDTO>> getAllMedicalCheckups() {
        return ResponseEntity.ok(medicalCheckupService.getAllMedicalCheckups());
    }

    @GetMapping("/{id}")
//    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE') or hasRole('PARENT')")
    @Operation(summary = "Lấy thông tin chi tiết đợt khám sức khỏe theo ID", description = "Trả về thông tin chi tiết của một đợt khám sức khỏe dựa trên ID.")
    public ResponseEntity<MedicalCheckupDTO> getMedicalCheckupById(@PathVariable Long id) {
        return ResponseEntity.ok(medicalCheckupService.getMedicalCheckupById(id));
    }

    @GetMapping("/student/{studentId}")
//    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE') or hasRole('PARENT')")
    @Operation(summary = "Lấy lịch sử kiểm tra định kỳ theo studentId", description = "Trả về danh sách các đợt khám sức khỏe của một học sinh dựa trên studentId.")
    public ResponseEntity<List<MedicalCheckupDTO>> getMedicalCheckupsByStudentId(@PathVariable Long studentId) {
        return ResponseEntity.ok(medicalCheckupService.getMedicalCheckupsByStudentId(studentId));
    }

    @GetMapping("/staff/{staffId}")
//    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    @Operation(summary = "Lấy danh sách các đợt khám sức khỏe theo staffId", description = "Trả về danh sách các đợt khám sức khỏe do một nhân viên thực hiện dựa trên staffId.")
    public ResponseEntity<List<MedicalCheckupDTO>> getMedicalCheckupsByStaffId(@PathVariable Long staffId) {
        return ResponseEntity.ok(medicalCheckupService.getMedicalCheckupsByStaffId(staffId));
    }

    @GetMapping("/date-range")
//    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    @Operation(summary = "Lấy các đợt khám sức khỏe theo khoảng thời gian", description = "Trả về danh sách các đợt khám sức khỏe diễn ra trong khoảng thời gian chỉ định.")
    public ResponseEntity<List<MedicalCheckupDTO>> getMedicalCheckupsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(medicalCheckupService.getMedicalCheckupsByDateRange(startDate, endDate));
    }

    @GetMapping("/student/{studentId}/date-range")
//    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE') or hasRole('PARENT')")
    @Operation(summary = "Lấy các đợt khám sức khỏe của học sinh theo khoảng thời gian", description = "Trả về danh sách các đợt khám sức khỏe của một học sinh trong khoảng thời gian chỉ định.")
    public ResponseEntity<List<MedicalCheckupDTO>> getMedicalCheckupsByStudentAndDateRange(
            @PathVariable Long studentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(medicalCheckupService.getMedicalCheckupsByStudentAndDateRange(studentId, startDate, endDate));
    }

    @GetMapping("/type/{checkupType}")
//    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    @Operation(summary = "Lấy danh sách đợt khám sức khỏe theo loại", description = "Trả về danh sách các đợt khám sức khỏe theo loại kiểm tra (checkupType).")
    public ResponseEntity<List<MedicalCheckupDTO>> getMedicalCheckupsByType(@PathVariable String checkupType) {
        return ResponseEntity.ok(medicalCheckupService.getMedicalCheckupsByType(checkupType));
    }

    @GetMapping("/follow-up-needed")
//    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    @Operation(summary = "Lấy các đợt khám sức khỏe cần theo dõi lại", description = "Trả về danh sách các đợt khám sức khỏe cần được theo dõi lại.")
    public ResponseEntity<List<MedicalCheckupDTO>> getMedicalCheckupsNeedingFollowUp() {
        return ResponseEntity.ok(medicalCheckupService.getMedicalCheckupsNeedingFollowUp());
    }

    @PostMapping
//    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    @Operation(summary = "Tạo mới một đợt khám sức khỏe", description = "Tạo mới một đợt khám sức khỏe với thông tin được cung cấp.")
    public ResponseEntity<MedicalCheckupDTO> createMedicalCheckup(@RequestBody MedicalCheckupDTO medicalCheckupDTO) {
        return ResponseEntity.ok(medicalCheckupService.createMedicalCheckup(medicalCheckupDTO));
    }

    @PutMapping("/{id}")
//    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    @Operation(summary = "Cập nhật thông tin đợt khám sức khỏe", description = "Cập nhật thông tin một đợt khám sức khỏe dựa trên ID.")
    public ResponseEntity<MedicalCheckupDTO> updateMedicalCheckup(@PathVariable Long id, @RequestBody MedicalCheckupDTO medicalCheckupDTO) {
        return ResponseEntity.ok(medicalCheckupService.updateMedicalCheckup(id, medicalCheckupDTO));
    }

    @DeleteMapping("/{id}")
//    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Xóa đợt khám sức khỏe", description = "Xóa một đợt khám sức khỏe dựa trên ID.")
    public ResponseEntity<Void> deleteMedicalCheckup(@PathVariable Long id) {
        medicalCheckupService.deleteMedicalCheckup(id);
        return ResponseEntity.noContent().build();
    }
}


