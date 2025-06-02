package com.airing.backend.image.repository;

import com.airing.backend.image.entity.Image;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImageRepository extends JpaRepository<Image, Long> {

    List<Image> findByDiaryId(Long diaryId);

    List<Image> findByUploaderEmail(String email);

    List<Image> findAllByKeyIn(List<String> keys);

    void deleteByKeyIn(List<String> keys);
}
