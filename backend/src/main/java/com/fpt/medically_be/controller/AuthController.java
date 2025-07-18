package com.fpt.medically_be.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fpt.medically_be.dto.auth.AuthResponseDTO;
import com.fpt.medically_be.dto.auth.LoginRequestDTO;

import com.fpt.medically_be.dto.request.NurseRegistrationRequestDTO;
import com.fpt.medically_be.dto.request.ParentRegistrationRequestDTO;
import com.fpt.medically_be.entity.AccountMember;
import com.fpt.medically_be.entity.MemberRole;
import com.fpt.medically_be.service.AuthService;
import com.fpt.medically_be.service.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.view.RedirectView;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
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

    @Value("${frontend.url}")
    private String frontendUrl;

//    @PostMapping("/register")
//  //  @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<?> register(@RequestBody Map<String, Object> requestData) {
//        try {
//            String role = (String) requestData.get("role");
//
//            if (PARENT.name().equals(role)) {
//                ParentRegistrationRequestDTO parentDTO = objectMapper.convertValue(requestData, ParentRegistrationRequestDTO.class);
//                return ResponseEntity.ok(authService.registerParent(parentDTO));
//            } else if (NURSE.name().equals(role)) {
//                NurseRegistrationRequestDTO nurseDTO = objectMapper.convertValue(requestData, NurseRegistrationRequestDTO.class);
//                return ResponseEntity.ok(authService.registerNurse(nurseDTO));
//            } else {
//                return ResponseEntity.badRequest().body("Invalid role specified in registration request");
//            }
//        }catch (Exception e) {
//            return ResponseEntity.badRequest().body(e.getMessage());
//        }
//    }
    //
//     Example request body for registration(NURSE):
//     {
//      "email": "nurse@hospital.com",
//      "password": "secure123",
//      "fullName": "Jane Smith",
//      "phoneNumber": "1234567890",
//      "role": "NURSE",
//      "qualification": "RN, BSN, 5 years experience"
//
//    }

    //Example request body for registration(Parent):
//     {
//    "email": "mimi.smith@yahoo.com",
//      "password": "12345",
//      "fullName": "Mimi Smith",
//      "phoneNumber": "0211222333",
//      "role": "PARENT",
//      "address": "456 Oak Avenue, Downtown, NY 10001",
//      "emergencyPhoneNumber": "0544555666",
//      "relationshipType": "Mother",
//      "occupation": "Teacher",
//      "students": [
//        {
//          "fullName": "Haha Smith",
//          "dateOfBirth": "2010-05-15",
//          "gender": "Male",
//          "studentId": "STU2024003",
//          "className": "5A",
//          "gradeLevel": "Grade 5",
//          "schoolYear": "2024-2025"
//        },
//        {
//          "fullName": "Hihi Smith",
//          "dateOfBirth": "2012-08-22",
//          "gender": "Female",
//          "studentId": "STU2024004",
//          "className": "3B",
//          "gradeLevel": "Grade 3",
//          "schoolYear": "2024-2025"
//        }
//      ]
//    }

    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("pong");
    }
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO loginRequest) {
        AccountMember member = authService.login(loginRequest);
        if (member == null) {
            return ResponseEntity.badRequest().build();
        }
        String token = jwtService.generateToken(
            member.getId(),
            member.getEmail(),
            member.getPhoneNumber(),
            member.getRole()
        );
        AuthResponseDTO authResponseDTO = new AuthResponseDTO().toObject(member);
        authResponseDTO.setToken(token);
        return ResponseEntity.ok(authResponseDTO);
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