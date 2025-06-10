package com.fpt.medically_be.controller;



import com.fpt.medically_be.dto.response.MedicalIncidentResponseDTO;
import com.fpt.medically_be.dto.request.MedicalIncidentCreateDTO;
import com.fpt.medically_be.dto.response.MedicalIncidentStudentDTO;
import com.fpt.medically_be.service.MedicalIncidentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
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
    public List<MedicalIncidentResponseDTO> getAllMedicalIncidents() {
        return medicalIncidentService.getAllMedicalIncidents();
    }

    @GetMapping("/{id}")
    public MedicalIncidentResponseDTO findMedicalIncidentDtoByIncidentId(@PathVariable Long id) {
        return medicalIncidentService.findMedicalIncidentDtoByIncidentId(id);
    }

    @GetMapping("/types/{incidentType}")
    public List<MedicalIncidentResponseDTO> getTypesOfMedicalIncidents(@PathVariable("incidentType") String incidentType) {
        return medicalIncidentService.getTypesOfMedicalIncidents(incidentType);
    }

        @GetMapping("/follow-up-notes/{requireFollowUpNotes}")
    public List<MedicalIncidentResponseDTO> getMedicalIncidentByFollowUpNotes(@PathVariable("requireFollowUpNotes") boolean followUpNotes) {
        return medicalIncidentService.getMedicalIncidentsByRequiresFollowUp(followUpNotes);
    }



//        @GetMapping("/details/{id}")
//    public List<MedicalIncidentStudentDTO> getMedicalIncidentDetails(@PathVariable("id") Long incidentId) {
//        return medicalIncidentService.get(incidentId);
//    }

    @PostMapping("/create")
    public MedicalIncidentResponseDTO createMedicalIncident(@RequestBody MedicalIncidentCreateDTO medicalIncidentDTO) {
        return medicalIncidentService.createMedicalIncident(medicalIncidentDTO);
    }
    @PutMapping("update/{id}")
    public
    MedicalIncidentResponseDTO updateMedicalIncident(@PathVariable("id") Long id, @RequestBody MedicalIncidentCreateDTO medicalIncidentCreateDTO) {
        return medicalIncidentService.updateMedicalIncident(id, medicalIncidentCreateDTO);
    }
    @DeleteMapping("/delete/{id}")
    public boolean deleteMedicalIncident(@PathVariable("id") Long id) {

        boolean deleted = medicalIncidentService.deleteMedicalIncidentById(id);
        if (deleted) {
            return true;
        } else {
            throw new RuntimeException("Failed to delete medical incident with ID: " + id);
        }
    }


    @GetMapping("/filter")
    public List<MedicalIncidentResponseDTO> filterIncidents(
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate,
            @RequestParam(value = "severityLevel", required = false) String severityLevel) {

        LocalDate start = (startDate != null) ? LocalDate.parse(startDate) : null;
        LocalDate end = (endDate != null) ? LocalDate.parse(endDate) : null;

        return medicalIncidentService.getFilteredIncidents(start, end, severityLevel);
    }


    @GetMapping("details/{id}")
    public MedicalIncidentStudentDTO getMedicalIncidentDetails(@PathVariable("id") Long incidentId) {
        return medicalIncidentService.getMedicalIncidentDetails(incidentId);
    }






//    @DeleteMapping("/delete/{id}")
//    public ResponseEntity<String> deleteMedicalIncident(@PathVariable("id") Long id) {
//        medicalIncidentService.deleteMedicalIncident(id);
//
//        return ResponseEntity.ok("Deleted successfully");
//    }
//
//    @GetMapping("/details/{id}")
//    public List<MedicalIncidentStudentDTO> getMedicalIncidentDetails(@PathVariable("id") Long incidentId) {
//        return medicalIncidentService.getMedicalIncidentDetails(incidentId);
//    }
//

//

//

//

}

