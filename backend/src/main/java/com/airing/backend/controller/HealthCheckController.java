package com.airing.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.HashMap;
import java.util.Map;

@RestController
@Tag(name = "System")
public class HealthCheckController {
    
    @GetMapping("/health-check")
    @Operation(
        summary = "헬스 체크",
        description = "서버가 정상 작동하는지 확인하는 API입니다."
    )
    public Map<String, String> healthCheck() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "ok");
        return response;
    }
} 