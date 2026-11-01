import { useState } from "react";
export function useAsync() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const run = async <T>(
    work: () => Promise<T>,
    success?: (value: T) => void,
  ) => {
    setLoading(true);
    setError("");
    try {
      const value = await work();
      success?.(value);
      return value;
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Something went wrong. Try again.",
      );
      return undefined;
    } finally {
      setLoading(false);
    }
  };
  return { loading, error, setError, run };
}
