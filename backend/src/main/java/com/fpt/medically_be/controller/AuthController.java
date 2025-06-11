package com.fpt.medically_be.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fpt.medically_be.dto.auth.AuthResponseDTO;
import com.fpt.medically_be.dto.auth.LoginRequestDTO;
import com.fpt.medically_be.dto.auth.PasswordResetDTO;
import com.fpt.medically_be.dto.auth.PasswordResetRequestDTO;
import com.fpt.medically_be.dto.request.NurseRegistrationRequestDTO;
import com.fpt.medically_be.dto.request.ParentRegistrationRequestDTO;
import com.fpt.medically_be.entity.MemberRole;
import com.fpt.medically_be.service.AuthService;
import com.fpt.medically_be.service.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.logging.Logger;

import static com.fpt.medically_be.entity.MemberRole.NURSE;
import static com.fpt.medically_be.entity.MemberRole.PARENT;


@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {
    private static final Logger logger = Logger.getLogger(AuthController.class.getName());
    
    private final AuthService authService;
    private final JwtService jwtService;
    private final ObjectMapper objectMapper;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, Object> requestData) {
        try {
            String role = (String) requestData.get("role");
            
            if (PARENT.name().equals(role)) {
                ParentRegistrationRequestDTO parentDTO = objectMapper.convertValue(requestData, ParentRegistrationRequestDTO.class);
                return ResponseEntity.ok(authService.registerParent(parentDTO));
            } else if (NURSE.name().equals(role)) {
                NurseRegistrationRequestDTO nurseDTO = objectMapper.convertValue(requestData, NurseRegistrationRequestDTO.class);
                return ResponseEntity.ok(authService.registerNurse(nurseDTO));
            } else {
                return ResponseEntity.badRequest().body("Invalid role specified in registration request");
            }
        }catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    //
    // Example request body for registration(NURSE):{
    //  "email": "nurse@hospital.com",
    //  "password": "secure123",
    //  "fullName": "Jane Smith",
    //  "phoneNumber": "1234567890",
    //  "role": "NURSE",
    //  "qualification": "RN, BSN, 5 years experience"
    //
    //}

    //Example request body for registration(Parent):
//     {
//    "email": "mary.smith@yahoo.com",
//      "password": "mySecurePass456",
//      "fullName": "Mary Smith",
//      "phoneNumber": "0111222333",
//      "role": "PARENT",
//      "address": "456 Oak Avenue, Downtown, NY 10001",
//      "emergencyPhoneNumber": "0444555666",
//      "relationshipType": "Mother",
//      "occupation": "Teacher",
//      "students": [
//        {
//          "fullName": "John Smith",
//          "dateOfBirth": "2010-05-15",
//          "gender": "Male",
//          "studentId": "STU2024001",
//          "className": "5A",
//          "gradeLevel": "Grade 5",
//          "schoolYear": "2024-2025"
//        },
//        {
//          "fullName": "Jane Smith",
//          "dateOfBirth": "2012-08-22",
//          "gender": "Female",
//          "studentId": "STU2024002",
//          "className": "3B",
//          "gradeLevel": "Grade 3",
//          "schoolYear": "2024-2025"
//        }
//      ]
//    }


    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO loginRequest) {
        logger.info("Login attempt for user: " + loginRequest.getUsername());
        
        var accountMember = authService.login(loginRequest);
        if (accountMember == null) {
            logger.warning("Login failed for user: " + loginRequest.getUsername());
            return ResponseEntity.status(401).body(null);
        } else {
            logger.info("Login successful for user: " + loginRequest.getUsername());
            AuthResponseDTO authResponseDTO = new AuthResponseDTO().toObject(accountMember);
            authResponseDTO.setToken(jwtService.generateToken(
                    accountMember.getId(),
                    accountMember.getEmail(),
                    accountMember.getPhoneNumber(),
                    accountMember.getRole()


            ));
            return ResponseEntity.ok(authResponseDTO);
        }
    }

    @GetMapping("/oauth2/success")
    public ResponseEntity<AuthResponseDTO> oauth2Success(@RequestParam (required = false) String code, @RequestParam (required = false) String state, @RequestParam (required = false) String error ) {
        if(error != null) {
            logger.warning("OAuth2 login failed: " + error);
            return ResponseEntity.badRequest().body(null);
        }
       var accountMember = authService.processOAuth2Callback(code, state);
        if(accountMember == null) {
            return ResponseEntity.status(401).body(null);
        }
        AuthResponseDTO authResponseDTO = new AuthResponseDTO().toObject(accountMember);
        authResponseDTO.setToken(jwtService.generateToken(
                accountMember.getId(),
                accountMember.getEmail(),
                accountMember.getPhoneNumber(),
                accountMember.getRole()
        ));
        return ResponseEntity.ok(authResponseDTO);




    }
    @GetMapping("/oauth2/failure")
    public ResponseEntity<String> oauth2Failure() {
        return ResponseEntity.status(401).body("OAuth2 authentication failed");
    }

    @GetMapping("/me")
    public ResponseEntity<MemberRole> getCurrentUser() {
        var email = SecurityContextHolder.getContext().getAuthentication().getName();
        Logger.getAnonymousLogger().info(email);
        var accountMember = authService.findById(email);

        return ResponseEntity.ok(accountMember.getRole());
    }

    @GetMapping("/test-current-user")
    @PreAuthorize("hasRole('PARENT')")
    public ResponseEntity<String> testCurrentUser(Authentication authentication) {
        return ResponseEntity.ok("Current user name: " + authentication.getName());

    }
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@Valid @RequestBody PasswordResetRequestDTO requestDTO) {
        authService.initiatePasswordReset(requestDTO.getEmail());
        return ResponseEntity.ok("Password reset email sent successfully");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody PasswordResetDTO requestDTO) {
        authService.resetPassword(requestDTO.getToken(), requestDTO.getNewPassword());
        return ResponseEntity.ok("Password has been reset successfully");
    }

    @GetMapping("/test-email")
    public ResponseEntity<String> testEmail(@RequestParam String email) {
        try {
            // Use the same method as password reset
            RestTemplate restTemplate = new RestTemplate();
            String url = "https://api.resend.com/emails";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth("re_JaaxEqc2_ENsdrTtK5JjenVDkVSYhmpbr");
            
            String emailBody = String.format("""
            {
                "from": "Test System <onboarding@resend.dev>",
                "to": ["%s"],
                "subject": "Test Email",
                "html": "<h1>Test Email</h1><p>This is a test email from your medical system.</p><p>If you received this, email sending is working!</p>"
            }
            """, email);
            
            HttpEntity<String> request = new HttpEntity<>(emailBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            
            return ResponseEntity.ok("Email sent! Response: " + response.getBody());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }


}