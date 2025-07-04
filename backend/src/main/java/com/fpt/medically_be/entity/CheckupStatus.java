package com.fpt.medically_be.entity;

public enum CheckupStatus {
    WAITING("Đang chờ khám"),
    IN_PROGRESS("Đang thực hiện khám"),
    COMPLETED("Hoàn thành khám"),
    CANCELLED("Hủy bỏ");

    private final String description;

    CheckupStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
