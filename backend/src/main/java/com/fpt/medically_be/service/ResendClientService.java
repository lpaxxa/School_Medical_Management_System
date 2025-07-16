package com.fpt.medically_be.service;

public interface ResendClientService {
    void sendEmail(String from, String to, String subject, String html);
}
