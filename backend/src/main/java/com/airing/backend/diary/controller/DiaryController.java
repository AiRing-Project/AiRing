package com.airing.backend.diary.controller;

import com.airing.backend.diary.Service.DiaryService;
import com.airing.backend.diary.dto.DiaryCreateRequest;
import com.airing.backend.diary.dto.DiaryUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/api/diaries")
@RequiredArgsConstructor
public class DiaryController {

    private final DiaryService diaryService;

    @PostMapping
    public ResponseEntity<?> createDiary(
            @RequestBody DiaryCreateRequest request,
            @RequestHeader("Authorization") String token) {
        diaryService.createService(request, token);
        return ResponseEntity.ok("일기 작성 완료");
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateDiary(
            @PathVariable("id") Long diaryId,
            @RequestBody DiaryUpdateRequest request,
            @RequestHeader("Authorization") String token
    ) {
        diaryService.updateService(diaryId, request, token);
        return ResponseEntity.ok("일기 수정 완료");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDiary(
            @PathVariable("id") Long diaryId,
            @RequestHeader("Authorization") String token) {

        diaryService.deleteService(diaryId, token);
        return ResponseEntity.ok("일기 삭제 완료");
        // return ResponseEntity.noContent().build(); 나중에
    }
}
