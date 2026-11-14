package com.codesync.module.execution.service;

import com.codesync.module.execution.model.ExecutionResult;
import com.codesync.module.execution.strategy.CodeExecutionStrategy;
import com.codesync.module.execution.strategy.ExecutionStrategyFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * Service that orchestrates code execution.
 * 
 * Executes untrusted user code inside isolated Docker containers
 * with hard resource constraints:
 * - Zero network access (--network none)
 * - 256MB memory ceiling (--memory 256m)
 * - 1.0 CPU core limit (--cpus 1.0)
 * - Process limit (--pids-limit 64)
 * - Auto-destroy container on exit (--rm)
 * 
 * Falls back to local process execution if Docker is unavailable.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DockerSandboxService {

    private static final int MAX_OUTPUT_BYTES = 512 * 1024; // 512 KB
    private static final long DEFAULT_TIMEOUT_SECONDS = 10;
    private static final long MAX_TIMEOUT_SECONDS = 30;

    private final ExecutionStrategyFactory strategyFactory;

    public ExecutionResult execute(String code, String language, String stdin) {
        return execute(code, language, stdin, DEFAULT_TIMEOUT_SECONDS);
    }

    public ExecutionResult execute(String code, String language, String stdin, long timeoutSeconds) {
        timeoutSeconds = Math.min(timeoutSeconds, MAX_TIMEOUT_SECONDS);
        CodeExecutionStrategy strategy = strategyFactory.getStrategy(language);

        log.info("Executing {} code (timeout: {}s)", language, timeoutSeconds);
        long start = System.currentTimeMillis();

        ExecutionResult result;
        if (isDockerAvailable()) {
            log.info("Docker daemon is active. Executing in isolated container: {}", strategy.getDockerImage());
            result = executeInDocker(strategy, code, stdin, timeoutSeconds);
        } else {
            log.warn("Docker unavailable, falling back to host local execution");
            result = strategy.executeLocally(code, stdin, timeoutSeconds);
        }

        log.info("Execution complete: language={}, exitCode={}, time={}ms, timedOut={}",
                language, result.getExitCode(),
                System.currentTimeMillis() - start, result.isTimedOut());

        return result;
    }

    /**
     * Executes code inside an isolated, disposable Docker container.
     */
    private ExecutionResult executeInDocker(CodeExecutionStrategy strategy, String code, String stdin, long timeoutSeconds) {
        Path tempDir = null;
        try {
            tempDir = Files.createTempDirectory("codesync-docker-");
            Path sourceFile = tempDir.resolve(strategy.getSourceFileName());
            Files.writeString(sourceFile, code);

            String hostPath = tempDir.toAbsolutePath().toString();

            List<String> command = new ArrayList<>(List.of(
                    "docker", "run",
                    "-i",
                    "--rm",
                    "--network", "none",
                    "--memory", "256m",
                    "--cpus", "1.0",
                    "--pids-limit", "64",
                    "-v", hostPath + ":/code:rw",
                    "-w", "/code",
                    strategy.getDockerImage()
            ));

            String[] runCommands = strategy.getBuildAndRunCommands(strategy.getSourceFileName());
            command.addAll(List.of(runCommands));

            ProcessBuilder pb = new ProcessBuilder(command);
            long startTime = System.currentTimeMillis();
            Process process = pb.start();

            // Pipe stdin into container
            if (stdin != null && !stdin.isEmpty()) {
                try (OutputStream os = process.getOutputStream()) {
                    os.write(stdin.getBytes(StandardCharsets.UTF_8));
                    os.flush();
                } catch (IOException ignored) {}
            } else {
                process.getOutputStream().close();
            }

            StreamCapture stdoutCapture = new StreamCapture(process.getInputStream(), MAX_OUTPUT_BYTES);
            StreamCapture stderrCapture = new StreamCapture(process.getErrorStream(), MAX_OUTPUT_BYTES);
            Thread outThread = new Thread(stdoutCapture);
            Thread errThread = new Thread(stderrCapture);
            outThread.start();
            errThread.start();

            boolean finished = process.waitFor(timeoutSeconds, TimeUnit.SECONDS);
            long executionTimeMs = System.currentTimeMillis() - startTime;

            if (!finished) {
                process.destroyForcibly();
                return ExecutionResult.builder()
                        .language(strategy.getLanguage())
                        .timedOut(true)
                        .exitCode(-1)
                        .executionTimeMs(executionTimeMs)
                        .stderr("Execution timed out after " + timeoutSeconds + " seconds")
                        .build();
            }

            outThread.join(1000);
            errThread.join(1000);

            return ExecutionResult.builder()
                    .language(strategy.getLanguage())
                    .stdout(stdoutCapture.getContent())
                    .stderr(stderrCapture.getContent())
                    .exitCode(process.exitValue())
                    .executionTimeMs(executionTimeMs)
                    .timedOut(false)
                    .build();

        } catch (Exception e) {
            log.error("Docker container execution failed: {}. Falling back to local execution.", e.getMessage());
            return strategy.executeLocally(code, stdin, timeoutSeconds);
        } finally {
            if (tempDir != null) {
                deleteRecursively(tempDir);
            }
        }
    }

    /**
     * Checks if Docker daemon is running and responsive.
     */
    public boolean isDockerAvailable() {
        try {
            Process p = new ProcessBuilder("docker", "info").start();
            return p.waitFor(3, TimeUnit.SECONDS) && p.exitValue() == 0;
        } catch (Exception e) {
            return false;
        }
    }

    private void deleteRecursively(Path dir) {
        try (var stream = Files.walk(dir)) {
            stream.sorted(Comparator.reverseOrder())
                    .map(Path::toFile)
                    .forEach(File::delete);
        } catch (IOException e) {
            log.warn("Failed to clean up temporary directory {}: {}", dir, e.getMessage());
        }
    }

    /**
     * Helper to read stream up to maxBytes to avoid memory exhaustion.
     */
    private static class StreamCapture implements Runnable {
        private final InputStream stream;
        private final int maxBytes;
        private final ByteArrayOutputStream buffer = new ByteArrayOutputStream();

        public StreamCapture(InputStream stream, int maxBytes) {
            this.stream = stream;
            this.maxBytes = maxBytes;
        }

        @Override
        public void run() {
            try (stream) {
                byte[] buf = new byte[1024];
                int read;
                int total = 0;
                while ((read = stream.read(buf)) != -1) {
                    if (total + read > maxBytes) {
                        buffer.write(buf, 0, maxBytes - total);
                        buffer.write("\n... [Output truncated (exceeded 512KB limit)]".getBytes(StandardCharsets.UTF_8));
                        break;
                    }
                    buffer.write(buf, 0, read);
                    total += read;
                }
            } catch (IOException ignored) {}
        }

        public String getContent() {
            return buffer.toString(StandardCharsets.UTF_8);
        }
    }
}
