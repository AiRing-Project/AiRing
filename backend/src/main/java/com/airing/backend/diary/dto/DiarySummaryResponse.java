package com.airing.backend.diary.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class DiarySummaryResponse {
    private LocalDate date;
    private Long id;
    private List<String> emotion;
    private List<String> tag;
    private boolean hasReply;
}