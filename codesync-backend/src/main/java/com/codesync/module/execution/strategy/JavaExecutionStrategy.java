package com.codesync.module.execution.strategy;

import com.codesync.module.execution.model.ExecutionResult;
import org.springframework.stereotype.Component;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.TimeUnit;

@Component
public class JavaExecutionStrategy implements CodeExecutionStrategy {

    @Override
    public String getLanguage() {
        return "java";
    }

    @Override
    public String getDockerImage() {
        return "codesync-java-runner:latest";
    }

    @Override
    public String getSourceFileName() {
        return "Main.java";
    }

    @Override
    public String[] getBuildAndRunCommands(String sourceFile) {
        return new String[]{
                "sh", "-c",
                "javac " + sourceFile + " && java -cp $(dirname " + sourceFile + ") Main"
        };
    }

    @Override
    public ExecutionResult executeLocally(String code, String stdin, long timeoutSeconds) {
        Path tempDir = null;
        try {
            tempDir = Files.createTempDirectory("codesync-java-");
            Path sourceFile = tempDir.resolve("Main.java");
            Files.writeString(sourceFile, code);

            // Compile
            ProcessBuilder compileBuilder = new ProcessBuilder("javac", sourceFile.toString());
            compileBuilder.directory(tempDir.toFile());
            compileBuilder.redirectErrorStream(false);

            long startTime = System.currentTimeMillis();
            Process compileProcess = compileBuilder.start();

            boolean compileFinished = compileProcess.waitFor(timeoutSeconds, TimeUnit.SECONDS);
            if (!compileFinished) {
                compileProcess.destroyForcibly();
                return ExecutionResult.builder()
                        .timedOut(true)
                        .stderr("Compilation timed out")
                        .exitCode(-1)
                        .language("java")
                        .build();
            }

            if (compileProcess.exitValue() != 0) {
                String compileError = readStream(compileProcess.getErrorStream());
                return ExecutionResult.builder()
                        .stderr(compileError)
                        .exitCode(compileProcess.exitValue())
                        .executionTimeMs(System.currentTimeMillis() - startTime)
                        .language("java")
                        .build();
            }

            // Run
            ProcessBuilder runBuilder = new ProcessBuilder("java", "-cp", tempDir.toString(), "Main");
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
                        .language("java")
                        .build();
            }

            return ExecutionResult.builder()
                    .stdout(readStream(runProcess.getInputStream()))
                    .stderr(readStream(runProcess.getErrorStream()))
                    .exitCode(runProcess.exitValue())
                    .executionTimeMs(elapsed)
                    .language("java")
                    .build();

        } catch (Exception e) {
            return ExecutionResult.builder()
                    .stderr("Internal error: " + e.getMessage())
                    .exitCode(-1)
                    .language("java")
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
