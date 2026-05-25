package com.codesync.module.ai.dto;

import lombok.Data;

@Data
public class AiRequest {

    private String code;
    private String language;
    private String context;     // optional: problem description or additional context
    private String questionType; // review, bugs, complexity, hint
}
