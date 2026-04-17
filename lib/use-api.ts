"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import type { ApiResponse } from "./api-client";

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Custom hook for fetching API data with loading/error states.
 * Automatically fetches on mount and provides a refetch function.
 */
export function useApi<T>(
  fetcher: () => Promise<ApiResponse<T>>,
  deps: unknown[] = [],
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      if (!mountedRef.current) return;
      if (result.success && result.data !== undefined) {
        setData(result.data);
      } else {
        setError(result.message || "Failed to fetch data.");
      }
    } catch (err: unknown) {
      if (!mountedRef.current) return;
      const msg = err instanceof Error ? err.message : "Network error.";
      setError(msg);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
