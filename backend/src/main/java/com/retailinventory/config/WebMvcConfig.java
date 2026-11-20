package com.retailinventory.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${app.cors.allowed-origins:http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000,http://localhost:4173,http://127.0.0.1:4173}")
    private String corsAllowedOrigins;

    @Override
    @SuppressWarnings("null")
    public void addCorsMappings(@NonNull CorsRegistry registry) {
        String[] origins = Arrays.stream(corsAllowedOrigins.split(","))
                .map(s -> s.trim())
                .filter(s -> !s.isEmpty())
                .toArray(String[]::new);

        registry.addMapping("/**")
                .allowedOrigins(origins)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600); // 1 hour max age for preflight requests
    }
}
