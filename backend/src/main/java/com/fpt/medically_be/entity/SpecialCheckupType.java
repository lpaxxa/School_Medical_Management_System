package com.fpt.medically_be.entity;

public enum SpecialCheckupType {
    REPRODUCTIVE_HEALTH("Khám sinh dục"),
    PSYCHOLOGICAL("Khám tâm lý"),
    BONE_EXAMINATION("Khám xương khớp"),
    DENTAL_EXAMINATION("Khám răng hàm mặt"),
    ALLERGY_TEST("Test dị ứng"),
    BLOOD_TEST("Xét nghiệm máu"),
    URINE_TEST("Xét nghiệm nước tiểu");

    private final String displayName;

    SpecialCheckupType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
