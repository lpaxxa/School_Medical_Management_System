package com.fpt.medically_be.entity;

public enum AdministrationStatus {
    SUCCESSFUL,    // Medicine given successfully
    REFUSED,       // Student refused to take medicine
    PARTIAL,       // Only part of dose given
    ISSUE          // Any problem occurred (side effects, delays, etc.)
} 