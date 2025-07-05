package com.fpt.medically_be.entity;

public enum ConsentStatus {
    PENDING("Chờ phản hồi"),
    APPROVED("Đồng ý"),
    REJECTED("Từ chối");

    private final String displayName;

    ConsentStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
} 