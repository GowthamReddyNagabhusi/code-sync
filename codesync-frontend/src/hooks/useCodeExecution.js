import { useState, useCallback } from 'react';
import { executionService } from '../services/api';

/**
 * Hook to manage code sandbox execution lifecycle.
 * 
 * @returns {{
 *   isExecuting: boolean,
 *   executionResult: { stdout?: string, stderr?: string, success?: boolean, exitCode?: number, executionTimeMs?: number, timedOut?: boolean } | null,
 *   executeCode: (code: string, language: string, stdin?: string) => Promise<void>,
 *   clearExecution: () => void,
 * }}
 */
export function useCodeExecution() {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);

  const executeCode = useCallback(async (code, language, stdin = '') => {
    setIsExecuting(true);
    setExecutionResult(null);

    try {
      const response = await executionService.executeCode({ code, language, stdin });
      setExecutionResult(response);
    } catch (executionError) {
      setExecutionResult({
        stderr: executionError.message || 'Execution error encountered',
        success: false,
        exitCode: -1,
      });
    } finally {
      setIsExecuting(false);
    }
  }, []);

  const clearExecution = useCallback(() => {
    setExecutionResult(null);
  }, []);

  return {
    isExecuting,
    executionResult,
    executeCode,
    clearExecution,
  };
}
