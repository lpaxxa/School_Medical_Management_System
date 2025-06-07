package com.fpt.medically_be.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class NurseProfileRequestDTO {
    // Email validations
    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    @Size(max = 100, message = "Email cannot exceed 100 characters")
    private String email;

    // Full name validations
    @NotBlank(message = "Full name is required")
    @Size(min = 3, max = 100, message = "Full name must be between 3 and 100 characters")
    @Pattern(regexp = "^[a-zA-Z\\s]*$", message = "Full name should contain only letters and spaces")
    private String fullName;

    // Phone number validations
    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^\\+?[0-9]{10}$", message = "Please provide a valid phone number (10 digits)")
    private String phoneNumber;

    // Qualification validations
    @NotBlank(message = "Qualification is required")
    @Size(max = 200, message = "Qualification cannot exceed 200 characters")
    private String qualification;
}
