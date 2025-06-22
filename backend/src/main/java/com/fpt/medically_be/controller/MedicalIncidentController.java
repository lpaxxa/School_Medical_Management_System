package com.fpt.medically_be.controller;



import com.fpt.medically_be.dto.response.MedicalIncidentResponseDTO;
import com.fpt.medically_be.dto.request.MedicalIncidentCreateDTO;
import com.fpt.medically_be.dto.response.MedicalIncidentStudentDTO;
import com.fpt.medically_be.service.MedicalIncidentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/medical-incidents")
@Tag(name = "Quản lí sự kiện y tế trong trường", description = "APIs dành cho việc quản lí sự kiện y tế trong trường học")
public class MedicalIncidentController {

    @Autowired
    private MedicalIncidentService medicalIncidentService;

    /**
     * Endpoint to retrieve a list of medical incidents with optional filtering.
     */

    @Operation(summary = "Lấy danh sách sự kiện y tế", description = "Lấy tất cả sự kiện y tế trong hệ thống")
    @GetMapping()
    public List<MedicalIncidentResponseDTO> getAllMedicalIncidents() {
        return medicalIncidentService.getAllMedicalIncidents();
    }

    @Operation(summary = "Lấy sự kiện y tế theo ID", description = "Lấy thông tin sự kiện y tế theo ID")
    @GetMapping("/{id}")
    public MedicalIncidentResponseDTO findMedicalIncidentDtoByIncidentId(@PathVariable Long id) {
        return medicalIncidentService.findMedicalIncidentDtoByIncidentId(id);
    }

    @Operation(summary = "Lấy danh sách sự kiện y tế theo loại", description = "Lấy danh sách sự kiện y tế theo loại sự kiện")
    @GetMapping("/types/{incidentType}")
    public List<MedicalIncidentResponseDTO> getTypesOfMedicalIncidents(@PathVariable("incidentType") String incidentType) {
        return medicalIncidentService.getTypesOfMedicalIncidents(incidentType);
    }

    @Operation(summary = "Lấy danh sách sự kiện y tế cần được theo dõi", description = "Lấy danh sách sự kiện y tế cần được theo dõi")
        @GetMapping("/follow-up-notes/{requireFollowUpNotes}")
    public List<MedicalIncidentResponseDTO> getMedicalIncidentByFollowUpNotes(@PathVariable("requireFollowUpNotes") boolean followUpNotes) {
        return medicalIncidentService.getMedicalIncidentsByRequiresFollowUp(followUpNotes);
    }




//        @GetMapping("/details/{id}")
//    public List<MedicalIncidentStudentDTO> getMedicalIncidentDetails(@PathVariable("id") Long incidentId) {
//        return medicalIncidentService.get(incidentId);
//    }

    @Operation(summary = "Tạo sự kiện y tế", description = "Tạo một sự kiện y tế mới")
    @PostMapping("/create")
    public MedicalIncidentResponseDTO createMedicalIncident(@RequestBody MedicalIncidentCreateDTO medicalIncidentDTO) {
        return medicalIncidentService.createMedicalIncident(medicalIncidentDTO);
    }

    @Operation(summary = "Cập nhật sự kiện y tế", description = "Cập nhật thông tin của một sự kiện y tế theo ID")
    @PutMapping("update/{id}")
    public
    MedicalIncidentResponseDTO updateMedicalIncident(@PathVariable("id") Long id, @RequestBody MedicalIncidentCreateDTO medicalIncidentCreateDTO) {
        return medicalIncidentService.updateMedicalIncident(id, medicalIncidentCreateDTO);
    }

    @Operation(summary = "Xóa sự kiện y tế", description = "Xóa một sự kiện y tế theo ID")
    @DeleteMapping("/delete/{id}")
    public boolean deleteMedicalIncident(@PathVariable("id") Long id) {

        boolean deleted = medicalIncidentService.deleteMedicalIncidentById(id);
        if (deleted) {
            return true;
        } else {
            throw new RuntimeException("Failed to delete medical incident with ID: " + id);
        }
    }

    @Operation(summary = "Lọc sự kiện y tế", description = "Lọc sự kiện y tế theo ngày bắt đầu, ngày kết thúc và mức độ nghiêm trọng")
    @GetMapping("/filter")
    public List<MedicalIncidentResponseDTO> filterIncidents(
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate,
            @RequestParam(value = "severityLevel", required = false) String severityLevel) {

        LocalDate start = (startDate != null) ? LocalDate.parse(startDate) : null;
        LocalDate end = (endDate != null) ? LocalDate.parse(endDate) : null;

        return medicalIncidentService.getFilteredIncidents(start, end, severityLevel);
    }

    @Operation(summary = "Lấy chi tiết sự kiện y tế", description = "Lấy chi tiết của một sự kiện y tế theo ID")
    @GetMapping("details/{id}")
    public MedicalIncidentStudentDTO getMedicalIncidentDetails(@PathVariable("id") Long incidentId) {
        return medicalIncidentService.getMedicalIncidentDetails(incidentId);
    }

    @Operation(summary = "Lấy danh sách sự kiện y tế theo ID học sinh", description = "Lấy danh sách sự kiện y tế của một học sinh theo ID")
    @GetMapping("/student/{id}")
    public List<MedicalIncidentResponseDTO> getMedicalIncidentByStudentID(@PathVariable("id") Long id) {
        return medicalIncidentService.getMedicalIncidentByStudentID(id);
    }


    @Operation(summary = "Lấy danh sách sự kiện y tế theo tên học sinh", description = "Lấy danh sách sự kiện y tế của một học sinh theo tên")
    @GetMapping("/student/name/{name}")
    public List<MedicalIncidentResponseDTO> getMedicalIncidentByStudentName(@PathVariable("name") String name) {
        return medicalIncidentService.getMedicalIncidentByStudentName(name);
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

