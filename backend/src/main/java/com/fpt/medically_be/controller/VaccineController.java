package com.fpt.medically_be.controller;

import com.fpt.medically_be.dto.response.VaccineResponse;
import com.fpt.medically_be.service.VaccineService;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/vaccines")
public class VaccineController {
    @Autowired
    private VaccineService vaccineService;


    // Lấy tất cả bản ghi tiêm chủng
    @Operation(summary = "Lấy tất cả bản ghi tiêm chủng", description = "Lấy tất cả bản ghi tiêm chủng trong hệ thống")
    @GetMapping("/getAllVaccine")
    public ResponseEntity<List<VaccineResponse>> getAllVaccinations() {
        List<VaccineResponse> vaccine = vaccineService.getAllVacine();
        return ResponseEntity.ok(vaccine);
    }

}
