package com.fpt.medically_be.entity;

public enum ResponseStatus {
    PENDING, // Chờ phản hồi
    ACCEPTED,
    REJECTED,
    NOT_REQUIRED // Không cần phản hồi (vaccine tự khai báo)
}
