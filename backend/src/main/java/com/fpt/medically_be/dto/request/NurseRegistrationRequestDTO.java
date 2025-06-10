package com.fpt.medically_be.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class NurseRegistrationRequestDTO extends RegistrationDTO{


    @NotBlank(message = "Qualification is required")
    @Size(max = 200, message = "Qualification cannot exceed 200 characters")
    private String qualification;
}
