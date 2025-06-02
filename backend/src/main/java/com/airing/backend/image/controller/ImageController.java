package com.airing.backend.image.controller;

import com.airing.backend.auth.jwt.JwtProvider;
import com.airing.backend.image.dto.PresignedUrlResponse;
import com.airing.backend.image.service.ImageService;
import com.airing.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/images")
@RequiredArgsConstructor
public class ImageController {

    private final ImageService imageService;
    private final JwtProvider jwtProvider;

    @PostMapping("/presigned-url")
    public ResponseEntity<List<PresignedUrlResponse>> getPresignedUrls(
            @RequestBody List<String> fileTypes,
            @RequestHeader("Authorization") String token) {

        String email = jwtProvider.getEmailFromToken(token.replace("Bearer ", ""));
        return ResponseEntity.ok(imageService.generatePresignedUrls(fileTypes, email));
    }

    @PostMapping
    public ResponseEntity<Void> notifyUploadComplete(
            @RequestBody List<String> keys,
            @RequestHeader("Authorization") String token) {

        String email = jwtProvider.getEmailFromToken(token.replace("Bearer ", ""));
        imageService.notifyUploadComplete(keys, email);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping
    public ResponseEntity<Boolean> deleteImage(
            @RequestBody List<String> keys,
            @RequestHeader("Authorization") String token) {

        return ResponseEntity.ok(imageService.deleteImage(keys));
    }
}
