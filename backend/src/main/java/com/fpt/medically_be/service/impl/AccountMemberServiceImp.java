package com.fpt.medically_be.service.impl;

import com.fpt.medically_be.dto.request.AccountUpdateRequestDTO;
import com.fpt.medically_be.dto.response.AccountAdminResponseDTO;
import com.fpt.medically_be.entity.AccountMember;
import com.fpt.medically_be.entity.Nurse;
import com.fpt.medically_be.entity.Parent;
import com.fpt.medically_be.mapper.AccountMemberMapper;
import com.fpt.medically_be.repos.AccountMemberRepos;
import com.fpt.medically_be.repos.NurseRepository;
import com.fpt.medically_be.repos.ParentRepository;
import com.fpt.medically_be.service.AccountMemberService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AccountMemberServiceImp implements AccountMemberService {
    @Autowired
    AccountMemberRepos memberRepos;
    @Autowired
    AccountMemberMapper accountMemberMapper;
    @Autowired
    NurseRepository nurseRepository;
    @Autowired
    ParentRepository parentRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Override
    public AccountAdminResponseDTO getMemberById(String id) {

        AccountMember member = memberRepos.findAccountMemberByIdAndIsActiveTrue(id).orElseThrow(() -> new RuntimeException("Member not found with id: " + id));

        AccountAdminResponseDTO dto = accountMemberMapper.memberToMemberDTO(member);
        
        // Populate role-specific fields
        populateRoleSpecificFields(dto, member);
        
        return dto;
    }

    @Override
    public List<AccountAdminResponseDTO> getAllMember() {

        return memberRepos.findAll()
                .stream()
                .map(member -> {
                    AccountAdminResponseDTO dto = accountMemberMapper.memberToMemberDTO(member);
                    populateRoleSpecificFields(dto, member);
                    return dto;
                })
                .toList();
    }

    @Override
    public AccountAdminResponseDTO createMember(AccountMember obj) {
        return null;
    }

    @Transactional
    @Override
    public AccountAdminResponseDTO updateMember(String id, AccountUpdateRequestDTO obj) {

        AccountMember member = memberRepos.findAccountMemberByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new RuntimeException("Member not found with id: " + id));

        // Optional: Prevent updating deactivated account
        if (member.getIsActive() != null && !member.getIsActive()) {
            throw new RuntimeException("This member is deactivated.");
        }

        // Update basic AccountMember fields (available for all roles)
        if (obj.getPassword() != null && !obj.getPassword().isEmpty()) {
            member.setPassword(passwordEncoder.encode(obj.getPassword()));
        }

        if (obj.getEmail() != null) {
            member.setEmail(obj.getEmail());
        }

        if (obj.getPhoneNumber() != null) {
            member.setPhoneNumber(obj.getPhoneNumber());
        }

        // Update role-specific profile fields
        switch (member.getRole()) {
            case PARENT:
                // PARENT can update: email, phoneNumber, fullName, address, relationshipType, occupation
                Parent parent = parentRepository.findByAccount_Id(id)
                        .orElseThrow(() -> new RuntimeException("Parent profile not found for account id: " + id));
                
                if (obj.getEmail() != null) {
                    parent.setEmail(obj.getEmail());
                }
                if (obj.getPhoneNumber() != null) {
                    parent.setPhoneNumber(obj.getPhoneNumber());
                }
                if (obj.getFullName() != null) {
                    parent.setFullName(obj.getFullName());
                }
                if (obj.getAddress() != null) {
                    parent.setAddress(obj.getAddress());
                }
                if (obj.getRelationshipType() != null) {
                    parent.setRelationshipType(obj.getRelationshipType());
                }
                if (obj.getOccupation() != null) {
                    parent.setOccupation(obj.getOccupation());
                }
                parentRepository.save(parent);
                break;

            case NURSE:
                // NURSE can update: email, phoneNumber, fullName, qualification
                Nurse nurse = nurseRepository.findByAccount_Id(id)
                        .orElseThrow(() -> new RuntimeException("Nurse profile not found for account id: " + id));
                
                if (obj.getEmail() != null) {
                    nurse.setEmail(obj.getEmail());
                }
                if (obj.getPhoneNumber() != null) {
                    nurse.setPhoneNumber(obj.getPhoneNumber());
                }
                if (obj.getFullName() != null) {
                    nurse.setFullName(obj.getFullName());
                }
                if (obj.getQualification() != null) {
                    nurse.setQualification(obj.getQualification());
                }
                nurseRepository.save(nurse);
                break;

            case ADMIN:
                // ADMIN can only update basic AccountMember fields: email, password, phoneNumber
                // Admin doesn't have a separate profile table, only uses AccountMember entity
                // If fullName is needed for Admin, consider adding it to AccountMember entity
                // or creating a separate Admin profile entity
                break;

            default:
                // Handle any other roles that might be added in the future
                break;
        }

        AccountMember saved = memberRepos.save(member);
        AccountAdminResponseDTO dto = accountMemberMapper.memberToMemberDTO(saved);
        
        // Populate role-specific fields in response
        populateRoleSpecificFields(dto, saved);
        
        return dto;
    }


    @Transactional
    @Override
    public void deactivateMember(String id) {
        AccountMember member = memberRepos.findAccountMemberByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new RuntimeException("Member not found with id: " + id));

        if (Boolean.FALSE.equals(member.getIsActive())) {
            throw new RuntimeException("Member is already deactivated.");
        }

        member.setIsActive(false);
        memberRepos.save(member);
    }

    @Override
    public List<AccountAdminResponseDTO> getAllMemberToSendEmail() {
        List<AccountMember> members = memberRepos.findAllByIsActiveTrueAndEmailSent(false);
        return members.stream()
                .map(accountMemberMapper::memberToMemberDTO)
                .toList();
    }

    @Override
    public void updateAccountActiveStatus(String id, boolean isActive) {
        AccountMember member = memberRepos.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy thành viên với ID: " + id));

        // Update the active status of the member
        if (isActive) {
            // If activating, ensure the member was previously
            if (Boolean.TRUE.equals(member.getIsActive())) {
                throw new RuntimeException("Member is already active.");
            }
        } else {
            // If deactivating, ensure the member was previously active
            if (Boolean.FALSE.equals(member.getIsActive())) {
                throw new RuntimeException("Member is already inactive.");
            }
        }
        member.setIsActive(isActive);
        memberRepos.save(member);


    }

    // Helper method to populate role-specific fields
    private void populateRoleSpecificFields(AccountAdminResponseDTO dto, AccountMember member) {
        if (member.getRole() == null) {
            return;
        }
        
        switch (member.getRole()) {
            case PARENT:
                parentRepository.findByAccount_Id(member.getId()).ifPresent(parent -> {
                    dto.setFullName(parent.getFullName());
                    dto.setAddress(parent.getAddress());
                    dto.setRelationshipType(parent.getRelationshipType());
                    dto.setOccupation(parent.getOccupation());
                });
                break;
                
            case NURSE:
                nurseRepository.findByAccount_Id(member.getId()).ifPresent(nurse -> {
                    dto.setFullName(nurse.getFullName());
                    dto.setQualification(nurse.getQualification());
                });
                break;
                
            case ADMIN:
                // Admin doesn't have additional profile fields
                break;
                
            default:
                // Handle other roles if needed
                break;
        }
    }

    // Removed duplicate registration methods - use AuthService.registerMember() instead
    // The previous updateParent, updateNurse, and updateAdmin methods were incorrectly
    // named and duplicated functionality that already exists in AuthService
}
