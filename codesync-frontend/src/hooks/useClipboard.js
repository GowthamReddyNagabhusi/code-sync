import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Hook for copying text to the clipboard with an automatic timeout reset.
 * 
 * @param {number} resetDelayMs Duration before resetting copy indicator
 * @returns {{ copiedValue: string | null, copyToClipboard: (text: string) => Promise<boolean>, isCopied: (text?: string) => boolean }}
 */
export function useClipboard(resetDelayMs = 2000) {
  const [copiedValue, setCopiedValue] = useState(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const copyToClipboard = useCallback(async (textToCopy) => {
    if (!navigator?.clipboard) {
      console.warn('Clipboard API not available in current environment');
      return false;
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedValue(textToCopy);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setCopiedValue(null);
      }, resetDelayMs);

      return true;
    } catch (clipboardError) {
      console.error('Failed to copy to clipboard:', clipboardError);
      return false;
    }
  }, [resetDelayMs]);

  const isCopied = useCallback((targetText) => {
    if (targetText === undefined) {
      return Boolean(copiedValue);
    }
    return copiedValue === targetText;
  }, [copiedValue]);

  return { copiedValue, copyToClipboard, isCopied };
}
