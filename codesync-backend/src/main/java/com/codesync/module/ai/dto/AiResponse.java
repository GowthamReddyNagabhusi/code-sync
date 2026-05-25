package com.codesync.module.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AiResponse {

    private String analysis;
    private String type;        // review, bugs, complexity, hint
    private String language;
    private long processingTimeMs;
}
