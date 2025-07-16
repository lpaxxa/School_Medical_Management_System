package com.fpt.medically_be.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

@Configuration
@EnableWebMvc
@OpenAPIDefinition(
        info = @Info(
                title = "Medical Management System API",
                version = "1.0",
                description = "API for School Medical Management System"
        ),
        security = {
                @SecurityRequirement(name = "bearerAuth")
        },
        servers = {
                @io.swagger.v3.oas.annotations.servers.Server(
                        url = "https://medically-sou-azure.southeastasia.cloudapp.azure.com",
                        description = "Production Server"
                ),
                @io.swagger.v3.oas.annotations.servers.Server(
                        url = "http://localhost:8080",
                        description = "Local Development Server"
                )
        }


)
@SecurityScheme(
        name = "bearerAuth",
        description = "JWT Authentication",
        scheme = "bearer",
        type = SecuritySchemeType.HTTP,
        bearerFormat = "JWT",
        in = SecuritySchemeIn.HEADER
)
public class OpenApiConfig {

    private final Environment environment;

    public OpenApiConfig(Environment environment) {
        this.environment = environment;
    }

    @Bean
    public io.swagger.v3.oas.models.OpenAPI customOpenAPI() {
        io.swagger.v3.oas.models.OpenAPI openAPI = new io.swagger.v3.oas.models.OpenAPI();

        // Always add HTTPS server for production domain
        openAPI.addServersItem(new io.swagger.v3.oas.models.servers.Server()
                .url("https://medically-backend.southeastasia.cloudapp.azure.com")
                .description("Production Server (HTTPS)"));

        // Add local development server with current port
        String localPort = environment.getProperty("server.port", "8080");
        openAPI.addServersItem(new io.swagger.v3.oas.models.servers.Server()
                .url("http://localhost:" + localPort)
                .description("Local Development Server (HTTP)"));

        return openAPI;
    }
}
