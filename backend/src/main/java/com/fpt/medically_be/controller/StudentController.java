package com.fpt.medically_be.controller;

import com.fpt.medically_be.dto.StudentDTO;
import com.fpt.medically_be.service.CloudinaryService;
import com.fpt.medically_be.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/students")
public class StudentController {

    private final StudentService studentService;
    private final CloudinaryService cloudinaryService;

    @Autowired
    public StudentController(StudentService studentService, CloudinaryService cloudinaryService) {
        this.studentService = studentService;
        this.cloudinaryService = cloudinaryService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE') or hasRole('PARENT')")
    public ResponseEntity<List<StudentDTO>> getAllStudents() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE') or hasRole('PARENT')")
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

    @PostMapping(path = "/{id}/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    // @PreAuthorize("hasRole('ADMIN') or hasRole('NURSE')") // Disabled due to JWT authentication StackOverflowError
    public ResponseEntity<Map<String, Object>> uploadImage(
            @PathVariable Long id,
            @RequestParam("image") MultipartFile image) {
        try {
            System.out.println("=== STUDENT IMAGE UPLOAD DEBUG ===");
            System.out.println("Student ID: " + id);
            System.out.println("Image file name: " + (image != null ? image.getOriginalFilename() : "null"));
            System.out.println("Image size: " + (image != null ? image.getSize() : "null"));
            System.out.println("Image content type: " + (image != null ? image.getContentType() : "null"));
            System.out.println("Authentication: Bypassed due to permitAll configuration");
            
            if (image == null || image.isEmpty()) {
                System.out.println("ERROR: No image file provided");
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "No image file provided");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            System.out.println("Step 1: Getting student by ID...");
            // Lấy thông tin học sinh theo ID
            StudentDTO student = studentService.getStudentById(id);
            System.out.println("Step 1 SUCCESS: Found student: " + student.getFullName());

            System.out.println("Step 2: Checking for old image...");
            // Xóa ảnh cũ nếu có
            String oldImageUrl = student.getImageUrl();
            System.out.println("Old image URL: " + oldImageUrl);
            if (oldImageUrl != null && !oldImageUrl.isEmpty()) {
                try {
                    System.out.println("Step 2a: Deleting old image...");
                    // Trích xuất publicId từ URL Cloudinary
                    // Format URL: https://res.cloudinary.com/cloud-name/image/upload/v1234567890/folder/filename.jpg
                    // PublicId cần lấy: folder/filename (không bao gồm phiên bản và đuôi file)

                    // Tách URL theo "upload/"
                    String[] parts = oldImageUrl.split("upload/");
                    if (parts.length > 1) {
                        // Lấy phần sau "upload/"
                        String afterUpload = parts[1];

                        // Bỏ qua phiên bản (v1234567890/)
                        if (afterUpload.matches("v\\d+/.*")) {
                            afterUpload = afterUpload.replaceFirst("v\\d+/", "");
                        }

                        // Bỏ đuôi file (.jpg, .png, etc.)
                        String publicId = afterUpload;
                        if (publicId.contains(".")) {
                            publicId = publicId.substring(0, publicId.lastIndexOf("."));
                        }

                        System.out.println("Xóa ảnh cũ với publicId: " + publicId);
                        cloudinaryService.destroy(publicId);
                        System.out.println("Step 2a SUCCESS: Old image deleted");
                    }
                } catch (Exception e) {
                    System.err.println("Lỗi khi xóa ảnh cũ: " + e.getMessage());
                    e.printStackTrace();
                }
            } else {
                System.out.println("Step 2: No old image to delete");
            }

            System.out.println("Step 3: Uploading new image to Cloudinary...");
            // Tải lên ảnh mới lên Cloudinary
            Map uploadResult = cloudinaryService.upload(image);
            System.out.println("Step 3 SUCCESS: Image uploaded to Cloudinary");

            // Lấy URL và public_id từ kết quả tải lên
            String publicId = (String) uploadResult.get("public_id");
            String imageUrl = (String) uploadResult.get("secure_url");
            System.out.println("Step 4: Got Cloudinary response - URL: " + imageUrl + ", PublicID: " + publicId);

            // Cập nhật URL ảnh cho học sinh
            student.setImageUrl(imageUrl);
            System.out.println("Step 5: Updating student with new image URL...");
            StudentDTO updatedStudent = studentService.updateStudent(id, student);
            System.out.println("Step 5 SUCCESS: Student updated");

            // Trả về thông tin ảnh đã tải lên
            Map<String, Object> response = new HashMap<>();
            response.put("imageUrl", imageUrl);
            response.put("publicId", publicId);
            response.put("student", updatedStudent);

            System.out.println("=== UPLOAD SUCCESS ===");
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            System.err.println("IOException in uploadImage: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Không thể tải lên ảnh: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            System.err.println("Exception in uploadImage: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Lỗi server: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

}
