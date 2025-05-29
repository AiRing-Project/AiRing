package com.airing.backend.diary.entity;

import com.airing.backend.user.entity.User;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Entity
public class Diary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private LocalDate date;
    private String content;

    @ElementCollection
    private List<String> image;

    @ElementCollection
    private List<String> emotion;

    @ElementCollection
    private List<String> tag;
}
