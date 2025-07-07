package com.fpt.medically_be.dto.response;

import lombok.Data;

@Data
public class VaccineResponse {
    private Long id;
    private String name;
    private String description;
    private Integer totalDoses; // Tổng số mũi cần tiêm
    private Integer intervalDays; // Khoảng cách giữa các mũi (ngày)
    private Integer minAgeMonths; // Tuổi tối thiểu (tháng)
    private Integer maxAgeMonths; // Tuổi tối đa (tháng)
    private Boolean isActive = true; // Trạng thái hoạt động của vaccine

}
