package com.codesync.module.execution.service;

import com.codesync.module.execution.model.ExecutionResult;
import com.codesync.module.execution.strategy.CodeExecutionStrategy;
import com.codesync.module.execution.strategy.ExecutionStrategyFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Service that orchestrates code execution.
 * 
 * Currently uses local process-based execution (fallback mode).
 * When Docker is available, it can be extended to use Docker containers
 * with resource limits (CPU, memory, network isolation).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DockerSandboxService {

    private final ExecutionStrategyFactory strategyFactory;

    private static final long DEFAULT_TIMEOUT_SECONDS = 10;
    private static final long MAX_TIMEOUT_SECONDS = 30;

    public ExecutionResult execute(String code, String language, String stdin) {
        return execute(code, language, stdin, DEFAULT_TIMEOUT_SECONDS);
    }

    public ExecutionResult execute(String code, String language, String stdin,
                                    long timeoutSeconds) {
        // Enforce max timeout
        timeoutSeconds = Math.min(timeoutSeconds, MAX_TIMEOUT_SECONDS);

        CodeExecutionStrategy strategy = strategyFactory.getStrategy(language);

        log.info("Executing {} code (timeout: {}s)", language, timeoutSeconds);
        long start = System.currentTimeMillis();

        ExecutionResult result = strategy.executeLocally(code, stdin, timeoutSeconds);

        log.info("Execution complete: language={}, exitCode={}, time={}ms, timedOut={}",
                language, result.getExitCode(),
                System.currentTimeMillis() - start, result.isTimedOut());

        return result;
    }
}
