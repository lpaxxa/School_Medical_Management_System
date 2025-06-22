package com.fpt.medically_be.controller;

import com.fpt.medically_be.dto.VaccinationDTO;
import com.fpt.medically_be.dto.request.VaccinationRequestDTO;
import com.fpt.medically_be.dto.response.VaccinationDetailResponse;
import com.fpt.medically_be.dto.response.VaccineInforRequest;
import com.fpt.medically_be.service.Notification2Service;
import com.fpt.medically_be.service.VaccinationService;
import io.swagger.v3.oas.annotations.Operation;
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

    @Autowired
    private VaccinationService vaccinationService;
    @Autowired
    private Notification2Service notification2Service;


//    @GetMapping
//    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
//    public ResponseEntity<List<VaccinationDTO>> getAllVaccinations() {
//        return ResponseEntity.ok(vaccinationService.getAllVaccinations());
//    }
//
//    @GetMapping("/{id}")
//    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE') or hasRole('PARENT')")
//    public ResponseEntity<VaccinationDTO> getVaccinationById(@PathVariable Long id) {
//        return ResponseEntity.ok(vaccinationService.getVaccinationById(id));
//    }
//
//    @GetMapping("/health-profile/{healthProfileId}")
//    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE') or hasRole('PARENT')")
//    public ResponseEntity<List<VaccinationDTO>> getVaccinationsByHealthProfileId(@PathVariable Long healthProfileId) {
//        return ResponseEntity.ok(vaccinationService.getVaccinationsByHealthProfileId(healthProfileId));
//    }
//
//    @GetMapping("/name/{vaccineName}")
//    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
//    public ResponseEntity<List<VaccinationDTO>> getVaccinationsByName(@PathVariable String vaccineName) {
//        return ResponseEntity.ok(vaccinationService.getVaccinationsByName(vaccineName));
//    }
//
//    @GetMapping("/date-range")
//    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
//    public ResponseEntity<List<VaccinationDTO>> getVaccinationsByDateRange(
//            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
//            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
//        return ResponseEntity.ok(vaccinationService.getVaccinationsByDateRange(startDate, endDate));
//    }
//
//    @GetMapping("/upcoming")
//    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
//    public ResponseEntity<List<VaccinationDTO>> getUpcomingVaccinationsDue(
//            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate beforeDate) {
//        return ResponseEntity.ok(vaccinationService.getUpcomingVaccinationsDue(beforeDate));
//    }
//

    @PostMapping("/create")
//    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    public ResponseEntity<VaccinationDetailResponse> createVaccination(@RequestBody VaccinationRequestDTO vaccinationRequestDTO) {
        return ResponseEntity.ok(vaccinationService.createVaccination(vaccinationRequestDTO));
    }



//
//    @PutMapping("/{id}")
//    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
//    public ResponseEntity<VaccinationDTO> updateVaccination(@PathVariable Long id, @RequestBody VaccinationDTO vaccinationDTO) {
//        return ResponseEntity.ok(vaccinationService.updateVaccination(id, vaccinationDTO));
//    }
//
//    @DeleteMapping("/{id}")
//    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<Void> deleteVaccination(@PathVariable Long id) {
//        vaccinationService.deleteVaccination(id);
//        return ResponseEntity.noContent().build();
//    }

    //dt

    @GetMapping("/student/parent/{id}")
    //@PreAuthorize("hasRole('ADMIN') or hasRole('NURSE') or hasRole('PARENT')")
    public ResponseEntity<List<VaccinationDTO>> getVaccinationsByStudentParentId(@PathVariable Long id) {
        return ResponseEntity.ok(vaccinationService.getVaccinationsByParent(id));
    }

    @Operation(summary = "Seccond, lấy chi tiết vaccine cho lịch sử",description = "lấy bằng id của notificationRecipient")

    @GetMapping("/notification-recipient/{notificationRecipientId}/{studentId}")
   // @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE') or hasRole('PARENT')")
    public ResponseEntity<VaccineInforRequest> getVaccinationDetailByNotificationRecipientId(@PathVariable("studentId") String studentId
            ,@PathVariable("notificationRecipientId") Long notificationRecipientId
                                                                                             )  {
        return ResponseEntity.ok(notification2Service.getVacineByStudentIdAndNotiID(studentId, notificationRecipientId));
    }

}
