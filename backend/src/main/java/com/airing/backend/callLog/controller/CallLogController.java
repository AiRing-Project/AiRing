package com.airing.backend.callLog.controller;

import com.airing.backend.callLog.dto.CallLogDetailResponse;
import com.airing.backend.callLog.dto.CallLogEventRequest;
import com.airing.backend.callLog.dto.CallLogLatestResponse;
import com.airing.backend.callLog.service.CallLogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

@RestController
@RequestMapping("/call_logs")
@RequiredArgsConstructor
public class CallLogController {

    private final CallLogService callLogService;

    @PostMapping("/events")
    public void saveCallEvent(
            @AuthenticationPrincipal(expression = "id") Long userId,
            @RequestBody @Valid CallLogEventRequest request) {

        callLogService.saveCallEvent(userId, request);
    }

    @GetMapping("/latest")
    public CallLogLatestResponse getLatestCallLog(
            @AuthenticationPrincipal(expression = "id") Long userId) {

        return callLogService.getLatestCallLog(userId);
    }

    @GetMapping("/{id}")
    public CallLogDetailResponse getCallLogDetail(
            @PathVariable("id") Long callLogId) {

        return callLogService.getCallLogDetail(callLogId);
    }
}
