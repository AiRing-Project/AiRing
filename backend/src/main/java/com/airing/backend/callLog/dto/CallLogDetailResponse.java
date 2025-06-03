package com.airing.backend.callLog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CallLogDetailResponse {

    private Long id;
    private OffsetDateTime startedAt;
    private List<Message> messages;

    @Getter
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class Message {
        private String from;
        private String message;
    }
}
