package com.airing.backend.callLog.service;

import com.airing.backend.callLog.dto.CallLogDetailResponse;
import com.airing.backend.callLog.dto.CallLogEventRequest;
import com.airing.backend.callLog.dto.CallLogLatestResponse;
import com.airing.backend.callLog.entity.CallLog;
import com.airing.backend.callLog.repository.CallLogRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CallLogService {

    private final CallLogRepository callLogRepository;

    public void saveCallEvent(Long userId, CallLogEventRequest request) {
        CallLog callLog = CallLog.builder()
                .userId(userId)
                .startedAt(request.getStartedAt())
                .callType(request.getCallType())
                .rawTranscript(null)
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

    public CallLogDetailResponse getCallLogDetail(Long callLogId) {
        CallLog callLog = callLogRepository.findById(callLogId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "통화 기록을 찾을 수 없습니다."));

        String transcriptJson = callLog.getRawTranscript();
        if (transcriptJson == null || transcriptJson.isBlank()) {
            throw new ResponseStatusException(HttpStatus.NO_CONTENT, "rawTranscript가 없습니다.");
        }

        List<CallLogDetailResponse.Message> messages;

        try {
            messages = new ObjectMapper().readValue(
                    callLog.getRawTranscript(),
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
}
