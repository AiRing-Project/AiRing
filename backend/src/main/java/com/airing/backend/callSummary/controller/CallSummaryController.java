package com.airing.backend.callSummary.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.airing.backend.callSummary.dto.CallSummaryRequest;
import com.airing.backend.callSummary.dto.CallSummaryResponse;
import com.airing.backend.callSummary.service.CallSummaryService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/call_summary")
@RequiredArgsConstructor
public class CallSummaryController {

    private final CallSummaryService callSummaryService;

    @GetMapping("/{callLogId}")
    public ResponseEntity<CallSummaryResponse> getSummary(
            @PathVariable Long callLogId,
            @AuthenticationPrincipal(expression = "id") Long userId) {

        return ResponseEntity.ok(callSummaryService.getSummary(userId, callLogId));
    }

    @PutMapping("/{callLogId}")
    public ResponseEntity<?> upsertSummary(
            @PathVariable Long callLogId,
            @RequestBody @Valid CallSummaryRequest request,
            @AuthenticationPrincipal(expression = "id") Long userId) {

        callSummaryService.upsertSummary(userId, callLogId, request);
        return ResponseEntity.ok().build();
    }
}
