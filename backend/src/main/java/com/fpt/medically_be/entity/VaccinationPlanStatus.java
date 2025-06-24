package com.fpt.medically_be.entity;

public enum VaccinationPlanStatus {
    ONGOING("Đang diễn ra"),
    COMPLETED("Kết thúc"),
    CANCELLED("Đã hủy");

    private final String vietnameseName;

    VaccinationPlanStatus(String vietnameseName) {
        this.vietnameseName = vietnameseName;
    }

    public String getVietnameseName() {
        return vietnameseName;
    }
}
