package com.airing.backend.callLog.entity;

import java.time.OffsetDateTime;
import java.util.List;

import com.airing.backend.common.converter.JsonConverter;
import com.airing.backend.common.model.Message;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CallLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private OffsetDateTime startedAt;

    private String callType;

    private int duration;

    @Column(columnDefinition = "jsonb")
    @Convert(converter = JsonConverter.class)
    private List<Message> rawTranscript;
}
