package com.codesync;

import com.codesync.module.ai.dto.AiRequest;
import com.codesync.module.ai.dto.AiResponse;
import com.codesync.module.ai.service.AiAssistantService;
import org.junit.jupiter.api.Test;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.openai.api.OpenAiApi;

import static org.junit.jupiter.api.Assertions.*;

class AiAssistantServiceTest {

    @Test
    void testGeminiCodeReview() {
        String apiKey = System.getenv("GEMINI_API_KEY");
        if (apiKey == null || apiKey.isBlank()) {
            apiKey = System.getProperty("GEMINI_API_KEY", "");
        }
        if (apiKey.isBlank()) {
            // Live test skipped if no GEMINI_API_KEY is present in environment
            return;
        }

        String baseUrl = "https://generativelanguage.googleapis.com/v1beta/openai";

        OpenAiApi openAiApi = new OpenAiApi(baseUrl, apiKey);
        OpenAiChatOptions options = OpenAiChatOptions.builder()
                .model("gemini-3.8-flash")
                .temperature(0.3)
                .build();

        OpenAiChatModel chatModel = new OpenAiChatModel(openAiApi, options);
        ChatClient.Builder builder = ChatClient.builder(chatModel);

        AiAssistantService aiService = new AiAssistantService(builder);

        AiRequest request = new AiRequest();
        request.setLanguage("java");
        request.setCode("""
                public int divide(int a, int b) {
                    return a / b;
                }
                """);

        AiResponse response = aiService.reviewCode(request);

        assertNotNull(response);
        assertEquals("review", response.getType());
        assertEquals("java", response.getLanguage());
        assertNotNull(response.getAnalysis());
        assertFalse(response.getAnalysis().startsWith("AI service is currently unavailable"),
                "AI service should not return unavailable: " + response.getAnalysis());
    }
}
