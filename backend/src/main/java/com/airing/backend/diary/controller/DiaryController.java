package com.airing.backend.diary.controller;

import com.airing.backend.diary.service.DiaryService;
import com.airing.backend.diary.dto.DiaryCreateRequest;
import com.airing.backend.diary.dto.DiaryDetailResponse;
import com.airing.backend.diary.dto.DiarySummaryResponse;
import com.airing.backend.diary.dto.DiaryUpdateRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/diaries")
@RequiredArgsConstructor
public class DiaryController {

    private final DiaryService diaryService;

    @PostMapping
    public ResponseEntity<?> createDiary(
            @RequestBody @Valid DiaryCreateRequest request,
            @RequestHeader("Authorization") String token) {

        diaryService.createService(request, token);
        return ResponseEntity.ok("일기 생성 성공");
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateDiary(
            @PathVariable("id") Long diaryId,
            @RequestBody @Valid DiaryUpdateRequest request,
            @RequestHeader("Authorization") String token
    ) {
        diaryService.updateService(diaryId, request, token);
        return ResponseEntity.ok("일기 수정 성공");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDiary(
            @PathVariable("id") Long diaryId,
            @RequestHeader("Authorization") String token) {

        diaryService.deleteService(diaryId, token);
        return ResponseEntity.ok("일기 삭제 성공");
        // 또는: return ResponseEntity.noContent().build();
    }

    // 다이어리 상세 조회
    @GetMapping("/{id}")
    public ResponseEntity<DiaryDetailResponse> getDiaryDetail(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {

        String token = authHeader.replace("Bearer ", "");
        return ResponseEntity.ok(diaryService.getDiaryDetail(id, token));
    }

    // 월별 다이어리 요약 조회
    @GetMapping
    public ResponseEntity<List<DiarySummaryResponse>> getMonthlySummary(
            @RequestParam String yearMonth,
            @RequestHeader("Authorization") String authHeader) {

        String token = authHeader.replace("Bearer ", "");
        return ResponseEntity.ok(diaryService.getMonthlySummary(yearMonth, token));
    }
}
