package com.fpt.medically_be.controller;



import com.fpt.medically_be.dto.request.MedicationItemsRequest;
import com.fpt.medically_be.dto.response.MedicationItemsResponse;
import com.fpt.medically_be.service.MedicationItemsService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/medication-items")
public class MedicationItemController {


    @Autowired
    private MedicationItemsService medicationItemsService;

    @PostMapping("/create")
    public ResponseEntity<MedicationItemsResponse> createMedicationItem(@Valid @RequestBody MedicationItemsRequest request) {

        return ResponseEntity.ok(medicationItemsService.createMedicationItem(request));
    }

    @GetMapping("/get-all")
    public ResponseEntity<List<MedicationItemsResponse>> getAllMedicationItems() {
        return ResponseEntity.ok(medicationItemsService.getAllMedicationItems());
    }

    @GetMapping("/get-by-id/{id}")
    public ResponseEntity<MedicationItemsResponse> getMedicationItemById(int id) {
        return ResponseEntity.ok(medicationItemsService.getMedicationItemById(id));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<MedicationItemsResponse> updateMedicationItem(int id, @Valid @RequestBody MedicationItemsRequest request) {
        return ResponseEntity.ok(medicationItemsService.updateMedicationItem(id, request));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Boolean> deleteMedicationItem(@PathVariable int id) {
        boolean isDeleted = medicationItemsService.deleteMedicationItem(id);

        if (isDeleted) {
            return ResponseEntity.ok(true);
        } else {
            return ResponseEntity.notFound().build();
        }

    }

    @GetMapping("get-by-name/{name}")
    public ResponseEntity<MedicationItemsResponse> getMedicationItemByName(@PathVariable String name) {
        MedicationItemsResponse response = medicationItemsService.getMedicationItemByName(name);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/filter-manufacturer-expiry")
    public ResponseEntity<List<MedicationItemsResponse>> filterMedicationItems(
            @RequestParam(required = false) LocalDate manufacturer,
            @RequestParam(required = false) LocalDate expiryDate) {
        List<MedicationItemsResponse> filteredItems = medicationItemsService.filterMedicationItems(manufacturer, expiryDate);
        return ResponseEntity.ok(filteredItems);
    }


}
