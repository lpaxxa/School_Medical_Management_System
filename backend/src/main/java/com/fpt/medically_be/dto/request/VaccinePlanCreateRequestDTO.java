package com.fpt.medically_be.dto.request;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class VaccinePlanCreateRequestDTO {
    private String name;
    private String description;
    private LocalDate vaccinationDate;
    private LocalDateTime deadlineDate; // Hạn phản hồi của phụ huynh
    private List<Long> vaccineIds; // danh sách vaccine
    private List<String> className; // Danh sách lớp cần gửi kế hoạch này
    private String customTitle;    // Tiêu đề thông báo tuỳ chỉnh (có thể null)
    private String customMessage;  // Nội dung thông báo tuỳ chỉnh (có thể null)
}
