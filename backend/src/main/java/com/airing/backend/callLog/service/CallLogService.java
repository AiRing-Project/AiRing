package com.airing.backend.callLog.service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;

import com.airing.backend.callLog.dto.CallLogDetailResponse;
import com.airing.backend.callLog.dto.CallLogInitRequest;
import com.airing.backend.callLog.dto.CallLogInitResponse;
import com.airing.backend.callLog.dto.CallLogLatestResponse;
import com.airing.backend.callLog.dto.CallLogMonthlyResponse;
import com.airing.backend.callLog.entity.CallLog;
import com.airing.backend.callLog.repository.CallLogRepository;
import com.airing.backend.common.model.Message;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CallLogService {

    private static final String EPHEMERAL_TOKEN_PATH = "/api/auth/ephemeral-token";
    private static final int MAX_RETRIES = 3;
    private static final long INITIAL_RETRY_DELAY_MS = 500;

    private final CallLogRepository callLogRepository;
    private final RestTemplate restTemplate;

    public CallLogLatestResponse getLatestCallLog(Long userId) {
        CallLog callLog = callLogRepository.findTopByUserIdOrderByStartedAtDesc(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "최근 통화 기록이 없습니다."));

        /* CallSummary summary = callSummaryRepository.findByCallLogId(callLog.getId())
            .orElseThrow(() -> new RuntimeException("통화 요약이 없습니다."));
         */

        return CallLogLatestResponse.builder()
                .id(callLog.getId())
                .startedAt(callLog.getStartedAt())
                .duration(callLog.getDuration())
                .callType(callLog.getCallType())
                .title(null)
                .build();
    }

    public CallLogDetailResponse getCallLogDetail(Long userId, Long callLogId) {
        CallLog callLog = callLogRepository.findById(callLogId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "통화 기록을 찾을 수 없습니다."));
        if (!callLog.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "해당 통화 기록에 대한 접근 권한이 없습니다.");
        }

        List<Message> messages = callLog.getRawTranscript();
        if (messages == null || messages.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NO_CONTENT, "rawTranscript가 없습니다.");
        }

        return CallLogDetailResponse.builder()
                .id(callLogId)
                .startedAt(callLog.getStartedAt())
                .messages(messages)
                .build();
    }

    @Value("${ai.server.url}")
    private String aiServerUrl;

    public CallLogInitResponse initCallLog(Long userId, CallLogInitRequest request) {
        String ephemeralToken = getEphemeralTokenWithRetry();

        // Create CallLog entry only if API call succeeds
        CallLog callLog = CallLog.builder()
                .userId(userId)
                .startedAt(OffsetDateTime.now())
                .callType(request.getCallType())
                .build();

        CallLog savedCallLog = callLogRepository.save(callLog);

        return CallLogInitResponse.builder()
                .ephemeralToken(ephemeralToken)
                .callLogId(savedCallLog.getId())
                .build();
    }

    public void recordCallLogMessages(Long userId, Long callLogId, List<Message> messages) {
        CallLog callLog = callLogRepository.findById(callLogId)
                .orElseThrow(() -> new IllegalArgumentException("CallLog not found: " + callLogId));
        if (!callLog.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "해당 통화 기록에 대한 접근 권한이 없습니다.");
        }

        List<Message> transcript = callLog.getRawTranscript();
        if (transcript == null) {
            transcript = new java.util.ArrayList<>();
        }

        transcript.addAll(messages);
        callLog.setRawTranscript(transcript);
        callLogRepository.save(callLog);
    }

    public void endCallLog(Long userId, Long callLogId) {
        CallLog callLog = callLogRepository.findById(callLogId)
            .orElseThrow(() -> new IllegalArgumentException("CallLog not found: " + callLogId));
        if (!callLog.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "해당 통화 기록에 대한 접근 권한이 없습니다.");
        }

        callLog.setDuration((int) Duration.between(callLog.getStartedAt(), OffsetDateTime.now()).toSeconds());
        callLogRepository.save(callLog);
        // TODO: 일기 요약, 감정 분석 등 트리거 처리 예정
    }

    public List<CallLogMonthlyResponse> getMonthlyCallLog(Long userId, YearMonth yearMonth) {
        OffsetDateTime start = yearMonth.atDay(1).atStartOfDay().atOffset(ZoneOffset.UTC);
        OffsetDateTime end = yearMonth.atEndOfMonth().atTime(23 , 59, 59).atOffset(ZoneOffset.UTC);

        List<CallLog> callLogs = callLogRepository.findAllByUserIdAndStartedAtBetween(userId, start, end);

        Map<LocalDate, List<CallLogMonthlyResponse.LogSummary>> grouped = callLogs.stream()
                .map(log -> CallLogMonthlyResponse.LogSummary.builder()
                        .id(log.getId())
                        .startedAt(log.getStartedAt())
                        .callType(log.getCallType())
                        .title(null) // 추후 callSummary 처리
                        .build())
                .collect(Collectors.groupingBy(summary -> summary.getStartedAt().toLocalDate()));

        return grouped.entrySet().stream()
                .map(entry -> CallLogMonthlyResponse.builder()
                        .date(entry.getKey())
                        .logs(entry.getValue())
                        .build())
                .sorted(Comparator.comparing(CallLogMonthlyResponse::getDate).reversed())
                .collect(Collectors.toList());
    }

    private String getEphemeralTokenWithRetry() {
        int attempts = 0;
        Exception lastException = null;

        while (attempts < MAX_RETRIES) {
            try {
                String url = UriComponentsBuilder.fromUriString(aiServerUrl)
                        .path(EPHEMERAL_TOKEN_PATH)
                        .build()
                        .toUriString();

                return restTemplate.postForObject(
                        url,
                        null,
                        EphemeralTokenResponse.class
                ).ephemeralToken();

            } catch (RestClientException e) {
                lastException = e;
                attempts++;

                if (attempts < MAX_RETRIES) {
                    try {
                        Thread.sleep(INITIAL_RETRY_DELAY_MS * (1L << attempts));
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new RuntimeException("Retry interrupted", ie);
                    }
                }
            }
        }

        throw new RuntimeException("Failed to get ephemeral token after " + MAX_RETRIES + " attempts", lastException);
    }

    private record EphemeralTokenResponse(String ephemeralToken) {}
}
