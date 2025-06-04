package com.fpt.medically_be.service.impl;

import com.fpt.medically_be.dto.auth.LoginRequestDTO;
import com.fpt.medically_be.entity.AccountMember;
import com.fpt.medically_be.entity.PasswordResetToken;
import com.fpt.medically_be.repos.AccountMemberRepos;
import com.fpt.medically_be.repos.PasswordResetTokenRepos;
import com.fpt.medically_be.service.AuthService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Date;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private final AccountMemberRepos accountMemberRepos;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetTokenRepos passwordResetTokenRepos;

    @Value("${frontend.url}")
    private String frontendUrl;

    @Override
    public AccountMember login(LoginRequestDTO loginRequest) {
        // Find user by email or username
        Optional<AccountMember> accountMemberOpt = accountMemberRepos.findAccountMemberByEmailOrUsername(
                loginRequest.getUsername(),
                loginRequest.getUsername()
        );

        if (accountMemberOpt.isEmpty()) {
            return null; // User not found
        }

        AccountMember member = accountMemberOpt.get();
        
        // CRITICAL FIX: Check password before allowing login
        if (passwordEncoder.matches(loginRequest.getPassword(), member.getPassword())) {
            return member; // Password correct - login successful
        } else {
            return null; // Password incorrect - login failed
        }
    }

    @Override
    public AccountMember findById(String id) {
        return accountMemberRepos.findAccountMemberById(id).orElse(null);
    }

    @Override
    public void initiatePasswordReset(String email) {
        AccountMember member = accountMemberRepos.findAccountMemberByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with this email"));
        // Delete any existing token
        passwordResetTokenRepos.deleteByAccountMemberId(member.getId());

        // Generate new token
        String token = UUID.randomUUID().toString();

        // Save token
        PasswordResetToken passwordResetToken = new PasswordResetToken();
        passwordResetToken.setToken(token);
        passwordResetToken.setAccountMember(member);
        passwordResetToken.setExpiryDate(new Date(System.currentTimeMillis() + 24 * 60 * 60 * 1000)); // 24 hours
        passwordResetTokenRepos.save(passwordResetToken);

        // Send email
        sendPasswordResetEmail(member.getEmail(), token);

    }

    @Override
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepos.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid password reset token"));

        if (resetToken.getExpiryDate().before(new Date())) {
            passwordResetTokenRepos.delete(resetToken);
            throw new RuntimeException("Password reset token has expired");
        }

        AccountMember member = resetToken.getAccountMember();
        member.setPassword(passwordEncoder.encode(newPassword));
        accountMemberRepos.save(member);
        passwordResetTokenRepos.delete(resetToken);
    }

    private void sendPasswordResetEmail(String email, String token) {
        try {
            // Use RestTemplate to call Resend API directly
            RestTemplate restTemplate = new RestTemplate();

            // Resend API endpoint
            String url = "https://api.resend.com/emails";

            // Create headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth("re_JaaxEqc2_ENsdrTtK5JjenVDkVSYhmpbr");

            // Create email body
            String emailBody = String.format("""
            {
                "from": "Medical System <onboarding@resend.dev>",
                "to": ["%s"],
                "subject": "Reset Your Password",
                "html": "<h2>Password Reset Request</h2><p>Click the button below to reset your password:</p><a href='%s/reset-password?token=%s' style='background-color: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px;'>Reset Password</a><p>This link will expire in 24 hours.</p><p>If you didn't request this, please ignore this email.</p>"
            }
            """, email, frontendUrl, token);

            // Create HTTP entity
            HttpEntity<String> request = new HttpEntity<>(emailBody, headers);

            // Send request
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                System.out.println("Email sent successfully: " + response.getBody());
            } else {
                throw new RuntimeException("Failed to send email: " + response.getStatusCode());
            }

        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
            e.printStackTrace();
            // Don't throw exception - let password reset continue even if email fails
        }
    }

}
