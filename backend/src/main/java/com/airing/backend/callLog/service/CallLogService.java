package com.airing.backend.callLog.service;

import com.airing.backend.callLog.dto.CallLogEventRequest;
import com.airing.backend.callLog.dto.CallLogLatestResponse;
import com.airing.backend.callLog.entity.CallLog;
import com.airing.backend.callLog.repository.CallLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;

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

        return CallLogLatestResponse.builder()
                .id(callLog.getId())
                .startedAt(callLog.getStartedAt())
                .duration(callLog.getDuration())
                .callType(callLog.getCallType())
                .title(null)
                .build();
    }
}
