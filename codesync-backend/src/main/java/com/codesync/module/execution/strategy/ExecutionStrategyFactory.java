package com.codesync.module.execution.strategy;

import com.codesync.common.exception.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Factory that resolves the correct execution strategy by language name.
 */
@Component
public class ExecutionStrategyFactory {

    private final Map<String, CodeExecutionStrategy> strategies;

    public ExecutionStrategyFactory(List<CodeExecutionStrategy> strategyList) {
        this.strategies = strategyList.stream()
                .collect(Collectors.toMap(
                        CodeExecutionStrategy::getLanguage,
                        Function.identity()
                ));
    }

    public CodeExecutionStrategy getStrategy(String language) {
        CodeExecutionStrategy strategy = strategies.get(language.toLowerCase());
        if (strategy == null) {
            throw ApiException.badRequest(
                    "Unsupported language: " + language +
                    ". Supported: " + String.join(", ", strategies.keySet()));
        }
        return strategy;
    }

    public boolean isSupported(String language) {
        return strategies.containsKey(language.toLowerCase());
    }
}
