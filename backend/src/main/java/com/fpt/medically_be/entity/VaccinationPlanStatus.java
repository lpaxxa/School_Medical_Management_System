package com.fpt.medically_be.entity;

public enum VaccinationPlanStatus {
    WAITING_PARENT, // đang gửi thông báo
    IN_PROGRESS,    // đang tiêm
    COMPLETED,
    CANCELED
}
