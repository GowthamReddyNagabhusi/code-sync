package com.codesync.module.ai.controller;

import com.codesync.common.exception.ApiException;
import com.codesync.module.ai.dto.AiRequest;
import com.codesync.module.ai.dto.AiResponse;
import com.codesync.module.ai.service.AiAssistantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiAssistantService aiService;

    @PostMapping("/review")
    public ResponseEntity<AiResponse> reviewCode(@RequestBody AiRequest request) {
        validateRequest(request);
        return ResponseEntity.ok(aiService.reviewCode(request));
    }

    @PostMapping("/bugs")
    public ResponseEntity<AiResponse> detectBugs(@RequestBody AiRequest request) {
        validateRequest(request);
        return ResponseEntity.ok(aiService.detectBugs(request));
    }

    @PostMapping("/complexity")
    public ResponseEntity<AiResponse> analyzeComplexity(@RequestBody AiRequest request) {
        validateRequest(request);
        return ResponseEntity.ok(aiService.analyzeComplexity(request));
    }

    @PostMapping("/hint")
    public ResponseEntity<AiResponse> getHint(@RequestBody AiRequest request) {
        validateRequest(request);
        return ResponseEntity.ok(aiService.getHint(request));
    }

    private void validateRequest(AiRequest request) {
        if (request.getCode() == null || request.getCode().isBlank()) {
            throw ApiException.badRequest("Code cannot be empty");
        }
        if (request.getLanguage() == null || request.getLanguage().isBlank()) {
            throw ApiException.badRequest("Language is required");
        }
    }
}
