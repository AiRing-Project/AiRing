package com.airing.backend.conversations.dto;

import java.time.OffsetDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ConversationInitRequest {
    private OffsetDateTime startedAt;
    private String callType;
} 