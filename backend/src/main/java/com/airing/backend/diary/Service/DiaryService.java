package com.airing.backend.diary.Service;

import com.airing.backend.diary.dto.DiaryCreateRequest;
import com.airing.backend.diary.dto.DiaryUpdateRequest;
import com.airing.backend.diary.entity.Diary;
import com.airing.backend.diary.repository.DiaryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DiaryService {

    private final DiaryRepository diaryRepository;

    public void createService(DiaryCreateRequest request, String token) {
        String jwt = token.replace("Bearer ", "");
        Long userId = 1L;
        User

        Diary diary = new Diary();
        diaryRepository.save(diary);
    }

    public void updateService(DiaryUpdateRequest request, String token) {

    }

    public void deleteService(String token) {

    }

}
