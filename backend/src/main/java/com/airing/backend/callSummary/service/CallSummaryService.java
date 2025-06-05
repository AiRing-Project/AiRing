package com.airing.backend.callSummary.service;

import com.airing.backend.callLog.entity.CallLog;
import com.airing.backend.callLog.repository.CallLogRepository;
import com.airing.backend.callSummary.dto.CallSummaryRequest;
import com.airing.backend.callSummary.dto.CallSummaryResponse;
import com.airing.backend.callSummary.entity.CallSummary;
import com.airing.backend.callSummary.repository.CallSummaryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class CallSummaryService {

    private final CallSummaryRepository callSummaryRepository;
    private final CallLogRepository callLogRepository;

    @Transactional(readOnly = true)
    public CallSummaryResponse getSummary(Long userId, Long callLogId) {
        CallSummary summary = callSummaryRepository.findByCallLog_Id(callLogId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "요약 정보가 존재하지 않습니다."));
        validateUserAccess(userId, summary.getCallLog());

        return new CallSummaryResponse(
                summary.getTitle(),
                summary.getContent(),
                List.copyOf(summary.getEmotion())
        );
    }

    @Transactional
    public void upsertSummary(Long userId, Long callLogId, CallSummaryRequest request) {
               CallLog callLog = callLogRepository.findById(callLogId)
                               .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "통화 로그가 존재하지 않습니다."));

        validateUserAccess(userId, callLog);

        CallSummary callSummary = callSummaryRepository.findByCallLog_Id(callLogId)
                .map(existing -> {
                    existing.setTitle(request.getTitle());
                    existing.setContent(request.getContent());
                    existing.setEmotion(request.getEmotion());
                    return existing;
                })
                .orElseGet(() -> CallSummary.builder()
                        .callLog(callLog)
                        .title(request.getTitle())
                        .content(request.getContent())
                        .emotion(request.getEmotion())
                        .build()
                );

        callSummaryRepository.save(callSummary);
    }

    private void validateUserAccess(Long userId, CallLog callLog) {
        if (!callLog.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "해당 통화 요약에 접근할 수 없습니다.");
        }
    }
}
