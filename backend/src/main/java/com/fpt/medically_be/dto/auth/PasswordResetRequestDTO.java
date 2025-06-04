package com.fpt.medically_be.dto.auth;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PasswordResetRequestDTO {
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
}
