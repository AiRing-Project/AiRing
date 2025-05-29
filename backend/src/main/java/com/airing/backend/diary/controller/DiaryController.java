package com.airing.backend.diary.controller;

import com.airing.backend.diary.Service.DiaryService;
import com.airing.backend.diary.dto.DiaryCreateRequest;
import com.airing.backend.diary.dto.DiaryDetailResponse;
import com.airing.backend.diary.dto.DiarySummaryResponse;
import com.airing.backend.diary.dto.DiaryUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/diaries")
@RequiredArgsConstructor
public class DiaryController {

    private final DiaryService diaryService;

    @PostMapping
    public ResponseEntity<?> createDiary(
            @RequestBody DiaryCreateRequest request,
            @RequestHeader("Authorization") String token) {
        diaryService.createService(request, token);
        return ResponseEntity.ok("?ùºÍ∏? ?ûë?Ñ± ?ôÑÎ£?");
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateDiary(
            @PathVariable("id") Long diaryId,
            @RequestBody DiaryUpdateRequest request,
            @RequestHeader("Authorization") String token
    ) {
        diaryService.updateService(diaryId, request, token);
        return ResponseEntity.ok("?ùºÍ∏? ?àò?†ï ?ôÑÎ£?");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDiary(
            @PathVariable("id") Long diaryId,
            @RequestHeader("Authorization") String token) {

        diaryService.deleteService(diaryId, token);
        return ResponseEntity.ok("?ùºÍ∏? ?Ç≠?†ú ?ôÑÎ£?");
        // return ResponseEntity.noContent().build(); ?ÇòÏ§ëÏóê
    }

    @GetMapping("/{id}")
    public ResponseEntity<DiaryDetailResponse> getDiaryDetail(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {

        String token = authHeader.replace("Bearer ", "");
        return ResponseEntity.ok(diaryService.getDiaryDetail(id, token));
    }

    @GetMapping
    public ResponseEntity<List<DiarySummaryResponse>> getMonthlySummary(
            @RequestParam String yearMonth,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return ResponseEntity.ok(diaryService.getMonthlySummary(yearMonth, token));
    }
}
