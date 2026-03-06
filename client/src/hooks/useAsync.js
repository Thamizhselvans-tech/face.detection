import { useState, useCallback } from 'react';

/**
 * Generic hook for managing async operations.
 * Returns { loading, error, run }
 *
 * Usage:
 *   const { loading, error, run } = useAsync();
 *   const result = await run(() => api.post(...));
 */
const useAsync = () => {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const run = useCallback(async (asyncFn) => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFn();
      return result;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error   ||
        err.message                 ||
        'Something went wrong. Please try again.';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { loading, error, run, clearError };
};

export default useAsync;
