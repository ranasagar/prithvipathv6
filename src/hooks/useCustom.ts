import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom Hooks for Dynamic Enhancements
 */

/**
 * Hook for draft auto-save functionality
 * Saves draft to localStorage with debouncing
 */
export function useDraft<T>(
  draftKey: string,
  initialValue: T,
  autoSaveDelay = 1000
) {
  const [value, setValue] = React.useState<T>(() => {
    const saved = localStorage.getItem(draftKey);
    return saved ? JSON.parse(saved) : initialValue;
  });

  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  const saveDraft = useCallback((newValue: T) => {
    setValue(newValue);
    
    clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      localStorage.setItem(draftKey, JSON.stringify(newValue));
    }, autoSaveDelay);
  }, [draftKey, autoSaveDelay]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(draftKey);
    setValue(initialValue);
  }, [draftKey, initialValue]);

  useEffect(() => {
    return () => clearTimeout(saveTimeoutRef.current);
  }, []);

  return { value, saveDraft, clearDraft };
}

/**
 * Hook for debounced callbacks
 */
export function useDebounceCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
) {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedCallback = useCallback((...args: any[]) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  return debouncedCallback as T;
}

/**
 * Hook for infinite scroll pagination
 */
export function useInfiniteScroll(
  observerTarget: React.RefObject<HTMLDivElement>,
  onLoadMore: () => void,
  enabled = true
) {
  useEffect(() => {
    if (!enabled || !observerTarget.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(observerTarget.current);

    return () => observer.disconnect();
  }, [observerTarget, onLoadMore, enabled]);
}

/**
 * Hook for async operations with loading state
 */
export function useAsync<T, E = string>(
  asyncFunction: () => Promise<T>,
  immediate = true
) {
  const [status, setStatus] = React.useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [value, setValue] = React.useState<T | null>(null);
  const [error, setError] = React.useState<E | null>(null);

  const execute = useCallback(async () => {
    setStatus('pending');
    setValue(null);
    setError(null);
    try {
      const response = await asyncFunction();
      setValue(response);
      setStatus('success');
      return response;
    } catch (error) {
      setError(error as E);
      setStatus('error');
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { execute, status, value, error };
}

/**
 * Hook to track previous value
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
