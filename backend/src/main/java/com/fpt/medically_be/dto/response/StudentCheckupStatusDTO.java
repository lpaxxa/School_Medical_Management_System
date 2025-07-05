package com.fpt.medically_be.dto.response;

import com.fpt.medically_be.entity.CheckupStatus;
import com.fpt.medically_be.entity.ConsentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentCheckupStatusDTO {
    // Thông tin học sinh
    private Long studentId;
    private String studentName;
    private String studentClass;
    private Integer age;

    // Thông tin phụ huynh
    private String parentId; // Sửa từ Long thành String để phù hợp với AccountMember ID
    private String parentName;

    // Thông tin xác nhận của phụ huynh
    private Long parentConsentId;
    private ConsentStatus consentStatus;
    private LocalDateTime consentDate;

    // Thông tin kiểm tra
    private Long medicalCheckupId;
    private CheckupStatus checkupStatus;
    private List<String> specialCheckupItems; // Các mục kiểm tra đặc biệt được phụ huynh đồng ý

    // Thông tin ghi chú
    private String parentNotes;

    // Trạng thái thông báo
    private Boolean notificationSent;
    private Boolean resultNotificationSent;
}
