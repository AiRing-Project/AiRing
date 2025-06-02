package com.airing.backend.diary.entity;

import com.airing.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Diary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private LocalDate date;
    private String content;

    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> image;

    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> emotion;

    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> tag;

    private Boolean hasReply = false;
}
