package com.airing.backend.callLog.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CallLogInitResponse {
    private String ephemeralToken;
    private Long callLogId;
} 