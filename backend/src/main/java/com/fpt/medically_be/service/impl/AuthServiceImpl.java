package com.fpt.medically_be.service.impl;

import com.fpt.medically_be.dto.auth.AuthResponseDTO;
import com.fpt.medically_be.dto.auth.LoginRequestDTO;
import com.fpt.medically_be.dto.request.NurseRegistrationRequestDTO;
import com.fpt.medically_be.dto.request.ParentRegistrationRequestDTO;
import com.fpt.medically_be.entity.AccountMember;
import com.fpt.medically_be.entity.HealthProfile;
import com.fpt.medically_be.entity.Nurse;
import com.fpt.medically_be.entity.Parent;
import com.fpt.medically_be.entity.PasswordResetToken;
import com.fpt.medically_be.entity.Student;
import com.fpt.medically_be.repos.AccountMemberRepos;
import com.fpt.medically_be.repos.HealthProfileRepository;
import com.fpt.medically_be.repos.NurseRepository;
import com.fpt.medically_be.repos.ParentRepository;
import com.fpt.medically_be.repos.PasswordResetTokenRepos;
import com.fpt.medically_be.repos.StudentRepository;
import com.fpt.medically_be.service.AuthService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fpt.medically_be.entity.MemberRole;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private final AccountMemberRepos accountMemberRepos;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetTokenRepos passwordResetTokenRepos;
    private final JwtServiceImpl jwtServiceImpl;
    private final NurseRepository nurseRepository;
    private final ParentRepository parentRepository;
    private final StudentRepository studentRepository;
    private final HealthProfileRepository healthProfileRepository;

    @Value("${frontend.url}")
    private String frontendUrl;

    @Override
    public AccountMember login(LoginRequestDTO loginRequest) {
        // Find user by email or username
        Optional<AccountMember> accountMemberOpt = accountMemberRepos.findAccountMemberByPhoneNumberAndPassword(
                loginRequest.getUsername(),
                loginRequest.getPassword()
        );

        if (accountMemberOpt.isEmpty()) {
            accountMemberOpt = accountMemberRepos.findAccountMemberByEmail(
                    loginRequest.getUsername()

            );
        }
        if (accountMemberOpt.isEmpty()) {
            accountMemberOpt = accountMemberRepos.findAccountMemberByUsernameAndPassword(
                    loginRequest.getUsername(),
                    loginRequest.getPassword()


            );
        }
        if(accountMemberOpt.isPresent()) {
            AccountMember member = accountMemberOpt.get();
            return member;
        }


        
        // CRITICAL FIX: Check password before allowing login
//        if (passwordEncoder.matches(loginRequest.getPassword(), member.getPassword())) {
//            return member; // Password correct - login successful
//        } else {
//            return null; // Password incorrect - login failed
//        }
        return null;
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

    @Override
    public AccountMember processOAuth2Callback(String code, String state) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        
        if(auth instanceof OAuth2AuthenticationToken){
            OAuth2AuthenticationToken token = (OAuth2AuthenticationToken) auth;
            OAuth2User oauth2User = token.getPrincipal();
            String email = oauth2User.getAttribute("email");
            System.out.println("DEBUG: OAuth2 email: " + email);
            
            Optional<AccountMember> existingUser = accountMemberRepos.findAccountMemberByEmail(email);
            if (existingUser.isPresent()) {
                System.out.println("DEBUG: Found existing user: " + existingUser.get().getEmail());
                return existingUser.get();
            } else {
                System.out.println("DEBUG: No user found for email: " + email);
                return null;
            }
        } else {
            System.out.println("DEBUG: Not an OAuth2AuthenticationToken");
            return null;
        }
    }

    @Override
    @Transactional
    public AuthResponseDTO registerParent(ParentRegistrationRequestDTO parentRegistrationRequestDTO) {
        if(accountMemberRepos.findByEmail(parentRegistrationRequestDTO.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        } else if (accountMemberRepos.findByPhoneNumber(parentRegistrationRequestDTO.getEmergencyPhoneNumber()).isPresent()) {
            throw new RuntimeException("Phone number already exists");
        }
        
        // Create AccountMember
        AccountMember member = new AccountMember();
        member.setId(generateCustomId(MemberRole.PARENT));
        member.setEmail(parentRegistrationRequestDTO.getEmail());
        member.setPhoneNumber(parentRegistrationRequestDTO.getEmergencyPhoneNumber());
        member.setUsername(generateUsername(parentRegistrationRequestDTO.getFullName()));
       // member.setPassword(passwordEncoder.encode(parentRegistrationRequestDTO.getPassword()));
        member.setPassword(parentRegistrationRequestDTO.getPassword());
        member.setRole(MemberRole.PARENT);
        member = accountMemberRepos.save(member);
        
        // Create Parent profile
        Parent parent = new Parent();
        parent.setFullName(parentRegistrationRequestDTO.getFullName());
        parent.setEmail(parentRegistrationRequestDTO.getEmail());
        parent.setOccupation(parentRegistrationRequestDTO.getOccupation());
        parent.setPhoneNumber(parentRegistrationRequestDTO.getEmergencyPhoneNumber());
        parent.setAddress(parentRegistrationRequestDTO.getAddress());
        parent.setRelationshipType(parentRegistrationRequestDTO.getRelationshipType());
        parent.setAccount(member);
        parent = parentRepository.save(parent);
        
        // Create students if provided
        if (parentRegistrationRequestDTO.getStudents() != null && !parentRegistrationRequestDTO.getStudents().isEmpty()) {
            createStudentsForParent(parent, parentRegistrationRequestDTO.getStudents());
        }
        
        String token = jwtServiceImpl.generateToken(
                member.getId(),
                member.getEmail(),
                member.getPhoneNumber(),
                member.getRole()
        );
        AuthResponseDTO authResponseDTO = new AuthResponseDTO();
        authResponseDTO.setMemberId(member.getId());
        authResponseDTO.setEmail(member.getEmail());
        authResponseDTO.setPhoneNumber(member.getPhoneNumber());
        authResponseDTO.setRole(member.getRole().name());
        authResponseDTO.setToken(token);
        return authResponseDTO;
    }

    @Override
    public AuthResponseDTO registerNurse(NurseRegistrationRequestDTO nurseRegistrationRequestDTO) {
        if(accountMemberRepos.findByEmail(nurseRegistrationRequestDTO.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        } else if (accountMemberRepos.findByPhoneNumber(nurseRegistrationRequestDTO.getPhoneNumber()).isPresent()) {
            throw new RuntimeException("Phone number already exists");
        }
        
        // Create AccountMember
        AccountMember member = new AccountMember();
        member.setId(generateCustomId(MemberRole.NURSE));
        member.setEmail(nurseRegistrationRequestDTO.getEmail());
        member.setPhoneNumber(nurseRegistrationRequestDTO.getPhoneNumber());
        member.setUsername(generateUsername(nurseRegistrationRequestDTO.getFullName()));
        // member.setPassword(passwordEncoder.encode(parentRegistrationRequestDTO.getPassword()));
        member.setPassword(nurseRegistrationRequestDTO.getPassword());
        member.setRole(MemberRole.NURSE);
        member = accountMemberRepos.save(member);
        
        // Create Nurse profile
        Nurse nurse = new Nurse();
        nurse.setFullName(nurseRegistrationRequestDTO.getFullName());
        nurse.setEmail(nurseRegistrationRequestDTO.getEmail());
        nurse.setPhoneNumber(nurseRegistrationRequestDTO.getPhoneNumber());
        nurse.setQualification(nurseRegistrationRequestDTO.getQualification());
        nurse.setAccount(member);
        nurseRepository.save(nurse);
        
        String token = jwtServiceImpl.generateToken(
                member.getId(),
                member.getEmail(),
                member.getPhoneNumber(),
                member.getRole()
        );
        AuthResponseDTO authResponseDTO = new AuthResponseDTO();
        authResponseDTO.setMemberId(member.getId());
        authResponseDTO.setEmail(member.getEmail());
        authResponseDTO.setPhoneNumber(member.getPhoneNumber());
        authResponseDTO.setRole(member.getRole().name());
        authResponseDTO.setToken(token);
        return authResponseDTO;
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

    public String generateUsername(String fullName) {
        String noAccent = java.text.Normalizer.normalize(fullName, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{M}", ""); // loại bỏ dấu

        String[] parts = noAccent.toLowerCase().replaceAll("[^a-z0-9 ]", "").trim().split("\\s+");

        if (parts.length >= 2) {
            return parts[parts.length - 1] + parts[0]; // tên + họ
        } else if (parts.length == 1) {
            return parts[0];
        }
        return "user";
    }

    private String generateCustomId(MemberRole role) {
        String prefix;
        switch (role) {
            case NURSE:
                prefix = "NU";
                break;
            case PARENT:
                prefix = "PA";
                break;
            case ADMIN:
                prefix = "AD";
                break;
            default:
                prefix = "US";
        }


        // Generate 3-digit suffix: 2 from timestamp + 1 random
        int timestampPart = (int)(System.currentTimeMillis() % 100); // Last 2 digits of timestamp
        int randomPart = (int)(Math.random() * 10); // Random 1-digit number

        return String.format("%s%02d%01d", prefix, timestampPart, randomPart);
    }
    
    private void createStudentsForParent(Parent parent, List<ParentRegistrationRequestDTO.StudentRegistrationInfo> studentInfos) {
        for (ParentRegistrationRequestDTO.StudentRegistrationInfo studentInfo : studentInfos) {
            // Create HealthProfile first
            HealthProfile healthProfile = new HealthProfile();
            healthProfile = healthProfileRepository.save(healthProfile);
            
            // Create Student
            Student student = new Student();
            student.setFullName(studentInfo.getFullName());
            student.setDateOfBirth(studentInfo.getDateOfBirth());
            student.setGender(studentInfo.getGender());
            student.setStudentId(studentInfo.getStudentId());
            student.setClassName(studentInfo.getClassName());
            student.setGradeLevel(studentInfo.getGradeLevel());
            student.setSchoolYear(studentInfo.getSchoolYear());
            student.setParent(parent);
            student.setHealthProfile(healthProfile);
            
            studentRepository.save(student);
        }
    }

}
