package com.codesync.module.execution.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ExecutionResult {

    private String stdout;
    private String stderr;
    private int exitCode;
    private long executionTimeMs;
    private long memoryUsedMb;
    private boolean timedOut;
    private String language;
}
