package com.jobtracker.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/")
    public ResponseEntity<?> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "OK");
        response.put("message", "JobTracker API is running");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "jobtracker");
        return ResponseEntity.ok(response);
    }

    /**
     * Matches Railway's default healthcheck path: /actuator/health
     * Avoids needing the full spring-boot-starter-actuator dependency.
     */
    @GetMapping("/actuator/health")
    public ResponseEntity<?> actuatorHealth() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        return ResponseEntity.ok(response);
    }
}

