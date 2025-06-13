package com.airing.backend.callLog.dto;

import java.time.OffsetDateTime;
import java.util.List;

import com.fasterxml.jackson.databind.JsonNode;

import lombok.Getter;
import lombok.Setter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Builder;

@Getter
@Setter
public class CallLogEventRequest {

    private String event;

    private String callType;

    private OffsetDateTime startedAt;

    private List<Message> rawTranscript;

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class Message {
        private String from;
        private String message;
    }
}
