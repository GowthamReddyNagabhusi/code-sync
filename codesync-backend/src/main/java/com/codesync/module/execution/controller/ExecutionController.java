package com.codesync.module.execution.controller;

import com.codesync.common.exception.ApiException;
import com.codesync.module.execution.dto.ExecuteRequest;
import com.codesync.module.execution.dto.ExecuteResponse;
import com.codesync.module.execution.model.ExecutionResult;
import com.codesync.module.execution.service.DockerSandboxService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/execute")
@RequiredArgsConstructor
public class ExecutionController {

    private final DockerSandboxService sandboxService;

    @PostMapping
    public ResponseEntity<ExecuteResponse> execute(@RequestBody ExecuteRequest request) {
        if (request.getCode() == null || request.getCode().isBlank()) {
            throw ApiException.badRequest("Code cannot be empty");
        }

        if (request.getLanguage() == null || request.getLanguage().isBlank()) {
            throw ApiException.badRequest("Language is required");
        }

        long timeout = request.getTimeoutSeconds() != null
                ? request.getTimeoutSeconds() : 10L;

        ExecutionResult result = sandboxService.execute(
                request.getCode(),
                request.getLanguage(),
                request.getStdin(),
                timeout
        );

        ExecuteResponse response = ExecuteResponse.builder()
                .stdout(result.getStdout())
                .stderr(result.getStderr())
                .exitCode(result.getExitCode())
                .executionTimeMs(result.getExecutionTimeMs())
                .timedOut(result.isTimedOut())
                .language(result.getLanguage())
                .success(result.getExitCode() == 0 && !result.isTimedOut())
                .build();

        return ResponseEntity.ok(response);
    }
}
