package com.fpt.medically_be.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.beans.factory.annotation.Value;

@Configuration
public class WebConfig {

    @Value("${frontend.url}")
    private String frontendUrl;

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        // Cho phép credentials (cookies, authorization headers, etc.)
        config.setAllowCredentials(true);

        // Cho phép requests từ frontend URL
        config.addAllowedOrigin(frontendUrl);
        // Cho phép tất cả origins nếu cần thiết cho môi trường dev (thay thế bằng URL cụ thể cho production)
        config.addAllowedOrigin("*");

        // Cho phép tất cả headers
        config.addAllowedHeader("*");

        // Cho phép tất cả methods
        config.addAllowedMethod("*");

        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }
}
