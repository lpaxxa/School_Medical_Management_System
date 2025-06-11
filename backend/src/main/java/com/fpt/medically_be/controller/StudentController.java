package com.fpt.medically_be.controller;

import com.fpt.medically_be.dto.StudentDTO;
import com.fpt.medically_be.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService studentService;

    @Autowired
    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping
//    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE') or hasRole('PARENT')")
    public ResponseEntity<List<StudentDTO>> getAllStudents() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    @GetMapping("/{id}")
//    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE') or hasRole('PARENT')")
    public ResponseEntity<StudentDTO> getStudentById(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getStudentById(id));
    }

    @GetMapping("/student-id/{studentId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE') or hasRole('PARENT')")
    public ResponseEntity<StudentDTO> getStudentByStudentId(@PathVariable Long studentId) {
        return ResponseEntity.ok(studentService.getStudentByStudentId(studentId));
    }

    @GetMapping("/class/{className}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    public ResponseEntity<List<StudentDTO>> getStudentsByClass(@PathVariable String className) {
        return ResponseEntity.ok(studentService.getStudentsByClass(className));
    }

    @GetMapping("/grade/{gradeLevel}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    public ResponseEntity<List<StudentDTO>> getStudentsByGradeLevel(@PathVariable String gradeLevel) {
        return ResponseEntity.ok(studentService.getStudentsByGradeLevel(gradeLevel));
    }

    @GetMapping("/parent/{parentId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE') or hasRole('PARENT')")
    public ResponseEntity<List<StudentDTO>> getStudentsByParentId(@PathVariable Long parentId) {
        return ResponseEntity.ok(studentService.getStudentsByParentId(parentId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    public ResponseEntity<StudentDTO> createStudent(@RequestBody StudentDTO studentDTO) {
        return ResponseEntity.ok(studentService.createStudent(studentDTO));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')")
    public ResponseEntity<StudentDTO> updateStudent(@PathVariable Long id, @RequestBody StudentDTO studentDTO) {
        return ResponseEntity.ok(studentService.updateStudent(id, studentDTO));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }

}
