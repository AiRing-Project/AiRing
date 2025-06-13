package com.airing.backend.conversations.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ConversationInitResponse {
    private String ephemeralToken;
    private Long conversationId;
} 