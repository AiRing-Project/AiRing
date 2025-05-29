package com.airing.backend.diary.entity;

import com.airing.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@NoArgsConstructor
@AllArgsConstructor
public class Diary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private LocalDate date;
    private String content;

    @ElementCollection(fetch = FetchType.EAGER) // ?��중에 N+1 문제?
    private List<String> image;

    @ElementCollection(fetch = FetchType.EAGER)
    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> emotion;

    @ElementCollection(fetch = FetchType.EAGER)
    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> tag;

    private Boolean hasReply = false;

    private Boolean hasReply = false;
}
