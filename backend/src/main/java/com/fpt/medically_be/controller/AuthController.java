package com.fpt.medically_be.controller;

import com.fpt.medically_be.dto.auth.AuthResponseDTO;
import com.fpt.medically_be.dto.auth.LoginRequestDTO;
import com.fpt.medically_be.dto.auth.PasswordResetDTO;
import com.fpt.medically_be.dto.auth.PasswordResetRequestDTO;
import com.fpt.medically_be.entity.MemberRole;
import com.fpt.medically_be.service.AuthService;
import com.fpt.medically_be.service.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.logging.Logger;


@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {
    private static final Logger logger = Logger.getLogger(AuthController.class.getName());
    
    private final AuthService authService;
    private final JwtService jwtService;


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