package com.airing.backend.conversations.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.airing.backend.callLog.entity.CallLog;
import com.airing.backend.callLog.repository.CallLogRepository;
import com.airing.backend.conversations.dto.ConversationInitRequest;
import com.airing.backend.conversations.dto.ConversationInitResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ConversationService {

    private final CallLogRepository callLogRepository;
    private final RestTemplate restTemplate;

    @Value("${ai.server.url}")
    private String aiServerUrl;

    public ConversationInitResponse initConversation(Long userId, ConversationInitRequest request) {
        // 1. Create CallLog entry
        CallLog callLog = CallLog.builder()
                .userId(userId)
                .startedAt(request.getStartedAt())
                .callType(request.getCallType())
                .build();
        
        CallLog savedCallLog = callLogRepository.save(callLog);

        // 2. Get ephemeral token from AI server
        String ephemeralToken = restTemplate.postForObject(
                aiServerUrl + "/api/auth/ephemeral-token",
                null,
                EphemeralTokenResponse.class
        ).ephemeralToken();

        return ConversationInitResponse.builder()
                .conversationId(savedCallLog.getId())
                .ephemeralToken(ephemeralToken)
                .build();
    }

    private record EphemeralTokenResponse(String ephemeralToken) {}
} 