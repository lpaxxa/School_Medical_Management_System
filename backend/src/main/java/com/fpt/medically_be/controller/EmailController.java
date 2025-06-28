package com.fpt.medically_be.controller;

import com.fpt.medically_be.service.AccountMemberService;
import com.fpt.medically_be.service.EmailService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/v1/email")
public class EmailController {


    private final EmailService emailService;
    private final JavaMailSender javaMailSender;
    private final JavaMailSenderImpl mailSender;

    @Autowired
    public EmailController(EmailService emailService, JavaMailSender javaMailSender, JavaMailSenderImpl mailSender) {
        this.emailService = emailService;
        this.javaMailSender = javaMailSender;
        this.mailSender = mailSender;
    }


    @Operation(summary = "Send email to member", description = "Gửi thông tin tài khoản qua email cho thành viên")
    @PostMapping("/sendAccountEmail/{memberId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> sendAccountEmail(@PathVariable("memberId") String memberId) {
        emailService.sendAccountInfoEmail(memberId);
        return ResponseEntity.ok("Email sent!");
    }

    @Operation(summary = "Send email to multiple members", description = "Gửi thông tin tài khoản cho nhiều thành viên")
    @PostMapping("/sendAccountEmail")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> sendAccountEmail(@RequestBody List<String> memberIds) {
        for (String id : memberIds) {
            emailService.sendAccountInfoEmail(id);
        }
        return ResponseEntity.ok("Emails sent!");
    }












//
//
//    @RequestMapping("/send-email")
//    public String sendEmail() {
//
//        try {
//            SimpleMailMessage message = new SimpleMailMessage();
//            message.setFrom("thanhndse182854@fpt.edu.vn");
//            message.setTo("tdinh7455@gmail.com");
//            message.setSubject("Simple test email");
//            message.setText("Thank you for using this mail");
//
//            mailSender.send(message);
//            return "Email sent successfully!";
//        }catch (Exception e) {
//            return e.getMessage();
//        }
//    }
//
//    @RequestMapping("/send-email-with-attachment")
//    public String sendEmailWithAttachment() {
//
//        try {
//            MimeMessage message = javaMailSender.createMimeMessage();
//            MimeMessageHelper helper = new MimeMessageHelper(message,true, "UTF-8");
//
//            helper.setFrom("thanhndse182854@fpt.edu.vn");
//            helper.setTo("tdinh7455@gmail.com");
//            helper.setSubject("Java email with attachment | FROM GC");
//            helper.setText("Please find the attachment below", true);
//            helper.addAttachment("mine.png", new File("D:\\BOOK\\Her\\images\\mine.jpg"));
//            mailSender.send(message);
//            return "Email sent successfully!";
//        }catch (Exception e) {
//            return e.getMessage();
//        }
//    }
//
//    @GetMapping("/send-email-with-html")
//    public String sendHtmlEmail() {
//        try {
//            MimeMessage message = javaMailSender.createMimeMessage();
//            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
//
//            helper.setFrom("thanhndse182854@fpt.edu.vn");
//            helper.setTo("tdinh7455@gmail.com");
//            helper.setSubject("HTML Email");
//
//            try (var inputStream = EmailController.class.getResourceAsStream("/templates/email-template.html")) {
//                if (inputStream == null) {
//                    return "Template file not found!";
//                }
//                helper.setText(new String(inputStream.readAllBytes(), StandardCharsets.UTF_8), true);
//            }
//
//            javaMailSender.send(message);
//            return "HTML Email sent successfully!";
//        } catch (Exception e) {
//            return e.getMessage();
//        }
//    }
//
//    public void sendWelcomeEmail(String toEmail, String fullName, String username, String password, String role) {
//        try {
//            MimeMessage message = javaMailSender.createMimeMessage();
//            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
//
//            helper.setFrom("thanhndse182854@fpt.edu.vn");
//            helper.setTo(toEmail);
//            helper.setSubject("Tài khoản đăng nhập hệ thống y tế trường học");
//
//            String htmlContent = """
//                <html>
//                <body>
//                    <p>Chào %s,</p>
//                    <p>Bạn đã được tạo tài khoản với vai trò <strong>%s</strong> trong hệ thống Quản lý Y tế Trường học.</p>
//                    <p>Thông tin đăng nhập của bạn:</p>
//                    <ul>
//                        <li><strong>Tên đăng nhập:</strong> %s</li>
//                        <li><strong>Mật khẩu:</strong> %s</li>
//                    </ul>
//                    <p>Vui lòng đăng nhập và đổi mật khẩu sau khi đăng nhập lần đầu tại: <a href="https://your-app-login.com">Hệ thống y tế trường học</a></p>
//                    <p>Trân trọng,<br/>Trường học FPT</p>
//                </body>
//                </html>
//                """.formatted(fullName, role, username, password);
//
//            helper.setText(htmlContent, true);
//            javaMailSender.send(message);
//        } catch (Exception e) {
//            // log lỗi nếu muốn
//            e.printStackTrace();
//        }
//    }
}
