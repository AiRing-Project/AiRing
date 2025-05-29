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
public class DiaryDetailResponse {

    private Long id;
    private LocalDate date;
    private String content;
    private List<String> image;
    private List<String> emotion;
    private List<String> tag;
}
