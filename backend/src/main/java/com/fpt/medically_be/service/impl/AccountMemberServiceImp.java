package com.fpt.medically_be.service.impl;

import com.fpt.medically_be.dto.request.AccountUpdateRequestDTO;
import com.fpt.medically_be.dto.response.AccountAdminResponseDTO;
import com.fpt.medically_be.entity.AccountMember;
import com.fpt.medically_be.entity.MemberRole;
import com.fpt.medically_be.mapper.AccountMemberMapper;
import com.fpt.medically_be.repos.AccountMemberRepos;
import com.fpt.medically_be.repos.NurseRepository;
import com.fpt.medically_be.repos.ParentRepository;
import com.fpt.medically_be.service.AccountMemberService;
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

        return accountMemberMapper.memberToMemberDTO(member);
    }

    @Override
    public List<AccountAdminResponseDTO> getAllMember() {

        return memberRepos.findAllByIsActiveTrue()
                .stream()
                .map(accountMemberMapper::memberToMemberDTO)
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

        if (obj.getPassword() != null && !obj.getPassword().isEmpty()) {
            member.setPassword(passwordEncoder.encode(obj.getPassword()));
        }

        if (obj.getEmail() != null) {
            member.setEmail(obj.getEmail());
        }

        if (obj.getPhoneNumber() != null) {
            member.setPhoneNumber(obj.getPhoneNumber());
        }

        //nếu muốn update role, thì qua AccountUpdateRequestDTO thêm role
//        if (obj.getRole() != null) {
//            try {
//                MemberRole newRole = MemberRole.valueOf(obj.getRole().toUpperCase());
//                member.setRole(newRole);
//            } catch (IllegalArgumentException e) {
//                throw new RuntimeException("Invalid role value: " + obj.getRole());
//            }
//        }


        switch (member.getRole()) {
            case PARENT:
                parentRepository.findByAccountId(id).ifPresent(parent -> {
                    if (obj.getEmail() != null) {
                        parent.setEmail(obj.getEmail());
                    }
                    if (obj.getPhoneNumber() != null) {
                        parent.setPhoneNumber(obj.getPhoneNumber());
                    }
                    parentRepository.save(parent);
                });
                break;

            case NURSE:
                nurseRepository.findByAccountId(id).ifPresent(nurse -> {
                    if (obj.getEmail() != null) {
                        nurse.setEmail(obj.getEmail());
                    }
                    if (obj.getPhoneNumber() != null) {
                        nurse.setPhoneNumber(obj.getPhoneNumber());
                    }
                    nurseRepository.save(nurse);
                });
                break;

            default:
                break;
        }

        AccountMember saved = memberRepos.save(member);
        return accountMemberMapper.memberToMemberDTO(saved);
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






//    @Transactional
//    public void deleteAccountMember(String accountId) {
//        AccountMember member = memberRepos.findAccountMemberById(accountId)
//                .orElseThrow(() -> new RuntimeException("Member not found with id: " + accountId));
//
//        switch (member.getRole()) {
//            case NURSE:
//                Nurse nurse = nurseRepository.findByAccountId(accountId)
//                        .orElseThrow(() -> new RuntimeException("Nurse not found for account: " + accountId));
//                // 1. Set null hoặc xóa tất cả MedicalCheckup liên quan
//                List<MedicalCheckup> checkups = medicalCheckupRepository.findByMedicalStaff(nurse);
//                for (MedicalCheckup checkup : checkups) {
//                    checkup.setMedicalStaff(null); // hoặc medicalCheckupRepository.delete(checkup);
//                }
//                medicalCheckupRepository.saveAll(checkups);
//                // 2. Xóa nurse
//                nurseRepository.delete(nurse);
//                break;
//            case PARENT:
//                Parent parent = parentRepository.findByAccountId(accountId)
//                        .orElseThrow(() -> new RuntimeException("Parent not found for account: " + accountId));
//                // 1. Xử lý các NotificationRecipients liên quan
//                List<NotificationRecipients> notis = notificationRecipientsRepository.findByReceiver(parent);
//                notificationRecipientsRepository.deleteAll(notis);
//                // 2. Xử lý các Student liên quan (nếu muốn)
//                List<Student> students = studentRepository.findByParent(parent);
//                for (Student s : students) {
//                    s.setParent(null); // hoặc studentRepository.delete(s);
//                }
//                studentRepository.saveAll(students);
//                // 3. Xóa parent
//                parentRepository.delete(parent);
//                break;
//            // ... các role khác tương tự
//            default:
//                // Xử lý role khác nếu có
//        }
//        // 4. Xóa AccountMember cuối cùng
//        memberRepos.delete(member);
//    }
}
