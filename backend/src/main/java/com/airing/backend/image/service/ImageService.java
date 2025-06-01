package com.airing.backend.image.service;

import com.airing.backend.image.dto.PresignedUrlResponse;
import com.airing.backend.image.entity.Image;
import com.airing.backend.image.repository.ImageRepository;
import com.amazonaws.HttpMethod;
import com.amazonaws.services.s3.AmazonS3Client;
import com.amazonaws.services.s3.model.DeleteObjectRequest;
import com.amazonaws.services.s3.model.DeleteObjectsRequest;
import com.amazonaws.services.s3.model.GeneratePresignedUrlRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URL;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImageService {

    private final AmazonS3Client amazonS3Client;
    private final ImageRepository imageRepository;

    @Value("${cloud.aws.s3.bucket}")
    private String bucket;

    // Presigned URL 발급
    public List<PresignedUrlResponse> generatePresignedUrls(List<String> filenames, String email) {
        return filenames.stream()
                .map(filename -> {
                    // S3 key 생성
                    String key = email + "/" + Instant.now().toEpochMilli() + "_" + filename;

                    // URL 만료 시간 설정 -> AWS의 presigned URL이 일회용/단기적
                    Date expiration = Date.from(Instant.now().plusSeconds(300));

                    // url 생성
                    GeneratePresignedUrlRequest request = new GeneratePresignedUrlRequest(bucket, key)
                            .withMethod(HttpMethod.PUT)
                            .withExpiration(expiration);
                    URL url = amazonS3Client.generatePresignedUrl(request);

                    // DB 저장
                    Image image = Image.builder()
                            .key(key)
                            .uploaderEmail(email)
                            .createdAt(LocalDateTime.now())
                            .build();
                    imageRepository.save(image);

                    return new PresignedUrlResponse(key, url.toString());
                })
                .collect(Collectors.toList());
    }

    public boolean deleteImage(List<String> keys) {
        try {
            DeleteObjectsRequest request= new DeleteObjectsRequest(bucket)
                    .withKeys(keys.toArray(new String[0]));

            amazonS3Client.deleteObjects(request);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * presigned-url로 업로드된 이미지 키들을 받아
     * 해당 이미지들을 특정 diaryId에 연결합니다.
     */
    @Transactional
    public void linkImagesToDiary(List<String> imageKeys, Long diaryId) {
        List<Image> images = imageRepository.findAllByKeyIn(imageKeys);

        for (Image image : images) {
            image.setDiaryId(diaryId);
        }
    }
}
