package com.airing.backend.user.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;


@Entity
@Getter
@Setter
@Table(name = "\"user\"")
@ToString
public class User {
    @Id // Primary Key
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String username;
    private String password;
    private String email;
    private String role;
    @CreationTimestamp
    private LocalDateTime createData;
}
