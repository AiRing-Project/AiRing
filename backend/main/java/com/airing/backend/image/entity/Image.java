package com.airing.backend.image.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Image {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String key; // service 에서 만든 S3 key

    private String uploaderEmail; // 업로더 이메일 (JWT에서 추출)

    private LocalDateTime createdAt;

    @Column(nullable = true)
    private Long diaryId;
}
