package com.fpt.medically_be.controller;



import com.fpt.medically_be.dto.StudentDTO;
import com.fpt.medically_be.dto.response.ParentDTO;
import com.fpt.medically_be.service.ParentService;
import com.fpt.medically_be.service.StudentService;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/parents")
public class ParentController {

    private final ParentService parentService;
    private final StudentService studentService;

    @Autowired
    public ParentController(ParentService parentService, StudentService studentService) {
        this.parentService = parentService;
        this.studentService = studentService;
    }

    @GetMapping
//    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    public ResponseEntity<List<ParentDTO>> getAllParents() {
        return ResponseEntity.ok(parentService.getAllParents());
    }

    @GetMapping("/{id}")
//    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE') or hasRole('PARENT')")
    public ResponseEntity<ParentDTO> getParentById(@PathVariable Long id) {
        return ResponseEntity.ok(parentService.getParentById(id));
    }

    @GetMapping("/email/{email}")
//    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    public ResponseEntity<ParentDTO> getParentByEmail(@PathVariable String email) {
        return ResponseEntity.ok(parentService.getParentByEmail(email));
    }

    @GetMapping("/phone/{phoneNumber}")
//    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    public ResponseEntity<ParentDTO> getParentByPhoneNumber(@PathVariable String phoneNumber) {
        return ResponseEntity.ok(parentService.getParentByPhoneNumber(phoneNumber));
    }

    @GetMapping("/account/{accountId}")
//    @PreAuthorize("hasRole('ADMIN') or hasRole('PARENT')")
    public ResponseEntity<ParentDTO> getParentByAccountId(@PathVariable String accountId) {
        return ResponseEntity.ok(parentService.getParentByAccountId(accountId));
    }



    @GetMapping("/my-students")
    @PreAuthorize("hasRole('PARENT')")
    @Operation(summary = "Lấy danh sách học sinh của phụ huynh hiện tại (dựa trên tài khoản đăng nhập)")
    public ResponseEntity<List<StudentDTO>> getCurrentParentStudents(Authentication authentication) {

        String accountId = authentication.getName(); // Lấy memberId từ token
        ParentDTO parent = parentService.getParentByAccountId(accountId);
        return ResponseEntity.ok(studentService.getStudentsByParentId(parent.getId()));
    }



//    @GetMapping("/{parentId}/students")
//    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE') or (hasRole('PARENT') and #parentId.toString() == authentication.name)")
//    @Operation(summary = "Lấy danh sách học sinh của một phụ huynh cụ thể theo ID, riêng phụ huynh chỉ được lấy danh sách con của chính họ")
//    public ResponseEntity<List<StudentDTO>> getParentStudents(@PathVariable Long parentId) {
//        return ResponseEntity.ok(studentService.getStudentsByParentId(parentId));
//    }


    @PostMapping
//    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ParentDTO> createParent(@RequestBody ParentDTO parentDTO) {
        return ResponseEntity.ok(parentService.createParent(parentDTO));
    }

    @PutMapping("/{id}")
//    @PreAuthorize("hasRole('ADMIN') or hasRole('PARENT')")
    public ResponseEntity<ParentDTO> updateParent(@PathVariable Long id, @RequestBody ParentDTO parentDTO) {
        return ResponseEntity.ok(parentService.updateParent(id, parentDTO));
    }

    @DeleteMapping("/{id}")
//    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteParent(@PathVariable Long id) {
        parentService.deleteParent(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{parentId}/link-existing-students")
//    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> linkExistingStudentsToParent(
            @PathVariable Long parentId, 
            @RequestBody List<Long> studentIds) {
        try {
            parentService.linkStudentsToParent(parentId, studentIds);
            return ResponseEntity.ok("Students successfully linked to parent");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to link students: " + e.getMessage());
        }
    }
}
