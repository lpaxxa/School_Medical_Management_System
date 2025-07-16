package com.fpt.medically_be.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fpt.medically_be.service.ResendClientService;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class ResendClientServiceImpl implements ResendClientService {

    @Value("${resend.api.key}")
    private String apiKey;

    private static final String API_URL = "https://api.resend.com/emails";
    private static final OkHttpClient client = new OkHttpClient();
    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Async
    @Override
    public void sendEmail(String from, String to, String subject, String html) {
        try {
            // Build request body using Map (auto-converts to valid JSON)
            Map<String, Object> bodyMap = Map.of(
                    "from", from,
                    "to", List.of(to),
                    "subject", subject,
                    "html", html
            );

            String json = objectMapper.writeValueAsString(bodyMap);
            RequestBody body = RequestBody.create(json, MediaType.parse("application/json"));

            Request request = new Request.Builder()
                    .url(API_URL)
                    .post(body)
                    .addHeader("Authorization", "Bearer " + apiKey)
                    .addHeader("Content-Type", "application/json")
                    .build();
            long start = System.currentTimeMillis();
            try (Response response = client.newCall(request).execute()) {
                long duration = System.currentTimeMillis() - start;
                if (!response.isSuccessful()) {
                    throw new RuntimeException("Resend failed: " + response.body().string());

                }
                System.out.printf("✅ Resend: Email sent to %s in %d ms%n", to, duration);
                System.out.println("✅ Resend: Email sent to " + to);
            }

        } catch (Exception e) {
            throw new RuntimeException("Error sending via Resend: " + e.getMessage(), e);
        }
    }
}
