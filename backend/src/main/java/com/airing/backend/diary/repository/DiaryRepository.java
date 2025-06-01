package com.airing.backend.diary.repository;

import com.airing.backend.diary.entity.Diary;
import com.airing.backend.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface DiaryRepository extends JpaRepository<Diary, Long> {

    List<Diary> findAllByUserAndDateBetween(User user, LocalDate startDate, LocalDate endDate);

}
