package com.codesync.module.execution.strategy;

import com.codesync.common.exception.ApiException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ExecutionStrategyFactoryTest {

    private ExecutionStrategyFactory factory;

    @BeforeEach
    void setUp() {
        factory = new ExecutionStrategyFactory(List.of(
                new PythonExecutionStrategy(),
                new JavaExecutionStrategy(),
                new CppExecutionStrategy()
        ));
    }

    @Test
    void testResolvePythonStrategy() {
        CodeExecutionStrategy strategy = factory.getStrategy("python");
        assertNotNull(strategy);
        assertEquals("python", strategy.getLanguage());
        assertEquals("main.py", strategy.getSourceFileName());
    }

    @Test
    void testResolveJavaStrategy() {
        CodeExecutionStrategy strategy = factory.getStrategy("java");
        assertNotNull(strategy);
        assertEquals("java", strategy.getLanguage());
        assertEquals("Main.java", strategy.getSourceFileName());
    }

    @Test
    void testResolveCppStrategy() {
        CodeExecutionStrategy strategy = factory.getStrategy("cpp");
        assertNotNull(strategy);
        assertEquals("cpp", strategy.getLanguage());
        assertEquals("main.cpp", strategy.getSourceFileName());
    }

    @Test
    void testResolveCaseInsensitive() {
        CodeExecutionStrategy strategy = factory.getStrategy("PYTHON");
        assertNotNull(strategy);
        assertEquals("python", strategy.getLanguage());
    }

    @Test
    void testUnsupportedLanguageThrowsApiException() {
        assertThrows(ApiException.class, () -> factory.getStrategy("ruby"));
        assertThrows(ApiException.class, () -> factory.getStrategy("rust"));
    }
}
