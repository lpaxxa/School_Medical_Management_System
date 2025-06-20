package com.fpt.medically_be.controller;

import com.fpt.medically_be.dto.VaccinationDTO;
import com.fpt.medically_be.service.VaccinationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/vaccinations")
@Tag(name = "Tiêm chủng", description = "Quản lý tiêm chủng")
public class VaccinationController {

    private final VaccinationService vaccinationService;

    @Autowired
    public VaccinationController(VaccinationService vaccinationService) {
        this.vaccinationService = vaccinationService;
    }

    @Operation(
        summary = "Lấy tất cả thông tin tiêm chủng",
        description = "Trả về danh sách tất cả các mũi tiêm chủng trong hệ thống. " +
                      "Cách dùng: Gọi API này không cần tham số. " +
                      "Nên sử dụng khi cần xem tổng quan tất cả các mũi tiêm chủng hoặc để xuất báo cáo."
    )
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    public ResponseEntity<List<VaccinationDTO>> getAllVaccinations() {
        return ResponseEntity.ok(vaccinationService.getAllVaccinations());
    }

    @Operation(
        summary = "Lấy thông tin tiêm chủng theo ID",
        description = "Trả về chi tiết một mũi tiêm chủng cụ thể theo ID. " +
                      "Cách dùng: Truyền ID của mũi tiêm vào đường dẫn. " +
                      "Nên sử dụng khi cần xem chi tiết hoặc chỉnh sửa một mũi tiêm cụ thể."
    )
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE') or hasRole('PARENT')")
    public ResponseEntity<VaccinationDTO> getVaccinationById(@PathVariable Long id) {
        return ResponseEntity.ok(vaccinationService.getVaccinationById(id));
    }

    @Operation(
        summary = "Lấy thông tin tiêm chủng theo hồ sơ sức khỏe",
        description = "Trả về danh sách các mũi tiêm chủng của một học sinh theo ID hồ sơ sức khỏe. " +
                      "Cách dùng: Truyền ID hồ sơ sức khỏe vào đường dẫn. " +
                      "Nên sử dụng khi cần xem lịch sử tiêm chủng của một học sinh cụ thể hoặc cho phụ huynh xem thông tin tiêm chủng của con."
    )
    @GetMapping("/health-profile/{healthProfileId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE') or hasRole('PARENT')")
    public ResponseEntity<List<VaccinationDTO>> getVaccinationsByHealthProfileId(@PathVariable Long healthProfileId) {
        return ResponseEntity.ok(vaccinationService.getVaccinationsByHealthProfileId(healthProfileId));
    }

    @Operation(
        summary = "Lấy thông tin tiêm chủng theo tên vaccine",
        description = "Trả về danh sách các mũi tiêm chủng theo tên loại vaccine. " +
                      "Cách dùng: Truyền tên vaccine vào đường dẫn. " +
                      "Nên sử dụng khi cần thống kê các mũi tiêm của một loại vaccine cụ thể hoặc kiểm tra tình hình tiêm chủng một loại vaccine nào đó."
    )
    @GetMapping("/name/{vaccineName}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    public ResponseEntity<List<VaccinationDTO>> getVaccinationsByName(@PathVariable String vaccineName) {
        return ResponseEntity.ok(vaccinationService.getVaccinationsByName(vaccineName));
    }

    @Operation(
        summary = "Lấy thông tin tiêm chủng theo khoảng thời gian",
        description = "Trả về danh sách các mũi tiêm chủng trong một khoảng thời gian cụ thể. " +
                      "Cách dùng: Truyền startDate (ngày bắt đầu) và endDate (ngày kết thúc) theo định dạng ISO (YYYY-MM-DD). " +
                      "Nên sử dụng khi cần báo cáo thống kê theo thời gian hoặc lập kế hoạch tiêm chủng trong tương lai."
    )
    @GetMapping("/date-range")
    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    public ResponseEntity<List<VaccinationDTO>> getVaccinationsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(vaccinationService.getVaccinationsByDateRange(startDate, endDate));
    }

    @Operation(
        summary = "Lấy danh sách tiêm chủng sắp đến hạn",
        description = "Trả về danh sách các mũi tiêm chủng đến hạn trước một ngày cụ thể. " +
                      "Cách dùng: Truyền beforeDate (ngày đến hạn) theo định dạng ISO (YYYY-MM-DD). " +
                      "Nên sử dụng khi cần lên lịch tiêm chủng, gửi thông báo nhắc nhở đến phụ huynh hoặc chuẩn bị vaccine."
    )
    @GetMapping("/upcoming")
    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    public ResponseEntity<List<VaccinationDTO>> getUpcomingVaccinationsDue(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate beforeDate) {
        return ResponseEntity.ok(vaccinationService.getUpcomingVaccinationsDue(beforeDate));
    }

    @Operation(
        summary = "Tạo mới thông tin tiêm chủng",
        description = "Tạo mới một bản ghi tiêm chủng trong hệ thống. " +
                      "Cách dùng: Gửi thông tin tiêm chủng trong body request dưới dạng JSON. " +
                      "Nên sử dụng sau khi một học sinh được tiêm vaccine hoặc khi lên kế hoạch tiêm chủng trong tương lai."
    )
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    public ResponseEntity<VaccinationDTO> createVaccination(@RequestBody VaccinationDTO vaccinationDTO) {
        return ResponseEntity.ok(vaccinationService.createVaccination(vaccinationDTO));
    }

    @Operation(
        summary = "Cập nhật thông tin tiêm chủng",
        description = "Cập nhật thông tin của một bản ghi tiêm chủng đã tồn tại. " +
                      "Cách dùng: Truyền ID của mũi tiêm cần cập nhật vào đường dẫn và thông tin cập nhật trong body request. " +
                      "Nên sử dụng khi cần điều chỉnh thông tin, thời gian hoặc trạng thái của một mũi tiêm."
    )
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    public ResponseEntity<VaccinationDTO> updateVaccination(@PathVariable Long id, @RequestBody VaccinationDTO vaccinationDTO) {
        return ResponseEntity.ok(vaccinationService.updateVaccination(id, vaccinationDTO));
    }

    @Operation(
        summary = "Xóa thông tin tiêm chủng",
        description = "Xóa một bản ghi tiêm chủng khỏi hệ thống. " +
                      "Cách dùng: Truyền ID của mũi tiêm cần xóa vào đường dẫn. " +
                      "Nên sử dụng khi phát hiện thông tin sai hoặc trùng lặp. Lưu ý: chỉ Admin mới có quyền xóa dữ liệu này."
    )
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteVaccination(@PathVariable Long id) {
        vaccinationService.deleteVaccination(id);
        return ResponseEntity.noContent().build();
    }
}

