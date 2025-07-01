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


    @GetMapping
    @Operation(summary = "Lấy tất cả thông tin tiêm chủng", description = "Trả về danh sách tất cả các thông tin tiêm chủng trong hệ thống")
   @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    public ResponseEntity<List<VaccinationDTO>> getAllVaccinations() {
        return ResponseEntity.ok(vaccinationService.getAllVaccinations());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy thông tin tiêm chủng theo ID", description = "Trả về chi tiết thông tin tiêm chủng dựa trên ID cung cấp")
   @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE') or hasRole('PARENT')")
    public ResponseEntity<VaccinationDTO> getVaccinationById(@PathVariable Long id) {
        return ResponseEntity.ok(vaccinationService.getVaccinationById(id));
    }

    @GetMapping("/health-profile/{healthProfileId}")
    @Operation(summary = "Lấy thông tin tiêm chủng theo hồ sơ sức khỏe", description = "Trả về danh sách các thông tin tiêm chủng của một hồ sơ sức khỏe dựa trên ID hồ sơ")
  @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE') or hasRole('PARENT')")
    public ResponseEntity<List<VaccinationDTO>> getVaccinationsByHealthProfileId(@PathVariable Long healthProfileId) {
        return ResponseEntity.ok(vaccinationService.getVaccinationsByHealthProfileId(healthProfileId));
    }

    @GetMapping("/name/{vaccineName}")
    @Operation(summary = "Lấy thông tin tiêm chủng theo tên vaccine", description = "Trả về danh sách các thông tin tiêm chủng dựa trên tên vaccine")
   @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    public ResponseEntity<List<VaccinationDTO>> getVaccinationsByName(@PathVariable String vaccineName) {
        return ResponseEntity.ok(vaccinationService.getVaccinationsByName(vaccineName));
    }

//    @GetMapping("/date-range")
//    @Operation(summary = "Lấy thông tin tiêm chủng theo khoảng thời gian", description = "Trả về danh sách các thông tin tiêm chủng trong khoảng thời gian từ ngày bắt đầu đến ngày kết thúc")
////    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
//    public ResponseEntity<List<VaccinationDTO>> getVaccinationsByDateRange(
//            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
//            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
//        return ResponseEntity.ok(vaccinationService.getVaccinationsByDateRange(startDate, endDate));
//    }

//    @GetMapping("/upcoming")
//    @Operation(summary = "Lấy thông tin tiêm chủng sắp tới", description = "Trả về danh sách các thông tin tiêm chủng có lịch tái khám trước ngày được chỉ định")
////    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
//    public ResponseEntity<List<VaccinationDTO>> getUpcomingVaccinationsDue(
//            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate beforeDate) {
//        return ResponseEntity.ok(vaccinationService.getUpcomingVaccinationsDue(beforeDate));
//    }


    @PostMapping("/create")
    @Operation(summary = "Tạo mới thông tin tiêm chủng", description = "Tạo mới một thông tin tiêm chủng với dữ liệu được cung cấp")
       @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    public ResponseEntity<VaccinationDetailResponse> createVaccination(@RequestBody VaccinationRequestDTO vaccinationRequestDTO) {
        return ResponseEntity.ok(vaccinationService.createVaccination(vaccinationRequestDTO));
    }




    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật thông tin tiêm chủng", description = "Cập nhật thông tin của một mũi tiêm chủng dựa trên ID")
//    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    public ResponseEntity<VaccinationDetailResponse> updateVaccination(@PathVariable Long id, @RequestBody VaccinationRequestDTO vaccinationRequestDTO) {
        return ResponseEntity.ok(vaccinationService.updateVaccination(id, vaccinationRequestDTO));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa thông tin tiêm chủng", description = "Xóa một thông tin tiêm chủng dựa trên ID")
    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    public ResponseEntity<Void> deleteVaccination(@PathVariable Long id) {
        vaccinationService.deleteVaccination(id);
        return ResponseEntity.noContent().build();
    }

    //dt

    @GetMapping("/student/parent/{id}")
    @Operation(summary = "Lấy thông tin tiêm chủng theo ID phụ huynh", description = "Trả về danh sách các thông tin tiêm chủng của học sinh theo ID phụ huynh")
    //@PreAuthorize("hasRole('ADMIN') or hasRole('NURSE') or hasRole('PARENT')")
    public ResponseEntity<List<VaccinationDTO>> getVaccinationsByStudentParentId(@PathVariable Long id) {
        return ResponseEntity.ok(vaccinationService.getVaccinationsByParent(id));
    }

    @Operation(summary = "Can delete")
    @GetMapping("/notification-recipients/{notificationRecipientId}/{studentId}")
   // @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE') or hasRole('PARENT')")
    public ResponseEntity<VaccineInforRequest> getVaccinationDetailByNotificationRecipientId(@PathVariable("studentId") String studentId
            ,@PathVariable("notificationRecipientId") Long notificationRecipientId
                                                                                             )  {
        return ResponseEntity.ok(notification2Service.getVacineByStudentIdAndNotiID(studentId, notificationRecipientId));
    }

    @Operation(summary = "Seccond, lấy chi tiết vaccine cho lịch sử",description = "lấy bằng id của notificationRecipient")

    @GetMapping("/notification-recipient/{notificationRecipientId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE') or hasRole('PARENT')")
    public ResponseEntity<VaccinationDetailResponse> getVaccinationDetailByNotificationRecipientId(@PathVariable Long notificationRecipientId) {
        return ResponseEntity.ok(vaccinationService.getVaccinationDetailByNotificationRecipientId(notificationRecipientId));
    }

}
