package com.fpt.medically_be.dto.response;

import lombok.Data;

@Data
public class AccountAdminResponseDTO {
    private String id;
    private String email;
    private String password;
    private String phoneNumber;
    private String role;
    private String username;
    private Boolean isActive;
    private Boolean emailSent;
    
    // Common profile fields
    private String fullName;
    
    // Parent-specific fields
    private String address;
    private String relationshipType;
    private String occupation;
    
    // Nurse-specific fields
    private String qualification;
}
