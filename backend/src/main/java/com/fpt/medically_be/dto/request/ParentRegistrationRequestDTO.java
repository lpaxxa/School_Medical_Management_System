package com.fpt.medically_be.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Data
@Getter
@Setter
public class ParentRegistrationRequestDTO extends RegistrationDTO {
    @Size(max = 255, message = "Address cannot exceed 255 characters")
    private String address;

    @Pattern(regexp = "^\\d{10}$", message = "Phone number should be between 10 digits")
    private String emergencyPhoneNumber;

    @Size(max = 50, message = "Relationship type cannot exceed 50 characters")
    private String relationshipType;

    @Size(max = 100, message = "Occupation type cannot exceed 100 characters")
    private String occupation;

    // Optional student information for registration
    private List<StudentRegistrationInfo> students;

    @Data
    @Getter
    @Setter
    public static class StudentRegistrationInfo {
        @NotBlank(message = "Student full name is required")
        @Size(max = 255, message = "Student full name cannot exceed 255 characters")
        private String fullName;
        
        private LocalDate dateOfBirth;
        
        @Size(max = 20, message = "Gender cannot exceed 20 characters")
        private String gender;
        
        @Size(max = 50, message = "Student ID cannot exceed 50 characters")
        private String studentId;
        
        @Size(max = 50, message = "Class name cannot exceed 50 characters")
        private String className;
        
        @Size(max = 50, message = "Grade level cannot exceed 50 characters")
        private String gradeLevel;
        
        @Size(max = 50, message = "School year cannot exceed 50 characters")
        private String schoolYear;
    }
}
