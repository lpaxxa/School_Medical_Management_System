package com.fpt.medically_be.service.impl;

import com.fpt.medically_be.dto.request.AccountUpdateRequestDTO;
import com.fpt.medically_be.dto.response.AccountAdminResponseDTO;
import com.fpt.medically_be.entity.AccountMember;
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

        AccountMember member = memberRepos.findAccountMemberById(id).orElseThrow(() -> new RuntimeException("Member not found with id: " + id));

        return accountMemberMapper.memberToMemberDTO(member);
    }

    @Override
    public List<AccountAdminResponseDTO> getAllMember() {

        return memberRepos.findAll()
                .stream()
                .map(accountMemberMapper::memberToMemberDTO)
                .toList();
    }

    @Override
    public AccountAdminResponseDTO createMember(AccountMember obj) {
        return null;
    }

    @Override
    public AccountAdminResponseDTO updateMember(String id, AccountUpdateRequestDTO obj) {

        AccountMember member = memberRepos.findAccountMemberById(id)
                .orElseThrow(() -> new RuntimeException("Member not found with id: " + id));


        member.setPassword(passwordEncoder.encode(obj.getPassword()));

        if (obj.getPassword() != null && !obj.getPassword().isEmpty()) {
            member.setPassword(passwordEncoder.encode(obj.getPassword()));
        }

        switch (member.getRole()) {
            case PARENT:
                parentRepository.findByAccountId(id).ifPresent(parent -> {
                    parent.setEmail(member.getEmail());
                    parent.setPhoneNumber(member.getPhoneNumber());
                    parentRepository.save(parent);
                });
                break;
            case NURSE:
                nurseRepository.findByAccountId(id).ifPresent(nurse -> {
                    nurse.setEmail(member.getEmail());
                    nurse.setPhoneNumber(member.getPhoneNumber());
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
    public void deleteMember(String id) {

        AccountMember member = memberRepos.findAccountMemberById(id).orElseThrow(() -> new RuntimeException("Member not found with id: " + id));

        String role = member.getRole().name();

        switch (role) {
            case "ADMIN":
                memberRepos.delete(member);
                break;
            case "NURSE":
                nurseRepository.findByAccountId(id)
                        .ifPresent(nurseRepository::delete);
                memberRepos.delete(member);
                break;
            case "PARENT":
                parentRepository.findByAccountId(id)
                        .ifPresent(parentRepository::delete);
                memberRepos.delete(member);
                break;
            default:
                throw new RuntimeException("Role not found !!");
        }

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
