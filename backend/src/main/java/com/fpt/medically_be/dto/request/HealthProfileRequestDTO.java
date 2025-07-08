package com.fpt.medically_be.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import com.fpt.medically_be.entity.CheckupStatus;

import java.time.LocalDate;

@Data
public class HealthProfileRequestDTO {
    private Long id;
    @Pattern(regexp = "^(A|B|AB|O)[+-]?$|^Chưa xác định$|^Chưa cập nhật$", message = "Blood type must be valid (A+, B-, AB+, O+, etc.) or 'Chưa xác định'")
    private String bloodType;

    @DecimalMin(value = "0.0", message = "Height cannot be negative")
    @DecimalMax(value = "300.0", message = "Height exceeds maximum value")
    private Double height;

    @DecimalMin(value = "0.0", message = "Weight cannot be negative")
    @DecimalMax(value = "500.0", message = "Weight exceeds maximum value")
    private Double weight;
    private String allergies;
    private String chronicDiseases;
    @Pattern(regexp = "^(6/\\d+|20/\\d+)$|^Chưa kiểm tra$|^Bình thường$", message = "Vision format should be like 6/6, 20/20, etc. or 'Chưa kiểm tra'")
    private String visionLeft;
    @Pattern(regexp = "^(6/\\d+|20/\\d+)$|^Chưa kiểm tra$|^Bình thường$", message = "Vision format should be like 6/6, 20/20, etc. or 'Chưa kiểm tra'")
    private String visionRight;
    private String hearingStatus;
    private String dietaryRestrictions;
    @Pattern(regexp = "^(\\+?[0-9]{10,15})$|^Liên hệ phụ huynh$|^[\\s\\S]*$", message = "Emergency contact should be a valid phone number or contact information")
    private String emergencyContactInfo;
    private String immunizationStatus;
    private LocalDate lastPhysicalExamDate;
    private String specialNeeds;
    private CheckupStatus checkupStatus;


}
