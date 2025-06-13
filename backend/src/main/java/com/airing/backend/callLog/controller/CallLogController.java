package com.airing.backend.callLog.controller;

import java.time.YearMonth;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.airing.backend.callLog.dto.CallLogDetailResponse;
import com.airing.backend.callLog.dto.CallLogInitRequest;
import com.airing.backend.callLog.dto.CallLogInitResponse;
import com.airing.backend.callLog.dto.CallLogLatestResponse;
import com.airing.backend.callLog.dto.CallLogMonthlyResponse;
import com.airing.backend.callLog.service.CallLogService;
import com.airing.backend.common.model.Message;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/call_logs")
@RequiredArgsConstructor
public class CallLogController {

    private final CallLogService callLogService;

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

    @PostMapping("/init")
    public CallLogInitResponse initCallLog(
            @AuthenticationPrincipal(expression = "id") Long userId,
            @RequestBody CallLogInitRequest request) {
        return callLogService.initCallLog(userId, request);
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<Void> recordCallLogMessages(
            @AuthenticationPrincipal(expression = "id") Long userId,
            @PathVariable("id") @Valid Long callLogId,
            @RequestBody List<Message> messages) {
        callLogService.recordCallLogMessages(userId, callLogId, messages);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/end")
    public ResponseEntity<Void> endCallLog(
            @AuthenticationPrincipal(expression = "id") Long userId,
            @PathVariable("id") @Valid Long callLogId) {
        callLogService.endCallLog(userId, callLogId);
        return ResponseEntity.ok().build();
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
