package com.fpt.medically_be.entity;

public enum CheckupStatus {
    COMPLETED("Hoàn thành khám"),
    NEED_FOLLOW_UP("Cần theo dõi thêm");

    private final String description;

    CheckupStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
