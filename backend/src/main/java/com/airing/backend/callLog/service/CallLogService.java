package com.airing.backend.callLog.service;

import com.airing.backend.callLog.dto.CallLogEventRequest;
import com.airing.backend.callLog.entity.CallLog;
import com.airing.backend.callLog.repository.CallLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
}
