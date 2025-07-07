package com.fpt.medically_be.entity;

public enum ResponseStatus {
    PENDING, // Chờ phản hồi
    ACCEPTED,
    REJECTED,
    NOT_APPLICABLE, // Không áp dụng (vaccine không cần phản hồi)
    NOT_REQUIRED ,// Không cần phản hồi (vaccine tự khai báo)
    RESPONSED // Đã phản hồi (tất cả mũi đã được xác nhận)
}
