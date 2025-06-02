package com.airing.backend.image.service;

import com.airing.backend.image.dto.PresignedUrlResponse;
import com.airing.backend.image.entity.Image;
import com.airing.backend.image.repository.ImageRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.*;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ImageService {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner; // presigned URL 발급용 객체
    private final ImageRepository imageRepository;

    @Value("${spring.cloud.aws.s3.bucket}")
    private String bucket;

    // presigned URL 발급
    public List<PresignedUrlResponse> generatePresignedUrls(List<String> fileTypes, String email) {
        return fileTypes.stream()
                .map(fileType -> {
                    // S3 key 생성 (사용자 이메일 + 타임스탬프 + 파일 확장자)
                    String key = email + "/" + Instant.now().toEpochMilli() + "_" + fileType;

                    // presigned URL에 사용할 PutObject 요청 구성
                    PutObjectRequest putRequest = PutObjectRequest.builder()
                            .bucket(bucket)
                            .key(key)
                            .build();

                    // presigned URL 요청 객체 (유효 기간: 5분)
                    PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                            .putObjectRequest(putRequest)
                            .signatureDuration(Duration.ofMinutes(5))
                            .build();

                    // DB 생성
                    Image image = Image.builder()
                            .key(key)
                            .uploaderEmail(email)
                            .createdAt(LocalDateTime.now())
                            .build();
                    imageRepository.save(image);

                    // presigned URL 생성
                    PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(presignRequest);
                    log.info("Generated presigned URL: {}", presignedRequest.url());

                    return new PresignedUrlResponse(key, presignedRequest.url().toString());
                })
                .collect(Collectors.toList());
    }

    // 이미지 삭제
    @Transactional
    public boolean deleteImage(List<String> keys) {
        try {
            DeleteObjectsRequest request = DeleteObjectsRequest.builder()
                    .bucket(bucket)
                    .delete(Delete.builder()
                            .objects(keys.stream()
                                    .map(key -> ObjectIdentifier.builder().key(key).build())
                                    .collect(Collectors.toList()))
                            .build())
                    .build();

            s3Client.deleteObjects(request);

            // 삭제 DB 반영
            imageRepository.deleteByKeyIn(keys);

            return true;
        } catch (Exception e) {
            log.error("S3 삭제 실패: {}", e.getMessage(), e);
            throw new RuntimeException("S3 이미지 삭제 실패: " + e.getMessage());
        }
    }

    @Transactional
    public void notifyUploadComplete(List<String> keys, String email) {
        LocalDateTime now = LocalDateTime.now();

        List<Image> images = keys.stream()
                .map(key -> Image.builder()
                        .key(key)
                        .uploaderEmail(email)
                        .createdAt(now)
                        .build())
                .collect(Collectors.toList());

        imageRepository.saveAll(images);
    }

    /**
     * presigned URL을 통해 업로드된 이미지들의 key 목록을 받아
     * 해당 이미지들을 특정 diaryId에 연결한다.
     */
    @Transactional
    public void linkImagesToDiary(List<String> imageKeys, Long diaryId) {
        List<Image> images = imageRepository.findAllByKeyIn(imageKeys);

        for (Image image : images) {
            image.setDiaryId(diaryId);
        }
    }
}
