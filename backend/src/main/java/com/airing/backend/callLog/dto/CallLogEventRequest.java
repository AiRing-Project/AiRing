package com.airing.backend.callLog.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.OffsetDateTime;

@Getter
@Setter
public class CallLogEventRequest {

    private String event;

    private String callType;

    private OffsetDateTime startedAt;

    private String rawTranscript;
}
