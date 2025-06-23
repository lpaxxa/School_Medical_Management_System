package com.fpt.medically_be.service.impl;

import com.fpt.medically_be.dto.auth.AuthResponseDTO;
import com.fpt.medically_be.dto.auth.LoginRequestDTO;
import com.fpt.medically_be.dto.request.NurseRegistrationRequestDTO;
import com.fpt.medically_be.dto.request.ParentRegistrationRequestDTO;
import com.fpt.medically_be.entity.AccountMember;
import com.fpt.medically_be.entity.HealthProfile;
import com.fpt.medically_be.entity.Nurse;
import com.fpt.medically_be.entity.Parent;
import com.fpt.medically_be.entity.Student;
import com.fpt.medically_be.entity.MemberRole;
import com.fpt.medically_be.repos.AccountMemberRepos;
import com.fpt.medically_be.repos.HealthProfileRepository;
import com.fpt.medically_be.repos.NurseRepository;
import com.fpt.medically_be.repos.ParentRepository;
import com.fpt.medically_be.repos.StudentRepository;
import com.fpt.medically_be.service.AuthService;
import com.fpt.medically_be.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private final AccountMemberRepos accountMemberRepos;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final NurseRepository nurseRepository;
    private final ParentRepository parentRepository;
    private final StudentRepository studentRepository;
    private final HealthProfileRepository healthProfileRepository;
    private static final Logger logger = LoggerFactory.getLogger(AuthServiceImpl.class);

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
            accountMemberOpt = accountMemberRepos.findAccountMemberByEmailAndPassword(
                    loginRequest.getUsername(),
                    loginRequest.getPassword()

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
        return null;
    }

    @Override
    public AccountMember findById(String id) {
        return accountMemberRepos.findAccountMemberById(id).orElse(null);
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
        
        String token = jwtService.generateToken(
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
        
        String token = jwtService.generateToken(
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
    public AccountMember processOAuth2Callback(String code, String state) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (auth instanceof OAuth2AuthenticationToken) {
            OAuth2AuthenticationToken token = (OAuth2AuthenticationToken) auth;
            OAuth2User oauth2User = token.getPrincipal();
            String email = oauth2User.getAttribute("email");
            String name = oauth2User.getAttribute("name");
            
            logger.info("OAuth2 email: " + email);
            logger.info("OAuth2 name: " + name);
            
            // Only allow login for existing users (accounts created by admin)
            Optional<AccountMember> existingUser = accountMemberRepos.findAccountMemberByEmail(email);
            if (existingUser.isPresent()) {
                logger.info("Found existing user: " + existingUser.get().getEmail());
                return existingUser.get();
            } else {
                logger.info("No user found for email: " + email + ". User must be created by admin first.");
                return null;
            }
        } else {
            logger.warn("Not an OAuth2AuthenticationToken");
            return null;
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
