package com.airing.backend.callLog.dto;

import java.time.OffsetDateTime;
import java.util.List;

import com.airing.backend.common.model.Message;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CallLogDetailResponse {

    private Long id;
    private OffsetDateTime startedAt;
    private List<Message> messages;
}
