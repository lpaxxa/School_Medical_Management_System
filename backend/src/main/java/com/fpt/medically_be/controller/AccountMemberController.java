package com.fpt.medically_be.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fpt.medically_be.dto.request.AccountUpdateRequestDTO;
import com.fpt.medically_be.dto.request.NurseRegistrationRequestDTO;
import com.fpt.medically_be.dto.request.ParentRegistrationRequestDTO;
import com.fpt.medically_be.dto.request.RegistrationDTO;
import com.fpt.medically_be.dto.response.AccountAdminResponseDTO;
import com.fpt.medically_be.service.AccountMemberService;
import com.fpt.medically_be.service.AuthService;
import com.fpt.medically_be.service.JwtService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

import static com.fpt.medically_be.entity.MemberRole.*;

@RestController
@RequestMapping("/api/v1/account-members")
public class AccountMemberController {

    @Autowired
    AccountMemberService accountMemberService;

    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private AuthService authService;


    // pa
    @PostMapping("/addNewMember")
     // @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> register(@RequestBody Map<String, Object> requestData) {
        try {
            String role = (String) requestData.get("role");

            if (PARENT.name().equals(role)) {
                ParentRegistrationRequestDTO parentDTO = objectMapper.convertValue(requestData, ParentRegistrationRequestDTO.class);
                return ResponseEntity.ok(authService.registerParent(parentDTO));
            } else if (NURSE.name().equals(role)) {
                NurseRegistrationRequestDTO nurseDTO = objectMapper.convertValue(requestData, NurseRegistrationRequestDTO.class);
                return ResponseEntity.ok(authService.registerNurse(nurseDTO));
            } else if (ADMIN.name().equals(role)) {
                RegistrationDTO adminDTO = objectMapper.convertValue(requestData, RegistrationDTO.class);
                return ResponseEntity.ok(authService.registerAdmin(adminDTO));
            }
            else {
                return ResponseEntity.badRequest().body("Invalid role specified in registration request");
            }
        }catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    @Operation(summary = "Get all members", description = "lấy danh sách tất cả thành viên")
    @GetMapping("/getAll")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllMembers() {
        return ResponseEntity.ok(accountMemberService.getAllMember());
    }

    @Operation(summary = "Get all members", description = "lấy danh sách tất cả thành viên chưa gửi email")
    @GetMapping("/getAllToSendEmail")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllToSendEmail() {

        return ResponseEntity.ok(accountMemberService.getAllMemberToSendEmail());
    }


    @Operation(summary = "Get member by ID", description = "lấy thông tin thành viên theo ID")
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AccountAdminResponseDTO> getMemberById(@PathVariable("id") String id) {

        AccountAdminResponseDTO memberResponseDTO = accountMemberService.getMemberById(id);

        if (memberResponseDTO == null) {
            return ResponseEntity.notFound().build();
        }else{
            return ResponseEntity.ok(memberResponseDTO);
        }

    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AccountAdminResponseDTO> updateMember(@PathVariable("id") String id,
                                                                @Valid @RequestBody AccountUpdateRequestDTO accountUpdateRequestDTO) {
        AccountAdminResponseDTO updatedMember = accountMemberService.updateMember(id, accountUpdateRequestDTO);
        return ResponseEntity.ok(updatedMember);
    }


    @Operation(summary = "Delete member,not yet implement", description = "Xoá thành viên theo ID")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteMember(@PathVariable("id") String id) {
        try {
            accountMemberService.deactivateMember(id);
            return ResponseEntity.ok("Member deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting member: " + e.getMessage());
        }
    }





}
