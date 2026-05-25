package com.codesync.module.execution.strategy;

import com.codesync.module.execution.model.ExecutionResult;

/**
 * Strategy interface for executing code in different languages.
 * Each implementation knows how to compile (if needed) and run code
 * for its specific language.
 */
public interface CodeExecutionStrategy {

    /**
     * Get the language this strategy handles.
     */
    String getLanguage();

    /**
     * Get the Docker image name for this language.
     */
    String getDockerImage();

    /**
     * Get the filename to write the source code to.
     */
    String getSourceFileName();

    /**
     * Build the docker exec command to compile and run the code.
     * Returns the shell commands to execute inside the container.
     */
    String[] getBuildAndRunCommands(String sourceFile);

    /**
     * Execute code using a process-based approach (fallback when Docker is unavailable).
     */
    ExecutionResult executeLocally(String code, String stdin, long timeoutSeconds);
}
