package com.airing.backend.image.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.airing.backend.auth.jwt.JwtProvider;
import com.airing.backend.image.dto.PresignedUrlResponse;
import com.airing.backend.image.service.ImageService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/images")
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
