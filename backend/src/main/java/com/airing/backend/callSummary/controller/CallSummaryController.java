package com.airing.backend.callSummary.controller;

import com.airing.backend.callSummary.dto.CallSummaryRequest;
import com.airing.backend.callSummary.dto.CallSummaryResponse;
import com.airing.backend.callSummary.service.CallSummaryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/call_summary")
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
