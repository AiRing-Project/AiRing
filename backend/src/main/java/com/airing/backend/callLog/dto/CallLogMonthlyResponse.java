package com.airing.backend.callLog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class CallLogMonthlyResponse {
    private LocalDate date;
    private List<LogSummary> logs;

    @Getter
    @AllArgsConstructor
    @Builder
    public static class LogSummary {
        private Long id;
        private OffsetDateTime startedAt;
        private String callType;
        private String title;
    }
}