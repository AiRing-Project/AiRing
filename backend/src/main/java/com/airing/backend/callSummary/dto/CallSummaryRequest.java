package com.airing.backend.callSummary.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class CallSummaryRequest {

    private String title;
    private String content;
    private List<String> emotion;
}
