package com.fpt.medically_be.controller;

import com.fpt.medically_be.dto.VaccinationDTO;
import com.fpt.medically_be.service.VaccinationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/vaccinations")
public class VaccinationController {

    private final VaccinationService vaccinationService;

    @Autowired
    public VaccinationController(VaccinationService vaccinationService) {
        this.vaccinationService = vaccinationService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    public ResponseEntity<List<VaccinationDTO>> getAllVaccinations() {
        return ResponseEntity.ok(vaccinationService.getAllVaccinations());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE') or hasRole('PARENT')")
    public ResponseEntity<VaccinationDTO> getVaccinationById(@PathVariable Long id) {
        return ResponseEntity.ok(vaccinationService.getVaccinationById(id));
    }

    @GetMapping("/health-profile/{healthProfileId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE') or hasRole('PARENT')")
    public ResponseEntity<List<VaccinationDTO>> getVaccinationsByHealthProfileId(@PathVariable Long healthProfileId) {
        return ResponseEntity.ok(vaccinationService.getVaccinationsByHealthProfileId(healthProfileId));
    }

    @GetMapping("/name/{vaccineName}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    public ResponseEntity<List<VaccinationDTO>> getVaccinationsByName(@PathVariable String vaccineName) {
        return ResponseEntity.ok(vaccinationService.getVaccinationsByName(vaccineName));
    }

    @GetMapping("/date-range")
    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    public ResponseEntity<List<VaccinationDTO>> getVaccinationsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(vaccinationService.getVaccinationsByDateRange(startDate, endDate));
    }

    @GetMapping("/upcoming")
    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    public ResponseEntity<List<VaccinationDTO>> getUpcomingVaccinationsDue(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate beforeDate) {
        return ResponseEntity.ok(vaccinationService.getUpcomingVaccinationsDue(beforeDate));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    public ResponseEntity<VaccinationDTO> createVaccination(@RequestBody VaccinationDTO vaccinationDTO) {
        return ResponseEntity.ok(vaccinationService.createVaccination(vaccinationDTO));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    public ResponseEntity<VaccinationDTO> updateVaccination(@PathVariable Long id, @RequestBody VaccinationDTO vaccinationDTO) {
        return ResponseEntity.ok(vaccinationService.updateVaccination(id, vaccinationDTO));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteVaccination(@PathVariable Long id) {
        vaccinationService.deleteVaccination(id);
        return ResponseEntity.noContent().build();
    }
}
