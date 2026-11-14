package com.codesync;

import com.codesync.module.execution.model.ExecutionResult;
import com.codesync.module.execution.service.DockerSandboxService;
import com.codesync.module.execution.strategy.CppExecutionStrategy;
import com.codesync.module.execution.strategy.ExecutionStrategyFactory;
import com.codesync.module.execution.strategy.JavaExecutionStrategy;
import com.codesync.module.execution.strategy.PythonExecutionStrategy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class DockerSandboxServiceTest {

    private DockerSandboxService sandboxService;

    @BeforeEach
    void setUp() {
        ExecutionStrategyFactory factory = new ExecutionStrategyFactory(List.of(
                new PythonExecutionStrategy(),
                new JavaExecutionStrategy(),
                new CppExecutionStrategy()
        ));
        sandboxService = new DockerSandboxService(factory);
    }

    @Test
    void testExecutePythonInDocker() {
        assertTrue(sandboxService.isDockerAvailable(), "Docker daemon must be responsive");

        ExecutionResult result = sandboxService.execute("print('Hello from Python in Docker!')", "python", null, 10);

        assertNotNull(result);
        assertEquals(0, result.getExitCode());
        assertFalse(result.isTimedOut());
        assertTrue(result.getStdout().contains("Hello from Python in Docker!"));
    }

    @Test
    void testExecuteJavaInDocker() {
        assertTrue(sandboxService.isDockerAvailable(), "Docker daemon must be responsive");

        String javaCode = """
                public class Main {
                    public static void main(String[] args) {
                        System.out.println("Hello from Java in Docker!");
                    }
                }
                """;

        ExecutionResult result = sandboxService.execute(javaCode, "java", null, 15);

        assertNotNull(result);
        assertEquals(0, result.getExitCode());
        assertFalse(result.isTimedOut());
        assertTrue(result.getStdout().contains("Hello from Java in Docker!"));
    }

    @Test
    void testExecuteCppInDocker() {
        assertTrue(sandboxService.isDockerAvailable(), "Docker daemon must be responsive");

        String cppCode = """
                #include <iostream>
                int main() {
                    std::cout << "Hello from C++ in Docker!" << std::endl;
                    return 0;
                }
                """;

        ExecutionResult result = sandboxService.execute(cppCode, "cpp", null, 15);

        assertNotNull(result);
        assertEquals(0, result.getExitCode());
        assertFalse(result.isTimedOut());
        assertTrue(result.getStdout().contains("Hello from C++ in Docker!"));
    }
}
