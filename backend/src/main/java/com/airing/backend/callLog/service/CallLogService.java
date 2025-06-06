package com.airing.backend.callLog.service;

import com.airing.backend.callLog.dto.CallLogDetailResponse;
import com.airing.backend.callLog.dto.CallLogEventRequest;
import com.airing.backend.callLog.dto.CallLogLatestResponse;
import com.airing.backend.callLog.dto.CallLogMonthlyResponse;
import com.airing.backend.callLog.entity.CallLog;
import com.airing.backend.callLog.repository.CallLogRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CallLogService {

    private final CallLogRepository callLogRepository;

    public void saveCallEvent(Long userId, CallLogEventRequest request) {
        CallLog callLog = CallLog.builder()
                .userId(userId)
                .startedAt(request.getStartedAt())
                .callType(request.getCallType())
                .rawTranscript(request.getRawTranscript())
                .build();

        callLogRepository.save(callLog);
    }

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

        String transcriptJson = callLog.getRawTranscript();
        if (transcriptJson == null || transcriptJson.isBlank()) {
            throw new ResponseStatusException(HttpStatus.NO_CONTENT, "rawTranscript가 없습니다.");
        }

        List<CallLogDetailResponse.Message> messages;

        try {
            messages = new ObjectMapper().readValue(
                    transcriptJson,
                    new TypeReference<>() {
                    }
            );
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "rawTranscript 파싱 실패", e);
        }
        return CallLogDetailResponse.builder()
                .id(callLogId)
                .startedAt(callLog.getStartedAt())
                .messages(messages)
                .build();
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
}
