package com.airing.backend.diary.Service;

import com.airing.backend.auth.jwt.JwtProvider;
import com.airing.backend.auth.jwt.JwtProvider;
import com.airing.backend.diary.dto.DiaryCreateRequest;
import com.airing.backend.diary.dto.DiaryDetailResponse;
import com.airing.backend.diary.dto.DiarySummaryResponse;
import com.airing.backend.diary.dto.DiaryUpdateRequest;
import com.airing.backend.diary.entity.Diary;
import com.airing.backend.diary.repository.DiaryRepository;
import com.airing.backend.user.entity.User;
import com.airing.backend.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import com.airing.backend.user.entity.User;
import com.airing.backend.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DiaryService {

    private final DiaryRepository diaryRepository;
    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;
    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;

    public void createService(DiaryCreateRequest request, String token) {
        User user = getAuthenticatedUser(token);
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
        System.out.println(">>> diaryId ?öîÏ≤?Í∞?: " + diaryId);

        User user = getAuthenticatedUser(token);

        Diary diary = diaryRepository.findById(diaryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "?ùºÍ∏∞Î?? Ï∞æÏùÑ ?àò ?óÜ?äµ?ãà?ã§."));

        if (!diary.getUser().getEmail().equals(user.getEmail())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "?ï¥?ãπ ?ùºÍ∏∞Ïóê ????ïú Í∂åÌïú?ù¥ ?óÜ?äµ?ãà?ã§.");
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
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "?ùºÍ∏∞Î?? Ï∞æÏùÑ ?àò ?óÜ?äµ?ãà?ã§."));

        if (!diary.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "?ï¥?ãπ ?ùºÍ∏∞Ïóê ????ïú Í∂åÌïú?ù¥ ?óÜ?äµ?ãà?ã§.");
        }

        diaryRepository.delete(diary);
    }

    public DiaryDetailResponse getDiaryDetail(Long diaryId, String token) {
        User user = getAuthenticatedUser(token);

        Diary diary = diaryRepository.findById(diaryId)
                .orElseThrow(() -> new RuntimeException("?ùºÍ∏? ?óÜ?ùå"));

        if (!diary.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("?ã§Î•? ?Ç¨?ö©?ûê?ùò ?ùºÍ∏∞ÏûÖ?ãà?ã§");
        }

        return new DiaryDetailResponse(
                diary.getId(),
                diary.getDate(),
                diary.getContent(),
                diary.getImage(),
                diary.getEmotion(),
                diary.getTag()
        );
    }

    public List<DiarySummaryResponse> getMonthlySummary(String yearMonth, String token) {
        User user = getAuthenticatedUser(token);

        YearMonth ym = YearMonth.parse(yearMonth);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        List<Diary> diaries = diaryRepository.findAllByUserAndDateBetween(user, start, end);

        return diaries.stream().map(d -> new DiarySummaryResponse(
                d.getDate(),
                d.getId(),
                d.getEmotion(),
                d.getTag(),
                false
        ))
                .collect(Collectors.toList());
    }

    private User getAuthenticatedUser(String token) {
        String jwt = token.replace("Bearer ", "");
        String email = jwtProvider.getEmailFromToken(jwt);

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }
}
