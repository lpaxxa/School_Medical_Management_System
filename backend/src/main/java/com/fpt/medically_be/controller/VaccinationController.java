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





}
