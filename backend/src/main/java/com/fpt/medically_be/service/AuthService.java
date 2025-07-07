package com.fpt.medically_be.service;

import com.fpt.medically_be.dto.auth.AuthResponseDTO;
import com.fpt.medically_be.dto.auth.LoginRequestDTO;
import com.fpt.medically_be.dto.request.NurseRegistrationRequestDTO;
import com.fpt.medically_be.dto.request.ParentRegistrationRequestDTO;
import com.fpt.medically_be.dto.request.RegistrationDTO;
import com.fpt.medically_be.entity.AccountMember;

import java.util.Map;


public interface AuthService {

    AccountMember login(LoginRequestDTO loginRequest);

    AccountMember findById(String id);

    AuthResponseDTO registerParent(ParentRegistrationRequestDTO parentRegistrationRequestDTO);
    AuthResponseDTO registerNurse(NurseRegistrationRequestDTO nurseRegistrationRequestDTO);
    AuthResponseDTO registerAdmin(RegistrationDTO registrationDTO);
    
    // Generic registration method that handles role-based logic
    AuthResponseDTO registerMember(Map<String, Object> requestData);

    AccountMember processOAuth2Callback(String code, String state);

}