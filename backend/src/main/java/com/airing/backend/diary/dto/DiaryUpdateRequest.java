package com.airing.backend.diary.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class DiaryUpdateRequest {

    private String content;
    private List<String> image;
    private List<String> emotion;
    private List<String> tag;
}
