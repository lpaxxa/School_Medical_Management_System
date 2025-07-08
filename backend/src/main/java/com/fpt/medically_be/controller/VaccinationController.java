package com.fpt.medically_be.controller;


import com.fpt.medically_be.dto.request.VaccinationCreateDTO;
import com.fpt.medically_be.dto.request.VaccinationRequestDTO;
import com.fpt.medically_be.dto.request.VaccinationUpdateNoteRequest;
import com.fpt.medically_be.dto.response.StudentVaccinationHistoryResponse;
import com.fpt.medically_be.dto.response.VaccinationCreateWithHeathResponse;
import com.fpt.medically_be.dto.response.VaccineResponse;
import com.fpt.medically_be.service.VaccinationService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/vaccinations")
public class VaccinationController {
    @Autowired
    private VaccinationService vaccinationService;


    @Operation(summary = "cho phép phụ huynh xóa vaccine đã khai báo")
    @DeleteMapping("/delete/{vaccinationId}")
    public ResponseEntity<String> deleteVaccination(@PathVariable Long vaccinationId) {
        vaccinationService.deleteVaccination(vaccinationId);
        return ResponseEntity.ok("Xóa vaccine thành công");
    }

//    @Operation(summary = "Lấy tất cả bản ghi tiêm chủng", description = "Lấy tất cả bản ghi tiêm chủng trong hệ thống")
//    @GetMapping("/getAllVaccine")
//    private


    @Operation(summary = "Cập nhật ghi chú tiêm chủng", description = "Cập nhật ghi chú cho bản ghi tiêm chủng")
    @PutMapping("/vaccinations/note")
    public ResponseEntity<?> updateVaccinationNote(@RequestBody VaccinationUpdateNoteRequest dto) {
        vaccinationService.updateVaccinationNote(dto);
        return ResponseEntity.ok("Cập nhật ghi chú thành công");
    }

    @Operation(summary = "Lấy lịch sử tiêm chủng của học sinh", description = "Lấy thông tin lịch sử tiêm chủng cho học sinh theo ID phụ huynh và học sinh")
    @GetMapping("/parents/{parentId}/students/{studentId}/vaccinations")
    public ResponseEntity<StudentVaccinationHistoryResponse> getStudentVaccinationHistory(
            @PathVariable Long parentId,
            @PathVariable Long studentId
    ) {
        return ResponseEntity.ok(
                vaccinationService.getVaccinationHistoryForStudent(parentId, studentId)
        );
    }


    @Operation(summary = "ghi nhận tiêm chủng", description = "Ghi nhận thông tin tiêm chủng cho học sinh")
    @PostMapping("/record")
    public ResponseEntity<String> recordVaccination(@RequestBody VaccinationCreateDTO request) {
        vaccinationService.recordVaccination(request);
        return ResponseEntity.ok("Vaccination recorded successfully");
    }



    // type chi co 3, la SCHOOL_PLAN, PARENT_DECLARED,CATCH_UP
    // xài cho khi khai báo heath profile
    @Operation(summary = "Thêm thông tin tiêm chủng do phụ huynh khai báo", description = "dành cho phụ huynh có thể khai báo vaccine đã tiêm ở bên ngoài trường cho con mình")
    @PostMapping("/addVaccine/{healthProfileId}")
    public ResponseEntity<List<VaccinationCreateWithHeathResponse>> addVaccination(
            @PathVariable("healthProfileId") Long healthProfileId,
           @Valid @RequestBody List<VaccinationRequestDTO> dto) {

        return ResponseEntity.ok(vaccinationService.addParentDeclaredVaccination(healthProfileId, dto));
    }


    // làm phòng ngừa, nếu cần
    @Operation(summary = "Lấy thông tin tiêm chủng theo ID", description = "Lấy thông tin tiêm chủng theo ID")
    @GetMapping("/getVaccinationById/{vaccinationId}")
    public ResponseEntity<VaccinationCreateWithHeathResponse> getVaccinationById(@PathVariable Long vaccinationId) {
        return ResponseEntity.ok(vaccinationService.getVaccinationById(vaccinationId));
    }

    @Operation(summary = "Lấy tất cả thông tin tiêm chủng", description = "Lấy tất cả thông tin tiêm chủng trong hệ thống")
    @GetMapping("/getAllVaccination")
    public ResponseEntity<List<VaccinationCreateWithHeathResponse>> getAllVaccination() {
        return ResponseEntity.ok(vaccinationService.getAllVaccination());
    }
    @Operation(summary = "Lấy tất cả thông tin tiêm chủng theo hồ sơ sức khỏe", description = "Lấy tất cả thông tin tiêm chủng theo ID hồ sơ sức khỏe")
    @GetMapping("/getAllVaccinationByHeathProfileId/{healthProfileId}")
    public ResponseEntity<List<VaccinationCreateWithHeathResponse>> getAllVaccinationByHeathProfileId(@PathVariable Long healthProfileId) {
        return ResponseEntity.ok(vaccinationService.getAllVaccinationByHeathProfileId(healthProfileId));
    }



}
