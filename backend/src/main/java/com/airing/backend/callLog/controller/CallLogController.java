package com.airing.backend.callLog.controller;

import com.airing.backend.callLog.dto.CallLogEventRequest;
import com.airing.backend.callLog.service.CallLogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

@RestController
@RequestMapping("/call_logs")
@RequiredArgsConstructor
public class CallLogController {

    private final CallLogService callLogService;

    @PostMapping("/events")
    public void saveCallEvent(
            @AuthenticationPrincipal(expression = "id") Long userId,
            @RequestBody @Valid CallLogEventRequest eventRequest) {

    }
}
