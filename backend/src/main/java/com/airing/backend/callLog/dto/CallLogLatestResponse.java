package com.airing.backend.callLog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;

@Getter
@AllArgsConstructor
@Builder
public class CallLogLatestResponse {

    private Long id;
    private OffsetDateTime startedAt;
    private int duration;
    private String callType;
    private String title;
}
