package com.airing.backend.conversations.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

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
        try {
            // 1. Get ephemeral token from AI server first
            String ephemeralToken = restTemplate.postForObject(
                    aiServerUrl + "/api/auth/ephemeral-token",
                    null,
                    EphemeralTokenResponse.class
            ).ephemeralToken();

            // 2. Create CallLog entry only if API call succeeds
            CallLog callLog = CallLog.builder()
                    .userId(userId)
                    .startedAt(request.getStartedAt())
                    .callType(request.getCallType())
                    .build();

            CallLog savedCallLog = callLogRepository.save(callLog);

            return ConversationInitResponse.builder()
                    .ephemeralToken(ephemeralToken)
                    .conversationId(savedCallLog.getId())
                    .build();
        } catch (RestClientException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to get ephemeral token", e);
        }
    }

    private record EphemeralTokenResponse(String ephemeralToken) {}
} 