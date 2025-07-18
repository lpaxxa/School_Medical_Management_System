package com.fpt.medically_be.config;

import com.cloudinary.Cloudinary;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudinaryConfig {

    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    @Value("${cloudinary.api-key}")
    private String apiKey;

    @Value("${cloudinary.api-secret}")
    private String apiSecret;

    @Bean
    public Cloudinary cloudinary() {
        // Sử dụng URL string để khởi tạo Cloudinary thay vì Map
        String cloudinaryUrl = String.format("cloudinary://%s:%s@%s", apiKey, apiSecret, cloudName);
        return new Cloudinary(cloudinaryUrl);
    }
}
