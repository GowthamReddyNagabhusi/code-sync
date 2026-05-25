package com.codesync.module.execution.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ExecuteResponse {

    private String stdout;
    private String stderr;
    private int exitCode;
    private long executionTimeMs;
    private boolean timedOut;
    private String language;
    private boolean success;
}
