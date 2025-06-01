package com.airing.backend.image.service;

import com.airing.backend.image.dto.PresignedUrlResponse;
import com.airing.backend.image.entity.Image;
import com.airing.backend.image.repository.ImageRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
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

import java.net.URI;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@RequiredArgsConstructor
public class ImageService {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner; // presigned URL Î∞úÍ∏â?ö© Í∞ùÏ≤¥
    private final ImageRepository imageRepository;

    @Value("${cloud.aws.s3.bucket}")
    private String bucket;

    // Presigned URL Î∞úÍ∏â
    public List<PresignedUrlResponse> generatePresignedUrls(List<String> fileTypes, String email) {
        return fileTypes.stream()
                .map(fileType -> {
                    // S3 key ?Éù?Ñ±
                    String key = email + "/" + Instant.now().toEpochMilli() + "_" + fileType;

                    // URL ÎßåÎ£å ?ãúÍ∞? ?Ñ§?†ï -> AWS?ùò presigned URL?ù¥ ?ùº?öå?ö©/?ã®Í∏∞Ï†Å
                    PutObjectRequest putRequest = PutObjectRequest.builder()
                            .bucket(bucket)
                            .key(key)
                            .build();

                    PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                            .putObjectRequest(putRequest)
                            .signatureDuration(Duration.ofMinutes(5))
                            .build();

                    // URL ?Éù?Ñ±
                    PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(presignRequest);
                    String url = presignedRequest.url().toString();

                    // DB ????û•
                    Image image = Image.builder()
                            .key(key)
                            .uploaderEmail(email)
                            .createdAt(LocalDateTime.now())
                            .build();
                    imageRepository.save(image);

                    return new PresignedUrlResponse(key, url);
                })
                .collect(Collectors.toList());
    }

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
            return true;
        } catch (Exception e) {
            log.error("Failed to delete images from S3: {}", keys, e);
            return false;
        }
    }

    /**
     * presigned-urlÎ°? ?óÖÎ°úÎìú?êú ?ù¥ÎØ∏Ï?? ?Ç§?ì§?ùÑ Î∞õÏïÑ
     * ?ï¥?ãπ ?ù¥ÎØ∏Ï???ì§?ùÑ ?äπ?†ï diaryId?óê ?ó∞Í≤∞Ìï©?ãà?ã§.
     */
    @Transactional
    public void linkImagesToDiary(List<String> imageKeys, Long diaryId) {
        List<Image> images = imageRepository.findAllByKeyIn(imageKeys);

        for (Image image : images) {
            image.setDiaryId(diaryId);
        }
    }
}
