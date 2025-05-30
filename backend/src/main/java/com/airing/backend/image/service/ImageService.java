package com.airing.backend.image.service;

import com.airing.backend.image.dto.PresignedUrlResponse;
import com.airing.backend.image.entity.Image;
import com.airing.backend.image.repository.ImageRepository;
import com.amazonaws.HttpMethod;
import com.amazonaws.services.s3.AmazonS3Client;
import com.amazonaws.services.s3.model.DeleteObjectRequest;
import com.amazonaws.services.s3.model.DeleteObjectsRequest;
import com.amazonaws.services.s3.model.GeneratePresignedUrlRequest;
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

    // Presigned URL Î∞úÍ∏â
    public List<PresignedUrlResponse> generatePresignedUrls(List<String> filenames, String email) {
        return filenames.stream()
                .map(filename -> {
                    // S3 key ?Éù?Ñ±
                    String key = email + "/" + Instant.now().toEpochMilli() + "_" + filename;

                    // URL ÎßåÎ£å ?ãúÍ∞? ?Ñ§?†ï -> AWS?ùò presigned URL?ù¥ ?ùº?öå?ö©/?ã®Í∏∞Ï†Å
                    Date expiration = Date.from(Instant.now().plusSeconds(300));

                    // url ?Éù?Ñ±
                    GeneratePresignedUrlRequest request = new GeneratePresignedUrlRequest(bucket, key)
                            .withMethod(HttpMethod.PUT)
                            .withExpiration(expiration);
                    URL url = amazonS3Client.generatePresignedUrl(request);

                    // DB ????û•
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
}
