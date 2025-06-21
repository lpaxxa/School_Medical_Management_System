package com.fpt.medically_be.controller;



import com.fpt.medically_be.dto.request.MedicationItemsRequest;
import com.fpt.medically_be.dto.response.MedicalIncidentResponseDTO;
import com.fpt.medically_be.dto.response.MedicationItemsResponse;
import com.fpt.medically_be.service.MedicationItemsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/medication-items")
@Tag(name = "Quản lý thuốc", description = "API quản lý các mặt hàng thuốc")
public class MedicationItemController {


    @Autowired
    private MedicationItemsService medicationItemsService;

    @Operation(summary = "Tạo Thuốc")
    @PostMapping("/create")
    public ResponseEntity<MedicationItemsResponse> createMedicationItem(@Valid @RequestBody MedicationItemsRequest request) {

        return ResponseEntity.ok(medicationItemsService.createMedicationItem(request));
    }

    @Operation(summary = "Lấy tất cả danh sách thuốc", description = "Lấy tất cả danh sách thuốc trong hệ thống")
    @GetMapping("/get-all")
    public ResponseEntity<List<MedicationItemsResponse>> getAllMedicationItems() {
        return ResponseEntity.ok(medicationItemsService.getAllMedicationItems());
    }
    @Operation(summary = "Lấy danh sách thuốc theo mã", description = "Lấy danh sách thuốc theo mã")
    @GetMapping("/get-by-id/{id}")
    public ResponseEntity<MedicationItemsResponse> getMedicationItemById(int id) {
        return ResponseEntity.ok(medicationItemsService.getMedicationItemById(id));
    }

    @Operation(summary = "Cập nhật thông tin thuốc", description = "Cập nhật thông tin thuốc theo mã")
    @PutMapping("/update/{id}")
    public ResponseEntity<MedicationItemsResponse> updateMedicationItem(int id, @Valid @RequestBody MedicationItemsRequest request) {
        return ResponseEntity.ok(medicationItemsService.updateMedicationItem(id, request));
    }

    @Operation(summary = "Xóa thuốc", description = "Xóa thuốc theo mã")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Boolean> deleteMedicationItem(@PathVariable int id) {
        boolean isDeleted = medicationItemsService.deleteMedicationItem(id);

        if (isDeleted) {
            return ResponseEntity.ok(true);
        } else {
            return ResponseEntity.notFound().build();
        }

    }

    @Operation(summary = "Lấy danh sách thuốc theo tên", description = "Lấy danh sách thuốc theo tên")
    @GetMapping("get-by-name/{name}")
    public ResponseEntity<List<MedicationItemsResponse>> getMedicationItemByName(@PathVariable String name) {
        List<MedicationItemsResponse> response = medicationItemsService.getMedicationItemByName(name);

        return ResponseEntity.ok(response);
    }
    @Operation(summary = "Lấy danh sách thuốc theo ngày sản xuất và hết hạn")
    @GetMapping("/filter-manufacturer-expiry")
    public ResponseEntity<List<MedicationItemsResponse>> filterMedicationItems(
            @RequestParam(required = false) LocalDate manufacturer,
            @RequestParam(required = false) LocalDate expiryDate) {
        List<MedicationItemsResponse> filteredItems = medicationItemsService.filterMedicationItems(manufacturer, expiryDate);
        return ResponseEntity.ok(filteredItems);
    }

}
