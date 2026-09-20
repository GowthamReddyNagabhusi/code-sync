import { useState, useCallback } from 'react';
import { aiAssistantService } from '../services/api';

/**
 * @typedef {'review' | 'bugs' | 'complexity' | 'hint'} AiAnalysisCategory
 */

/**
 * Hook to manage AI code assistance operations.
 * 
 * @returns {{
 *   isAnalyzing: boolean,
 *   aiResult: { analysis: string, type: AiAnalysisCategory, processingTimeMs?: number } | null,
 *   requestAnalysis: (category: AiAnalysisCategory, code: string, language: string) => Promise<void>,
 *   clearAnalysis: () => void,
 * }}
 */
export function useAiAssistant() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const requestAnalysis = useCallback(async (category, code, language) => {
    setIsAnalyzing(true);
    setAiResult(null);

    const categoryHandlers = {
      review: aiAssistantService.reviewCode,
      bugs: aiAssistantService.detectBugs,
      complexity: aiAssistantService.analyzeComplexity,
      hint: aiAssistantService.generateHint,
    };

    const runAnalysis = categoryHandlers[category];
    if (!runAnalysis) {
      console.warn(`Unrecognized AI analysis category requested: ${category}`);
      setIsAnalyzing(false);
      return;
    }

    try {
      const response = await runAnalysis({ code, language });
      setAiResult(response);
    } catch (analysisError) {
      setAiResult({
        analysis: `AI Analysis Failed: ${analysisError.message || 'Unknown error'}`,
        type: category,
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const clearAnalysis = useCallback(() => {
    setAiResult(null);
  }, []);

  return {
    isAnalyzing,
    aiResult,
    requestAnalysis,
    clearAnalysis,
  };
}
