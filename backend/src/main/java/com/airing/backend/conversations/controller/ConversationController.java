package com.airing.backend.conversations.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.airing.backend.conversations.dto.ConversationInitRequest;
import com.airing.backend.conversations.dto.ConversationInitResponse;
import com.airing.backend.conversations.service.ConversationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
public class ConversationController {

    private final ConversationService conversationService;

    @PostMapping("/init")
    public ConversationInitResponse initConversation(
            @AuthenticationPrincipal Long userId,
            @RequestBody ConversationInitRequest request) {
        return conversationService.initConversation(userId, request);
    }
} 