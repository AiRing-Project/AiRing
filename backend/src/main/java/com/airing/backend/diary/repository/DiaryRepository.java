package com.airing.backend.diary.repository;

import com.airing.backend.diary.entity.Diary;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DiaryRepository extends JpaRepository<Diary, Long> {


}
