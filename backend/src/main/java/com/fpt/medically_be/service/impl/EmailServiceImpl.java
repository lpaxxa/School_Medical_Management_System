package com.fpt.medically_be.service.impl;

import com.fpt.medically_be.entity.AccountMember;
import com.fpt.medically_be.repos.AccountMemberRepository;
import com.fpt.medically_be.service.AccountMemberService;
import com.fpt.medically_be.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

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
            helper.setFrom("thanhndse182854@fpt.edu.vn");
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



}
