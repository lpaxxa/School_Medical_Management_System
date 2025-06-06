package com.fpt.medically_be.controller;



import com.fpt.medically_be.dto.MedicalIncidentDTO;
import com.fpt.medically_be.entity.MedicalIncident;
import com.fpt.medically_be.service.MedicalIncidentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/medical-incidents")
public class MedicalIncidentController {

    @Autowired
    private MedicalIncidentService medicalIncidentService;

    /**
     * Endpoint to retrieve a list of medical incidents with optional filtering.
     */

    @GetMapping()
    public List<MedicalIncidentDTO> getAllMedicalIncidents() {
        return medicalIncidentService.getAllMedicalIncidents();
    }


    @GetMapping("/filter")
    public List<MedicalIncidentDTO> filterIncidents(
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate,
            @RequestParam(value = "severityLevel", required = false) String severityLevel) {

        LocalDate start = (startDate != null) ? LocalDate.parse(startDate) : null;
        LocalDate end = (endDate != null) ? LocalDate.parse(endDate) : null;

        return medicalIncidentService.getFilteredIncidents(start, end, severityLevel);
    }

    @GetMapping("/{id}")
    public MedicalIncidentDTO findMedicalIncidentDtoByIncidentId(@PathVariable Long id) {
        return medicalIncidentService.findMedicalIncidentDtoByIncidentId(id);
    }

    @PostMapping("/create")
    public MedicalIncidentDTO createMedicalIncident(@RequestBody MedicalIncidentDTO medicalIncidentDTO) {
        return medicalIncidentService.createMedicalIncident(medicalIncidentDTO);
    }
    @PutMapping("update/{id}")
    public MedicalIncidentDTO updateMedicalIncident(@PathVariable("id") Long id, @RequestBody MedicalIncidentDTO medicalIncidentDTO) {
        return medicalIncidentService.updateMedicalIncident(id, medicalIncidentDTO);
    }
}

