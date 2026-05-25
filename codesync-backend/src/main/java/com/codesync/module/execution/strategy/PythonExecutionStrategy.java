package com.codesync.module.execution.strategy;

import com.codesync.module.execution.model.ExecutionResult;
import org.springframework.stereotype.Component;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.TimeUnit;

@Component
public class PythonExecutionStrategy implements CodeExecutionStrategy {

    @Override
    public String getLanguage() {
        return "python";
    }

    @Override
    public String getDockerImage() {
        return "codesync-python-runner:latest";
    }

    @Override
    public String getSourceFileName() {
        return "main.py";
    }

    @Override
    public String[] getBuildAndRunCommands(String sourceFile) {
        return new String[]{"python3", sourceFile};
    }

    @Override
    public ExecutionResult executeLocally(String code, String stdin, long timeoutSeconds) {
        Path tempDir = null;
        try {
            tempDir = Files.createTempDirectory("codesync-python-");
            Path sourceFile = tempDir.resolve("main.py");
            Files.writeString(sourceFile, code);

            ProcessBuilder processBuilder = new ProcessBuilder("python3", sourceFile.toString());
            // Fallback to "python" on Windows
            if (System.getProperty("os.name").toLowerCase().contains("win")) {
                processBuilder = new ProcessBuilder("python", sourceFile.toString());
            }
            processBuilder.directory(tempDir.toFile());

            long startTime = System.currentTimeMillis();
            Process process = processBuilder.start();

            if (stdin != null && !stdin.isEmpty()) {
                process.getOutputStream().write(stdin.getBytes());
                process.getOutputStream().close();
            }

            boolean finished = process.waitFor(timeoutSeconds, TimeUnit.SECONDS);
            long elapsed = System.currentTimeMillis() - startTime;

            if (!finished) {
                process.destroyForcibly();
                return ExecutionResult.builder()
                        .timedOut(true)
                        .stderr("Execution timed out after " + timeoutSeconds + "s")
                        .exitCode(-1)
                        .executionTimeMs(elapsed)
                        .language("python")
                        .build();
            }

            return ExecutionResult.builder()
                    .stdout(readStream(process.getInputStream()))
                    .stderr(readStream(process.getErrorStream()))
                    .exitCode(process.exitValue())
                    .executionTimeMs(elapsed)
                    .language("python")
                    .build();

        } catch (Exception e) {
            return ExecutionResult.builder()
                    .stderr("Internal error: " + e.getMessage())
                    .exitCode(-1)
                    .language("python")
                    .build();
        } finally {
            cleanupDir(tempDir);
        }
    }

    private String readStream(InputStream is) throws IOException {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(is))) {
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line).append("\n");
            }
            return sb.toString().trim();
        }
    }

    private void cleanupDir(Path dir) {
        if (dir == null) return;
        try {
            Files.walk(dir)
                    .sorted(java.util.Comparator.reverseOrder())
                    .map(Path::toFile)
                    .forEach(File::delete);
        } catch (IOException ignored) {
        }
    }
}
