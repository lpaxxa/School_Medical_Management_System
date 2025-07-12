package com.fpt.medically_be.dto.response;

import com.fpt.medically_be.dto.StudentDTO;
import lombok.Data;
import java.util.List;

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
    private List<StudentDTO> students; // List of students for parents
    
    // Nurse-specific fields
    private String qualification;
}
