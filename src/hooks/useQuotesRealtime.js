import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { fetchThemesAndQuotes } from "../lib/data";

export function useQuotesRealtime() {
  const [themes, setThemes] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const debounceRef = useRef(null);

  const refresh = useCallback(async ({ silent = false } = {}) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      setError("");
      const result = await fetchThemesAndQuotes();
      setThemes(result.themes);
      setQuotes(result.quotes);
    } catch (err) {
      setError(err?.message || "Impossible de charger les données.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    const scheduleRefresh = () => {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = window.setTimeout(
        () => refresh({ silent: true }),
        180
      );
    };

    const channel = supabase
      .channel("kodem-quotes-v2-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "themes" },
        scheduleRefresh
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "citations" },
        scheduleRefresh
      )
      .subscribe();

    return () => {
      window.clearTimeout(debounceRef.current);
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  return {
    themes,
    quotes,
    loading,
    refreshing,
    error,
    refresh
  };
}
