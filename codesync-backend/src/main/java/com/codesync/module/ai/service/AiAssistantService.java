package com.codesync.module.ai.service;

import com.codesync.module.ai.dto.AiRequest;
import com.codesync.module.ai.dto.AiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiAssistantService {

    private final ChatClient.Builder chatClientBuilder;

    private static final String SYSTEM_PROMPT = """
            You are CodeSync AI — a senior software engineer and coding mentor.
            You help developers write better code by providing actionable, specific feedback.
            Be concise but thorough. Format your response in markdown.
            Do NOT write the corrected code unless explicitly asked.
            Act as a mentor, not an autocomplete tool.
            """;

    public AiResponse reviewCode(AiRequest request) {
        String prompt = String.format("""
                Review the following %s code. Provide:
                1. **Code Quality** — readability, naming, structure
                2. **Best Practices** — language-specific idioms and patterns
                3. **Potential Issues** — edge cases, error handling
                4. **Suggestions** — concrete improvements
                
                %s
                
                ```%s
                %s
                ```
                """,
                request.getLanguage(),
                request.getContext() != null ? "Context: " + request.getContext() : "",
                request.getLanguage(),
                request.getCode()
        );

        return callAi(prompt, "review", request.getLanguage());
    }

    public AiResponse detectBugs(AiRequest request) {
        String prompt = String.format("""
                Analyze the following %s code for bugs and issues:
                
                1. **Critical Bugs** — logic errors, null pointer risks, off-by-one errors
                2. **Runtime Risks** — exceptions, infinite loops, resource leaks
                3. **Security Issues** — injection, hardcoded secrets, unsafe operations
                4. **Severity Rating** — rate each issue as LOW / MEDIUM / HIGH / CRITICAL
                
                %s
                
                ```%s
                %s
                ```
                """,
                request.getLanguage(),
                request.getContext() != null ? "Context: " + request.getContext() : "",
                request.getLanguage(),
                request.getCode()
        );

        return callAi(prompt, "bugs", request.getLanguage());
    }

    public AiResponse analyzeComplexity(AiRequest request) {
        String prompt = String.format("""
                Analyze the time and space complexity of the following %s code:
                
                1. **Time Complexity** — Big-O for each method/function
                2. **Space Complexity** — memory usage analysis
                3. **Bottlenecks** — identify performance hotspots
                4. **Optimization Suggestions** — alternative approaches with better complexity
                
                ```%s
                %s
                ```
                """,
                request.getLanguage(),
                request.getLanguage(),
                request.getCode()
        );

        return callAi(prompt, "complexity", request.getLanguage());
    }

    public AiResponse getHint(AiRequest request) {
        String prompt = String.format("""
                The developer is working on a problem and needs a hint. 
                Do NOT give the full solution. Guide them toward the answer.
                
                Language: %s
                Problem context: %s
                
                Their current code:
                ```%s
                %s
                ```
                
                Provide:
                1. **What's Working** — acknowledge correct parts
                2. **Direction** — hint at the approach without spoiling it
                3. **Key Concept** — mention the algorithm/data structure/pattern that would help
                4. **Next Step** — one specific thing they should try next
                """,
                request.getLanguage(),
                request.getContext() != null ? request.getContext() : "No context provided",
                request.getLanguage(),
                request.getCode()
        );

        return callAi(prompt, "hint", request.getLanguage());
    }

    private AiResponse callAi(String userPrompt, String type, String language) {
        long start = System.currentTimeMillis();

        try {
            ChatClient chatClient = chatClientBuilder
                    .defaultSystem(SYSTEM_PROMPT)
                    .build();

            String response = chatClient.prompt()
                    .user(userPrompt)
                    .call()
                    .content();

            return AiResponse.builder()
                    .analysis(response)
                    .type(type)
                    .language(language)
                    .processingTimeMs(System.currentTimeMillis() - start)
                    .build();

        } catch (Exception e) {
            log.error("AI service error: {}", e.getMessage(), e);

            return AiResponse.builder()
                    .analysis("AI service is currently unavailable. Error: " + e.getMessage())
                    .type(type)
                    .language(language)
                    .processingTimeMs(System.currentTimeMillis() - start)
                    .build();
        }
    }
}
