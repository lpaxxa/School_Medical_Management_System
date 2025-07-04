package com.fpt.medically_be.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AccountUpdateRequestDTO {

    // Basic AccountMember fields
    @Email(message = "Email không hợp lệ")
    private String email;
    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
    private String password;
    @Pattern(
            regexp = "^0\\d{9}$",
            message = "Số điện thoại phải có 10 chữ số và bắt đầu bằng số 0"
    )
    private String phoneNumber;
    
    // Common fields for all roles
    @Size(max = 255, message = "Full name cannot exceed 255 characters")
    private String fullName;
    
    // Parent-specific fields
    @Size(max = 255, message = "Address cannot exceed 255 characters")
    private String address;
    @Size(max = 50, message = "Relationship type cannot exceed 50 characters")
    private String relationshipType;
    @Size(max = 100, message = "Occupation cannot exceed 100 characters")
    private String occupation;
    
    // Nurse-specific fields
    @Size(max = 200, message = "Qualification cannot exceed 200 characters")
    private String qualification;
    
    // Note: Admin uses only the basic fields (email, password, phoneNumber, fullName)
}
