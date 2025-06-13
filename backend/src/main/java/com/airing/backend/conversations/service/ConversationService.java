package com.airing.backend.conversations.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.airing.backend.callLog.entity.CallLog;
import com.airing.backend.callLog.repository.CallLogRepository;
import com.airing.backend.conversations.dto.ConversationInitRequest;
import com.airing.backend.conversations.dto.ConversationInitResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ConversationService {

    private static final String EPHEMERAL_TOKEN_PATH = "/api/auth/ephemeral-token";
    private static final int MAX_RETRIES = 3;
    private static final long INITIAL_RETRY_DELAY_MS = 500;

    private final CallLogRepository callLogRepository;
    private final RestTemplate restTemplate;

    @Value("${ai.server.url}")
    private String aiServerUrl;

    public ConversationInitResponse initConversation(Long userId, ConversationInitRequest request) {
        String ephemeralToken = getEphemeralTokenWithRetry();

        // Create CallLog entry only if API call succeeds
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
