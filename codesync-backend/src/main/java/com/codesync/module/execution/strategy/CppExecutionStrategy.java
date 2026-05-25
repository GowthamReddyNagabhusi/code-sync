package com.codesync.module.execution.strategy;

import com.codesync.module.execution.model.ExecutionResult;
import org.springframework.stereotype.Component;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.TimeUnit;

@Component
public class CppExecutionStrategy implements CodeExecutionStrategy {

    @Override
    public String getLanguage() {
        return "cpp";
    }

    @Override
    public String getDockerImage() {
        return "codesync-cpp-runner:latest";
    }

    @Override
    public String getSourceFileName() {
        return "main.cpp";
    }

    @Override
    public String[] getBuildAndRunCommands(String sourceFile) {
        return new String[]{
                "sh", "-c",
                "g++ -o /tmp/a.out " + sourceFile + " && /tmp/a.out"
        };
    }

    @Override
    public ExecutionResult executeLocally(String code, String stdin, long timeoutSeconds) {
        Path tempDir = null;
        try {
            tempDir = Files.createTempDirectory("codesync-cpp-");
            Path sourceFile = tempDir.resolve("main.cpp");
            Files.writeString(sourceFile, code);

            String outputName = tempDir.resolve("a.out").toString();
            if (System.getProperty("os.name").toLowerCase().contains("win")) {
                outputName = tempDir.resolve("a.exe").toString();
            }

            // Compile
            ProcessBuilder compileBuilder = new ProcessBuilder(
                    "g++", "-o", outputName, sourceFile.toString());
            compileBuilder.directory(tempDir.toFile());

            long startTime = System.currentTimeMillis();
            Process compileProcess = compileBuilder.start();

            boolean compileFinished = compileProcess.waitFor(timeoutSeconds, TimeUnit.SECONDS);
            if (!compileFinished) {
                compileProcess.destroyForcibly();
                return ExecutionResult.builder()
                        .timedOut(true)
                        .stderr("Compilation timed out")
                        .exitCode(-1)
                        .language("cpp")
                        .build();
            }

            if (compileProcess.exitValue() != 0) {
                return ExecutionResult.builder()
                        .stderr(readStream(compileProcess.getErrorStream()))
                        .exitCode(compileProcess.exitValue())
                        .executionTimeMs(System.currentTimeMillis() - startTime)
                        .language("cpp")
                        .build();
            }

            // Run
            ProcessBuilder runBuilder = new ProcessBuilder(outputName);
            runBuilder.directory(tempDir.toFile());

            Process runProcess = runBuilder.start();

            if (stdin != null && !stdin.isEmpty()) {
                runProcess.getOutputStream().write(stdin.getBytes());
                runProcess.getOutputStream().close();
            }

            boolean runFinished = runProcess.waitFor(timeoutSeconds, TimeUnit.SECONDS);
            long elapsed = System.currentTimeMillis() - startTime;

            if (!runFinished) {
                runProcess.destroyForcibly();
                return ExecutionResult.builder()
                        .timedOut(true)
                        .stderr("Execution timed out after " + timeoutSeconds + "s")
                        .exitCode(-1)
                        .executionTimeMs(elapsed)
                        .language("cpp")
                        .build();
            }

            return ExecutionResult.builder()
                    .stdout(readStream(runProcess.getInputStream()))
                    .stderr(readStream(runProcess.getErrorStream()))
                    .exitCode(runProcess.exitValue())
                    .executionTimeMs(elapsed)
                    .language("cpp")
                    .build();

        } catch (Exception e) {
            return ExecutionResult.builder()
                    .stderr("Internal error: " + e.getMessage())
                    .exitCode(-1)
                    .language("cpp")
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
