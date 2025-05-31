package com.airing.backend.diary.dto;

import jakarta.persistence.ElementCollection;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class DiaryUpdateRequest {

    private String content;
    private List<String> image;
    private List<String> emotion;
    private List<String> tag;
}
