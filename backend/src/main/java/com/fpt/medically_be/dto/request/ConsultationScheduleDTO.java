package com.fpt.medically_be.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsultationScheduleDTO {
    private String consultationType; // Loại tư vấn: "Dinh dưỡng", "Tim mạch", "Thị lực", etc.
    private LocalDate scheduledDate; // Ngày hẹn tư vấn
    private LocalTime scheduledTime; // Giờ hẹn tư vấn
    private String doctorName; // Tên bác sĩ tư vấn
    private String specialistDepartment; // Khoa chuyên môn
    private String notes; // Ghi chú về tư vấn
    private String parentContact; // Thông tin liên hệ phụ huynh
    private Boolean urgentCase; // Trường hợp khẩn cấp cần tư vấn gấp
}
