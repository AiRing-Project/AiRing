package com.airing.backend.callLog.controller;

import com.airing.backend.callLog.dto.CallLogDetailResponse;
import com.airing.backend.callLog.dto.CallLogEventRequest;
import com.airing.backend.callLog.dto.CallLogLatestResponse;
import com.airing.backend.callLog.dto.CallLogMonthlyResponse;
import com.airing.backend.callLog.service.CallLogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.server.ResponseStatusException;

import java.time.YearMonth;
import java.util.List;

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
            @AuthenticationPrincipal(expression = "id") Long userId,
            @PathVariable("id") @Valid Long callLogId) {

        return callLogService.getCallLogDetail(userId, callLogId);
    }

    @GetMapping
    public List<CallLogMonthlyResponse> getMonthlyCallLog(
            @RequestParam("yearMonth") String yearMonthStr,
            @AuthenticationPrincipal(expression = "id") Long userId) {

        YearMonth yearMonth;

        try {
            yearMonth = YearMonth.parse(yearMonthStr);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "날짜 형식은 YYYY-MM 이어야 합니다.");
        }

        return callLogService.getMonthlyCallLog(userId, yearMonth);
    }
}
