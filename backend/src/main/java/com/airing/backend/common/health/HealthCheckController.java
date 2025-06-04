package com.airing.backend.common.health;

import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@Tag(name = "System")
public class HealthCheckController {
    
    @SecurityRequirements({})
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