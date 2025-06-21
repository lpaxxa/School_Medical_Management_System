package com.fpt.medically_be.dto.request;

import lombok.Data;

@Data
public class AccountUpdateRequestDTO {

    private String email;
    private String password;
    private String phoneNumber;
    private String role;


}
