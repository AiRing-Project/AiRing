package com.airing.backend.diary.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class DiaryCreateRequest {

    private LocalDate date;
    private String content;
    private List<String> image;
    private List<String> emotion;
    private List<String> tag;

    private List<String> imageKeys; // Presigned-url로 업로드된 이미지 키들
}
