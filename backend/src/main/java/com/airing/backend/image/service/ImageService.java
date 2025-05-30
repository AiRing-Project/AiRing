package com.airing.backend.image.service;

import com.airing.backend.image.dto.PresignedUrlResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ImageService {

    public List<PresignedUrlResponse> generatePresignedUrls(List<String> filenames, String email) {

        return null;
    }

    public boolean deleteImage(List<String> keys) {

        return false;
    }
}
