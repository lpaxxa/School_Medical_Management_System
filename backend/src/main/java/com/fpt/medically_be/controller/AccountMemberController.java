package com.fpt.medically_be.controller;

import com.fpt.medically_be.dto.request.AccountUpdateRequestDTO;
import com.fpt.medically_be.dto.response.AccountAdminResponseDTO;
import com.fpt.medically_be.service.AccountMemberService;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/account-members")
public class AccountMemberController {

    @Autowired
    AccountMemberService accountMemberService;

    @Operation(summary = "Get all members", description = "lấy danh sách tất cả thành viên")
    @GetMapping("/getAll")
    public ResponseEntity<?> getAllMembers() {
        return ResponseEntity.ok(accountMemberService.getAllMember());
    }


    @Operation(summary = "Get member by ID", description = "lấy thông tin thành viên theo ID")
    @GetMapping("/{id}")
    public ResponseEntity<AccountAdminResponseDTO> getMemberById(@PathVariable("id") String id) {

        AccountAdminResponseDTO memberResponseDTO = accountMemberService.getMemberById(id);

        if (memberResponseDTO == null) {
            return ResponseEntity.notFound().build();
        }else{
            return ResponseEntity.ok(memberResponseDTO);
        }

    }

    @Operation(summary = "Update member", description = "Cập nhật thông tin thành viên")
    @PutMapping("/update/{id}")
    public ResponseEntity<AccountAdminResponseDTO> updateMember(@PathVariable("id") String id,
                                                                @RequestBody AccountUpdateRequestDTO accountUpdateRequestDTO) {
        try {
            AccountAdminResponseDTO updatedMember = accountMemberService.updateMember(id, accountUpdateRequestDTO);
            return ResponseEntity.ok(updatedMember);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }


    @Operation(summary = "Delete member,not yet implement", description = "Xoá thành viên theo ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMember(@PathVariable("id") String id) {
        try {
            accountMemberService.deleteMember(id);
            return ResponseEntity.ok("Member deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting member: " + e.getMessage());
        }
    }





}
