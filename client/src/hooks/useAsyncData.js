/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useState } from "react";

export const useAsyncData = (loader, deps = []) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await loader();
      setData(result);
    } catch (err) {
      setError(err.message || "Request failed.");
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, error, loading, refresh };
};
