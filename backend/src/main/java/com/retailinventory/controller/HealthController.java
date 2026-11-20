package com.retailinventory.controller;

import com.retailinventory.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping({"/api/health", "/health", "/api/ping"})
    public ResponseEntity<ApiResponse<Map<String, Object>>> healthCheck() {
        Map<String, Object> status = new HashMap<>();
        status.put("status", "UP");
        status.put("service", "RetailHub Backend");
        status.put("timestamp", Instant.now().toString());
        return ResponseEntity.ok(ApiResponse.success("Service is healthy", status));
    }
}
