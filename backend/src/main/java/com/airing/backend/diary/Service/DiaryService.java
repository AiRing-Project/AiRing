package com.airing.backend.diary.Service;

import com.airing.backend.auth.jwt.JwtProvider;
import com.airing.backend.diary.dto.DiaryCreateRequest;
import com.airing.backend.diary.dto.DiaryUpdateRequest;
import com.airing.backend.diary.entity.Diary;
import com.airing.backend.diary.repository.DiaryRepository;
import com.airing.backend.user.entity.User;
import com.airing.backend.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class DiaryService {

    private final DiaryRepository diaryRepository;
    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;

    public void createService(DiaryCreateRequest request, String token) {
        User user = getAuthenticatedUser(token);

        Diary diary = new Diary();
        diary.setDate(request.getDate());
        diary.setContent(request.getContent());
        diary.setImage(request.getImage());
        diary.setEmotion(request.getEmotion());
        diary.setTag(request.getTag());
        diary.setUser(user);

        diaryRepository.save(diary);
    }

    @Transactional
    public void updateService(Long diaryId, DiaryUpdateRequest request, String token) {
        System.out.println(">>> diaryId 요청값: " + diaryId);

        User user = getAuthenticatedUser(token);

        Diary diary = diaryRepository.findById(diaryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "일기를 찾을 수 없습니다."));

        if (!diary.getUser().getEmail().equals(user.getEmail())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "해당 일기에 대한 권한이 없습니다.");
        }

        diary.setContent(request.getContent());
        diary.setImage(request.getImage());
        diary.setEmotion(request.getEmotion());
        diary.setTag(request.getTag());

        diaryRepository.save(diary);
    }

    @Transactional
    public void deleteService(Long diaryId, String token) {
        User user = getAuthenticatedUser(token);

        Diary diary = diaryRepository.findById(diaryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "일기를 찾을 수 없습니다."));

        if (!diary.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "해당 일기에 대한 권한이 없습니다.");
        }

        diaryRepository.delete(diary);
    }

    private User getAuthenticatedUser(String token) {
        String jwt = token.replace("Bearer ", "");
        String email = jwtProvider.getEmailFromToken(jwt);

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }
}
