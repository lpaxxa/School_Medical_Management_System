package com.fpt.medically_be.service.impl;

import com.fpt.medically_be.entity.AccountMember;
import com.fpt.medically_be.entity.MedicalCheckup;
import com.fpt.medically_be.entity.Student;
import com.fpt.medically_be.entity.Parent;
import com.fpt.medically_be.repos.AccountMemberRepository;
import com.fpt.medically_be.repos.MedicalCheckupRepository;
import com.fpt.medically_be.dto.response.ParentHealthCheckupNotificationDTO;
import com.fpt.medically_be.service.AccountMemberService;
import com.fpt.medically_be.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.ArrayList;
import java.time.format.DateTimeFormatter;

@Service
public  class EmailServiceImpl implements EmailService {

    @Autowired
    private AccountMemberService accountMemberService;
    @Autowired
    private JavaMailSender javaMailSender;
    @Autowired
    private JavaMailSenderImpl mailSender;
    @Autowired
    private AccountMemberRepository accountMemberRepository;
    @Autowired
    private MedicalCheckupRepository medicalCheckupRepository;
    
    @Value("${spring.mail.username}")
    private String fromEmail;

    //    @Override
//    public void sendAccountInfoEmail(String memberId) {
//        AccountMember member = accountMemberRepository.findById(memberId)
//                .orElseThrow(() -> new RuntimeException("Không tìm thấy member"));
//        if (Boolean.TRUE.equals(member.getEmailSent())) {
//            throw new RuntimeException("Email đã được gửi trước đó!");
//        }
//        String subject = "Thông tin tài khoản đăng nhập";
//        String body = "Username: " + member.getUsername() + "\nPassword: " + member.getPassword();
//        sendSimpleEmail(member.getEmail(), subject, body);
//        member.setEmailSent(true);
//        accountMemberRepository.save(member);
//    }
    @Override
    public void sendAccountInfoEmail(String memberId) {
        AccountMember member = accountMemberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy member"));
//    if (Boolean.TRUE.equals(member.getEmailSent())) {
//        throw new RuntimeException("Email đã được gửi trước đó!");
//    }

        String subject = "Nhà Trường Gửi Thông Tin Tài Khoản Đăng Nhập";

        // 1. Đọc file HTML template
        String htmlTemplate;
        try (var inputStream = getClass().getResourceAsStream("/templates/email-template.html")) {
            if (inputStream == null) {
                throw new RuntimeException("Template file not found!");
            }
            htmlTemplate = new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Error reading template: " + e.getMessage());
        }

        // 2. Thay các biến động
        String htmlBody = htmlTemplate
                .replace("{{username}}", member.getUsername())
                .replace("{{password}}", member.getPassword())
                .replace("{{email}}", member.getEmail());

        // 3. Gửi email HTML
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, StandardCharsets.UTF_8.name());
            helper.setFrom(fromEmail);
            helper.setTo(member.getEmail());
            helper.setSubject(subject);
            helper.setText(htmlBody, true);


            javaMailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Send email failed: " + e.getMessage());
        }

        member.setEmailSent(true);
        accountMemberRepository.save(member);
    }

    @Override
    public void sendHealthCheckupNotificationEmail(ParentHealthCheckupNotificationDTO notification) {
        String subject = String.format("Kết quả khám sức khỏe - %s (%s)", 
            notification.getStudentName(), notification.getStudentId());

        // 1. Đọc file HTML template cho health checkup
        String htmlTemplate;
        try (var inputStream = getClass().getResourceAsStream("/templates/health-checkup-notification-template.html")) {
            if (inputStream == null) {
                throw new RuntimeException("Health checkup template file not found!");
            }
            htmlTemplate = new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Error reading health checkup template: " + e.getMessage());
        }

        // 2. Determine urgency class and health title based on urgency level
        String urgencyClass = "";
        String healthTitle = "";
        
        switch (notification.getUrgencyLevel()) {
            case "URGENT":
                urgencyClass = "urgent";
                healthTitle = "⚠️ Cần chú ý đặc biệt";
                break;
            case "ATTENTION_NEEDED":
                urgencyClass = "attention";
                healthTitle = "📋 Cần theo dõi";
                break;
            default:
                urgencyClass = "";
                healthTitle = "✅ Kết quả khám sức khỏe";
        }

        // 3. Format date
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        String formattedDate = notification.getCheckupDate().format(formatter);

        // 4. Thay các biến động
        String htmlBody = htmlTemplate
                .replace("{{parentName}}", notification.getParentName())
                .replace("{{studentName}}", notification.getStudentName())
                .replace("{{studentId}}", notification.getStudentId())
                .replace("{{studentClass}}", notification.getStudentClass() != null ? notification.getStudentClass() : "N/A")
                .replace("{{checkupDate}}", formattedDate)
                .replace("{{checkupType}}", notification.getCheckupType())
                .replace("{{medicalStaffName}}", notification.getMedicalStaffName())
                .replace("{{diagnosis}}", notification.getDiagnosis() != null ? notification.getDiagnosis() : "Không có chẩn đoán đặc biệt")
                .replace("{{recommendations}}", notification.getRecommendations() != null ? notification.getRecommendations() : "Không có khuyến nghị đặc biệt")
                .replace("{{urgencyClass}}", urgencyClass)
                .replace("{{healthTitle}}", healthTitle)
                .replace("{{healthConcerns}}", notification.getHealthConcerns() != null ? notification.getHealthConcerns() : "Tình trạng sức khỏe tổng quát tốt")
                .replace("{{actionRequired}}", notification.getActionRequired() != null ? notification.getActionRequired() : "")
                .replace("{{nextAppointmentRecommended}}", notification.getNextAppointmentRecommended() != null ? notification.getNextAppointmentRecommended() : "")
                .replace("{{contactInstructions}}", notification.getContactInstructions() != null ? notification.getContactInstructions() : "Liên hệ phòng y tế nếu có thắc mắc.");

        // 5. Handle conditional content for action required
        if (notification.getActionRequired() != null && !notification.getActionRequired().trim().isEmpty()) {
            htmlBody = htmlBody.replace("{{#if actionRequired}}", "").replace("{{/if}}", "");
            if (notification.getNextAppointmentRecommended() != null && !notification.getNextAppointmentRecommended().trim().isEmpty()) {
                htmlBody = htmlBody.replace("{{#if nextAppointmentRecommended}}", "").replace("{{/if}}", "");
            } else {
                htmlBody = removeConditionalBlock(htmlBody, "{{#if nextAppointmentRecommended}}", "{{/if}}");
            }
        } else {
            htmlBody = removeConditionalBlock(htmlBody, "{{#if actionRequired}}", "{{/if}}");
        }

        // 6. Gửi email HTML
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, StandardCharsets.UTF_8.name());
            helper.setFrom(fromEmail);
            helper.setTo(notification.getParentEmail());
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            javaMailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Send health checkup email failed: " + e.getMessage());
        }
    }

    @Override
    public void sendHealthCheckupNotificationByCheckupId(Long checkupId) {
        MedicalCheckup checkup = medicalCheckupRepository.findById(checkupId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kết quả khám sức khỏe với ID: " + checkupId));

        Student student = checkup.getStudent();
        if (student == null) {
            throw new RuntimeException("Không tìm thấy thông tin học sinh cho kết quả khám sức khỏe ID: " + checkupId);
        }

        Parent parent = student.getParent();
        if (parent == null) {
            throw new RuntimeException("Không tìm thấy thông tin phụ huynh cho học sinh: " + student.getFullName());
        }

        // Simple notification - nurse has already decided to send this
        String nurseName = checkup.getMedicalStaff() != null ? checkup.getMedicalStaff().getFullName() : "Nhân viên y tế";
        
        ParentHealthCheckupNotificationDTO notification = ParentHealthCheckupNotificationDTO.builder()
                .checkupId(checkup.getId())
                .studentName(student.getFullName())
                .studentId(student.getStudentId())
                .studentClass(student.getClassName())
                .checkupDate(checkup.getCheckupDate())
                .checkupType(checkup.getCheckupType())
                .medicalStaffName(nurseName)
                .diagnosis(checkup.getDiagnosis())
                .recommendations(checkup.getRecommendations())
                .followUpNeeded(checkup.getFollowUpNeeded())
                .urgencyLevel("ATTENTION_NEEDED") // Simple - always attention needed if nurse sends
                .parentName(parent.getFullName())
                .parentEmail(parent.getEmail())
                .healthConcerns("Chúng tôi đã phát hiện một số điều cần lưu ý trong kết quả khám sức khỏe của con em.")
                .actionRequired("Vui lòng liên hệ với " + nurseName + " để được tư vấn chi tiết về kết quả khám sức khỏe và các bước cần thực hiện tiếp theo.")
                .contactInstructions("Liên hệ phòng y tế trường học trong giờ hành chính để được hỗ trợ.")
                .nextAppointmentRecommended(checkup.getFollowUpNeeded() != null && checkup.getFollowUpNeeded() 
                    ? "Có thể cần đặt lịch hẹn khám lại" : null)
                .build();

        sendHealthCheckupNotificationEmail(notification);

        // Mark parent as notified
        checkup.setParentNotified(true);
        medicalCheckupRepository.save(checkup);
    }

    @Override
    public void sendBatchHealthCheckupNotifications(List<Long> checkupIds) {
        List<String> errors = new ArrayList<>();
        int successCount = 0;

        for (Long checkupId : checkupIds) {
            try {
                sendHealthCheckupNotificationByCheckupId(checkupId);
                successCount++;
            } catch (Exception e) {
                errors.add("Checkup ID " + checkupId + ": " + e.getMessage());
            }
        }

        if (!errors.isEmpty()) {
            String errorMessage = String.format("Gửi email thành công: %d/%d. Lỗi: %s", 
                successCount, checkupIds.size(), String.join(", ", errors));
            throw new RuntimeException(errorMessage);
        }
    }

    /**
     * Remove conditional blocks from HTML template
     */
    private String removeConditionalBlock(String html, String startTag, String endTag) {
        int startIndex = html.indexOf(startTag);
        if (startIndex == -1) return html;
        
        int endIndex = html.indexOf(endTag, startIndex);
        if (endIndex == -1) return html;
        
        return html.substring(0, startIndex) + html.substring(endIndex + endTag.length());
    }
}
